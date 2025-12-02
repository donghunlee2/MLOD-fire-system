#include "DHT.h"

// ---------------------------
// 핀 설정
// ---------------------------
#define DHTPIN_1 4    // DHT22 #1
#define DHTPIN_2 16   // DHT22 #2
#define DHTPIN_3 17   // DHT22 #3
#define MQ2_PIN 34    // MQ-2 가스 센서 (AOUT → ESP32 ADC)

// ---------------------------
// 센서 타입 및 객체 생성
// ---------------------------
#define DHTTYPE DHT22
DHT dht1(DHTPIN_1, DHTTYPE);
DHT dht2(DHTPIN_2, DHTTYPE);
DHT dht3(DHTPIN_3, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 - DHT22 x3 + MQ-2 Test");
  dht1.begin();
  dht2.begin();
  dht3.begin();
}

void loop() {
  // ---------------------------
  // DHT22 데이터 읽기
  // ---------------------------
  float t1 = dht1.readTemperature();
  float h1 = dht1.readHumidity();
  float t2 = dht2.readTemperature();
  float h2 = dht2.readHumidity();
  float t3 = dht3.readTemperature();
  float h3 = dht3.readHumidity();

  // ---------------------------
  // MQ-2 데이터 읽기 (0~4095)
  // ---------------------------
  int gas = analogRead(MQ2_PIN);
  float voltage = gas * (3.3 / 4095.0);

  // ---------------------------
  // 데이터 유효성 검사
  // ---------------------------
  if (isnan(t1) || isnan(h1) || isnan(t2) || isnan(h2) || isnan(t3) || isnan(h3)) {
    Serial.println("❌ Failed to read from one or more DHT sensors!");
    delay(2000);
    return;
  }

  // ---------------------------
  // 결과 출력
  // ---------------------------
  Serial.println("===================================");
  Serial.print("🌡 Sensor1: "); Serial.print(t1); Serial.print("°C, ");
  Serial.print("💧 "); Serial.print(h1); Serial.println("%");
  Serial.print("🌡 Sensor2: "); Serial.print(t2); Serial.print("°C, ");
  Serial.print("💧 "); Serial.print(h2); Serial.println("%");
  Serial.print("🌡 Sensor3: "); Serial.print(t3); Serial.print("°C, ");
  Serial.print("💧 "); Serial.print(h3); Serial.println("%");
  Serial.println("-----------------------------------");
  Serial.print("💨 MQ-2 Gas Sensor ADC: "); Serial.print(gas);
  Serial.print("  Voltage: "); Serial.print(voltage); Serial.println(" V");
  Serial.println("===================================");
  delay(2000);
}
