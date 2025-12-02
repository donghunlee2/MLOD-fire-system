#include <WiFi.h>
#include <PubSubClient.h>

// TOPST MQTT Broker IP
const char* mqtt_server = "";   // TOPST IP로 변경

// WiFi 정보
const char* ssid = "";
const char* password = "";

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void reconnect() {
  while (!client.connected()) {
    client.connect("ESP32TestClient");
    delay(500);
  }
}

void setup() {
  Serial.begin(115200);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  client.publish("esp/test", "Hello World!");
  delay(2000);
}
