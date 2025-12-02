#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <ArduinoJson.h>
#include <time.h>

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

const char* mqtt_server = "";  // TOPST D3 브로커 IP

WiFiClient espClient;
PubSubClient client(espClient);

// ---------------------------
// MQTT 토픽
// ---------------------------
const char* topic_pub_event = "fire/event";
const char* topic_sub_config = "fire/config/ESP32_01";

// ---------------------------
// 이동평균 필터
// ---------------------------
#define FILTER_SIZE 5
float tempBuffer[FILTER_SIZE] = {0};
float gasBuffer[FILTER_SIZE] = {0};
int filterIndex = 0;

// ---------------------------
// 임계값 (💡원격 조정 가능)
// ---------------------------
float TEMP_THRESHOLD = 21.0;
float GAS_THRESHOLD  = 900.0;

// ---------------------------
// 시간 함수
// ---------------------------
void initTime() {
  configTime(9 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  time_t now = time(nullptr);

  while (now < 100000) {
    Serial.print(".");
    delay(500);
    now = time(nullptr);
  }
  Serial.println("\n⏰ 시간 동기화 완료");
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
// 이동평균 필터 함수
// ---------------------------
float movingAverage(float* buffer, int size, float newValue) {
  buffer[filterIndex % size] = newValue;
  float sum = 0;
  for (int i = 0; i < size; i++) sum += buffer[i];
  return sum / size;
}

// ---------------------------
// MQTT 콜백 (🔥 config 수신)
// ---------------------------
void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("\n📩 MQTT 수신: ");
  Serial.println(topic);

  String payload;
  for (int i = 0; i < length; i++) {
    payload += (char)message[i];
  }

  Serial.print("📦 Payload: ");
  Serial.println(payload);

  if (String(topic) == topic_sub_config) {
    StaticJsonDocument<200> doc;
    DeserializationError err = deserializeJson(doc, payload);

    if (err) {
      Serial.println("❌ JSON 파싱 실패");
      return;
    }

    // 🔥 프론트에서 온 임계값 업데이트
    if (doc.containsKey("TEMP_THRESHOLD"))
      TEMP_THRESHOLD = doc["TEMP_THRESHOLD"].as<float>();

    if (doc.containsKey("GAS_THRESHOLD"))
      GAS_THRESHOLD = doc["GAS_THRESHOLD"].as<float>();

    Serial.println("⚙ 임계값 업데이트 완료!");
    Serial.printf("   ➤ TEMP_THRESHOLD = %.2f\n", TEMP_THRESHOLD);
    Serial.printf("   ➤ GAS_THRESHOLD  = %.2f\n", GAS_THRESHOLD);
  }
}

// ---------------------------
// MQTT 재연결
// ---------------------------
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔄 MQTT Connecting...");
    if (client.connect("ESP32_Client")) {
      Serial.println("Connected!");

      // 🔥 config 토픽 구독
      client.subscribe(topic_sub_config);
      Serial.println("📡 Subscribed: fire/config/ESP32_01");

    } else {
      Serial.print("❌ failed rc=");
      Serial.print(client.state());
      Serial.println(" retry in 3 seconds...");
      delay(3000);
    }
  }
}

// ---------------------------
// SETUP
// ---------------------------
void setup() {
  Serial.begin(115200);
  Serial.println("🔥 ESP32 Fire Sensor + Threshold Remote Update");

  dht1.begin(); dht2.begin(); dht3.begin();

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println("\n📶 WiFi Connected");

  initTime();

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  reconnect();
}

// ---------------------------
// LOOP
// ---------------------------
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  // 센서 읽기
  float t1 = dht1.readTemperature();
  float h1 = dht1.readHumidity();
  float t2 = dht2.readTemperature();
  float h2 = dht2.readHumidity();
  float t3 = dht3.readTemperature();
  float h3 = dht3.readHumidity();

  int gasRaw = analogRead(MQ2_PIN);

  if (isnan(t1) || isnan(t2) || isnan(t3)) {
    Serial.println("❌ DHT Read Error");
    delay(2000);
    return;
  }

  float avgTemp = (t1 + t2 + t3) / 3.0;
  float avgHum  = (h1 + h2 + h3) / 3.0;

  float gasVoltage = gasRaw * (3.3 / 4095.0);
  float gasPPM = gasVoltage * 300;

  // 필터 적용
  float tempFiltered = movingAverage(tempBuffer, FILTER_SIZE, avgTemp);
  float gasFiltered  = movingAverage(gasBuffer, FILTER_SIZE, gasPPM);
  filterIndex++;

  // 이벤트 판단
  String eventType = "none";
  bool tempExceeded = tempFiltered > TEMP_THRESHOLD;
  bool gasExceeded  = gasFiltered > GAS_THRESHOLD;

  if (tempExceeded && gasExceeded) eventType = "both";
  else if (tempExceeded) eventType = "temperature";
  else if (gasExceeded) eventType = "gas";

  // JSON 구성
  String timestamp = getTimestamp();

  char payload[256];
  snprintf(payload, sizeof(payload),
    "{\"device_id\":\"ESP32_01\",\"temperature\":%.2f,"
    "\"humidity\":%.2f,\"gas\":%.2f,"
    "\"timestamp\":\"%s\",\"event_sensor\":\"%s\"}",
    tempFiltered, avgHum, gasFiltered,
    timestamp.c_str(), eventType.c_str());

  // Publish
  client.publish(topic_pub_event, payload);

  // 콘솔 출력
  Serial.println("-----------------------------------");
  Serial.printf("🌡 Temp Filtered : %.2f (TH=%.2f)\n", tempFiltered, TEMP_THRESHOLD);
  Serial.printf("💨 Gas Filtered  : %.2f (TH=%.2f)\n", gasFiltered, GAS_THRESHOLD);
  Serial.printf("🔥 Event         : %s\n", eventType.c_str());
  Serial.printf("📤 MQTT Sent     : %s\n", payload);
  Serial.println("-----------------------------------");

  delay(3000);
}
