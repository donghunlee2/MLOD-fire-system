//
// Live_UI_TEST
// Func: 온도 센서가 임계치 이상의 값을 감지하면 MQTT 이벤트 전송, 연기 센서는 더미 데이터
//

#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"
#include <ArduinoJson.h>  // JSON 생성을 위한 라이브러리

// =========================
// 사용자 설정
// =========================
#define DHTPIN 25
#define DHTTYPE DHT11
#define TEMP_THRESHOLD 20.5     // 임계 온도 설정
#define GAS_DUMMY 600           // 더미 연기값

const char* ssid = "";
const char* password = "";
const char* mqtt_server = " ";  // Raspberry Pi IP (MQTT Broker)

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

// =========================
// 함수 정의
// =========================
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("📡 WiFi 연결 중: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("✅ WiFi 연결 완료");
  Serial.print("IP 주소: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("MQTT 브로커 연결 중...");
    if (client.connect("ESP32_01")) {
      Serial.println("✅ 연결 성공!");
    } else {
      Serial.print("❌ 실패, 상태 코드: ");
      Serial.print(client.state());
      Serial.println(" 2초 후 재시도");
      delay(2000);
    }
  }
}

// =========================
// JSON 메시지 생성 및 전송
// =========================
void sendSensorData(float t, float h, int gas) {
  StaticJsonDocument<256> doc;
  char buffer[256];

  // 현재 시간 (ESP32에서는 NTP 대신 millis()로 대체 가능)
  time_t now = time(nullptr);
  struct tm *timeinfo = localtime(&now);
  char timestamp[32];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%S", timeinfo);

  doc["device_id"] = "ESP32_01";
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["gas"] = gas;
  doc["timestamp"] = timestamp;

  serializeJson(doc, buffer);
  client.publish("fire/sensor", buffer);

  Serial.print("📤 전송된 데이터: ");
  Serial.println(buffer);
}

// =========================
// setup() & loop()
// =========================
void setup() {
  Serial.begin(115200);
  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  float t = dht.readTemperature();
  float h = dht.readHumidity();
  // int gas = GAS_DUMMY;  // 더미 연기 데이터
  int baseGas = 600;

  // 🔥 gas 더미 값: ±50 랜덤 변동
  int variation = random(-50, 51);  // -50 ~ +50 사이 랜덤
  int gas = baseGas + variation;

  if (isnan(t) || isnan(h)) {
    Serial.println("❌ 센서에서 데이터를 읽지 못했습니다.");
    delay(2000);
    return;
  }

  Serial.printf("🌡 온도: %.2f°C, 💧 습도: %.2f%%, 💨 연기: %d\n", t, h, gas);

  // 온도가 임계값 이상이면 이벤트 전송
  if (t >= TEMP_THRESHOLD) {
    Serial.println("🔥 온도 임계값 초과 → 이벤트 발생!");
    sendSensorData(t, h, gas);
  }

  delay(1000); // 1초마다 측정
}
