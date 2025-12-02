#include <WiFi.h>
#include <PubSubClient.h>
#include "DHT.h"

#define DHTPIN 25
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// Wi-Fi 설정
const char* ssid = ""; //Wifi Name
const char* password = "";
const char* mqtt_server = ""; // RPi IP

WiFiClient espClient;
PubSubClient client(espClient);

void reconnect() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    if (client.connect("ESP32_SensorNode")) {
      Serial.println("connected!");
    } else {
      Serial.print("failed, rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Wi-Fi 연결 중");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nWi-Fi Connected!");
  Serial.print("IP: "); Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  char payload[128];
  snprintf(payload, sizeof(payload), "{\"temp\":%.2f,\"humi\":%.2f}", t, h);
  client.publish("fire/sensor", payload);
  Serial.println(payload);

  delay(1000);
}
