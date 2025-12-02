#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11   // DHT22를 쓴다면 DHT22로 바꿔

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  Serial.println("DHT sensor test!");
  dht.begin();
  delay(2000);
}

void loop() {
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();

  // 값이 없으면 NaN (Not a Number) 리턴 → 에러 메시지 표시
  if (isnan(temp) || isnan(humidity)) {
    Serial.println("❌ Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  Serial.print("Temp: ");
  Serial.print(temp);
  Serial.print(" °C  |  Humidity: ");
  Serial.print(humidity);
  Serial.println(" %");
  delay(2000);
}
