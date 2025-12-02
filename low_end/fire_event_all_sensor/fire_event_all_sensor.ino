//fire_event_all_sensor
// dht22 센서 3개 평균치 전달 + MQ2 센서 감지값 전달

#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <time.h>  // 시간 함수 사용 (timestamp 생성용)

// ---------------------------
// 핀 설정
// ---------------------------
#define DHTPIN_1 4
#define DHTPIN_2 16
#define DHTPIN_3 17
#define MQ2_PIN 34

// ---------------------------
// DHT22 설정
// ---------------------------
#define DHTTYPE DHT22
DHT dht1(DHTPIN_1, DHTTYPE);
DHT dht2(DHTPIN_2, DHTTYPE);
DHT dht3(DHTPIN_3, DHTTYPE);

// ---------------------------
// Wi-Fi & MQTT 설정
// ---------------------------
const char* ssid = "";
const char* password = "";
const char* mqtt_server = "";  // 브로커 IP (노트북 or 라즈베리파이)

WiFiClient espClient;
PubSubClient client(espClient);

// ---------------------------
// 필터링 변수
// ---------------------------
#define FILTER_SIZE 5
float tempBuffer[FILTER_SIZE] = {0};
float gasBuffer[FILTER_SIZE] = {0};
int filterIndex = 0;

// ---------------------------
// MQTT 설정
// ---------------------------
const char* topic_pub = "fire/event";

// ---------------------------
// 시간 설정 (timestamp)
// ---------------------------
void initTime() {
  configTime(9 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  Serial.print("⏳ 시간 동기화 중");
  time_t now = time(nullptr);
  while (now < 100000) {  // 1970년 이후 초 단위
    delay(500);
    Serial.print(".");
    now = time(nullptr);
  }
  Serial.println("✅ 시간 동기화 완료");
}

String getTimestamp() {
  time_t now = time(nullptr);
  struct tm timeinfo;
  localtime_r(&now, &timeinfo);
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%S", &timeinfo);
  return String(buf);
}

// ---------------------------
// MQTT 재연결 함수
// ---------------------------
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔄 MQTT Connecting...");
    if (client.connect("ESP32_Client")) {
      Serial.println("✅ connected!");
    } else {
      Serial.print("❌ failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 3 seconds...");
      delay(3000);
    }
  }
}

// ---------------------------
// 이동 평균 필터
// ---------------------------
float movingAverage(float* buffer, int size, float newValue) {
  buffer[filterIndex % size] = newValue;
  float sum = 0;
  for (int i = 0; i < size; i++) sum += buffer[i];
  return sum / size;
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 - DHT22 x3 + MQ-2 + MQTT + Timestamp");

  // DHT 시작
  dht1.begin(); dht2.begin(); dht3.begin();

  // Wi-Fi 연결
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected");

  // 시간 동기화
  initTime();

  // MQTT 연결
  client.setServer(mqtt_server, 1883);
  reconnect();
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // ---------------------------
  // DHT22 데이터 읽기
  // ---------------------------
  float t1 = dht1.readTemperature();
  float h1 = dht1.readHumidity();
  float t2 = dht2.readTemperature();
  float h2 = dht2.readHumidity();
  float t3 = dht3.readTemperature();
  float h3 = dht3.readHumidity();
  int gasRaw = analogRead(MQ2_PIN);

  if (isnan(t1) || isnan(t2) || isnan(t3)) {
    Serial.println("❌ Failed to read from one or more DHT sensors!");
    delay(2000);
    return;
  }

  // ---------------------------
  // 평균 계산
  // ---------------------------
  float avgTemp = (t1 + t2 + t3) / 3.0;
  float avgHum = (h1 + h2 + h3) / 3.0;
  float gasVoltage = gasRaw * (3.3 / 4095.0);
  float gasPPM = gasVoltage * 300; // 단순 스케일링 (예시)

  // ---------------------------
  // 이동평균 필터 적용
  // ---------------------------
  float tempFiltered = movingAverage(tempBuffer, FILTER_SIZE, avgTemp);
  float gasFiltered = movingAverage(gasBuffer, FILTER_SIZE, gasPPM);
  filterIndex++;

  // ---------------------------
  // 이벤트 판단
  // ---------------------------
  float TEMP_THRESHOLD = 21.0; 
  float GAS_THRESHOLD = 900.0;
  String eventType = "none";

  bool tempExceeded = tempFiltered > TEMP_THRESHOLD;
  bool gasExceeded = gasFiltered > GAS_THRESHOLD;

  if (tempExceeded && gasExceeded) eventType = "both";
  else if (tempExceeded) eventType = "temperature";
  else if (gasExceeded) eventType = "gas";

  // ---------------------------
  // JSON 메시지 생성
  // ---------------------------
  String timestamp = getTimestamp();

  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"device_id\":\"ESP32_01\",\"temperature\":%.2f,"
    "\"humidity\":%.2f,\"gas\":%.2f,"
    "\"timestamp\":\"%s\",\"event_sensor\":\"%s\"}",
    tempFiltered, avgHum, gasFiltered,
    timestamp.c_str(), eventType.c_str());

  // ---------------------------
  // MQTT Publish
  // ---------------------------
  client.publish(topic_pub, payload);

  // ---------------------------
  // 시리얼 출력
  // ---------------------------
  Serial.println("===================================");
  Serial.printf("🌡 Temp Avg: %.2f | Hum Avg: %.2f | Gas: %.2f\n", tempFiltered, avgHum, gasFiltered);
  Serial.printf("📅 Time: %s\n", timestamp.c_str());
  Serial.printf("🔥 Event: %s\n", eventType.c_str());
  Serial.printf("📤 MQTT Sent: %s\n", payload);
  Serial.println("===================================");

  delay(3000);
}
