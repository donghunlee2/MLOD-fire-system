#include <WiFi.h>
#include <PubSubClient.h>

// 📶 Wi-Fi 설정
const char* ssid = "";         // Wi-Fi 이름
const char* password = ""; // 비밀번호

// 💬 MQTT 서버 주소 (PC IP)
const char* mqtt_server = ""; // ipconfig로 확인한 PC IP

WiFiClient espClient;
PubSubClient client(espClient);

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.printf("WiFi 연결 중: %s\n", ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi 연결 완료");
  Serial.print("할당된 IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // MQTT 서버 재연결 루프
  while (!client.connected()) {
    Serial.print("MQTT 연결 시도 중...");
    if (client.connect("ESP32Client")) { // 클라이언트 ID
      Serial.println("연결 성공!");
      client.subscribe("cmd/#"); // 구독 예시 (필요시)
    } else {
      Serial.print("실패, 상태코드=");
      Serial.print(client.state());
      Serial.println(" 5초 후 재시도...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883); // Mosquitto 기본 포트
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  static unsigned long lastMsg = 0;
  unsigned long now = millis();
  if (now - lastMsg > 2000) { // 2초마다 전송
    lastMsg = now;

    float temperature = 25.3;
    int gas = 312;

    char payload[100];
    sprintf(payload, "{\"temp\":%.2f, \"gas\":%d}", temperature, gas);
    client.publish("sensor/room1", payload);
    Serial.print("보낸 메시지: ");
    Serial.println(payload);
  }
}
