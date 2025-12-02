#include "DHT.h"

// 각 센서 핀 번호
#define DHTPIN_1 4
#define DHTPIN_2 16
#define DHTPIN_3 17

#define DHTTYPE DHT22

// DHT 객체 각각 생성
DHT dht1(DHTPIN_1, DHTTYPE);
DHT dht2(DHTPIN_2, DHTTYPE);
DHT dht3(DHTPIN_3, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 - DHT22 x3 Test");

  dht1.begin();
  dht2.begin();
  dht3.begin();
}

void loop() {
  // 각 센서에서 데이터 읽기
  float t1 = dht1.readTemperature();
  float h1 = dht1.readHumidity();

  float t2 = dht2.readTemperature();
  float h2 = dht2.readHumidity();

  float t3 = dht3.readTemperature();
  float h3 = dht3.readHumidity();

  // 데이터 유효성 검사
  if (isnan(t1) || isnan(h1) || isnan(t2) || isnan(h2) || isnan(t3) || isnan(h3)) {
    Serial.println("❌ Failed to read from one or more DHT sensors!");
    delay(2000);
    return;
  }

  // 결과 출력
  Serial.println("===================================");
  Serial.print("🌡 Sensor1: "); Serial.print(t1); Serial.print("°C, ");
  Serial.print("💧 "); Serial.print(h1); Serial.println("%");

  Serial.print("🌡 Sensor2: "); Serial.print(t2); Serial.print("°C, ");
  Serial.print("💧 "); Serial.print(h2); Serial.println("%");

  Serial.print("🌡 Sensor3: "); Serial.print(t3); Serial.print("°C, ");
  Serial.print("💧 "); Serial.print(h3); Serial.println("%");
  Serial.println("===================================");

  delay(2000);
}
