#include "DHT.h"

#define DHTPIN 4     // DHT11 데이터 핀
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 DHT11 Test");
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  Serial.print("🌡 Temp: "); Serial.print(t); Serial.print("°C ");
  Serial.print("💧 Humidity: "); Serial.print(h); Serial.println("%");
  delay(2000);
}
