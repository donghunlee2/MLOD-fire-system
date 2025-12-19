import json
import time
import paho.mqtt.client as mqtt

BROKER_IP = "localhost"  # 또는 TOPST D3 IP
CONFIG_TOPIC = "fire/config/ESP32_01"
ACK_TOPIC = "fire/config_log/ESP32_01"

# 가상 ESP32가 가진다고 가정하는 "위험(Danger)" 임계값
TEMP_DANGER = 50.0
SMOKE_DANGER = 600.0


def on_connect(client, userdata, flags, rc):
    print("[FAKE ESP32] Connected to MQTT broker")
    client.subscribe(CONFIG_TOPIC)
    print("[FAKE ESP32] Subscribed to:", CONFIG_TOPIC)


def on_message(client, userdata, msg):
    global TEMP_DANGER, SMOKE_DANGER

    print("[FAKE ESP32] Received:", msg.topic)
    payload = msg.payload.decode()
    print("[FAKE ESP32] Payload:", payload)

    try:
        data = json.loads(payload)
    except Exception:
        print("[FAKE ESP32] Invalid JSON")
        return

    updated = False

    # 🔥 danger 값만 반영
    if "temp_danger" in data:
        TEMP_DANGER = float(data["temp_danger"])
        updated = True

    if "smoke_danger" in data:
        SMOKE_DANGER = float(data["smoke_danger"])
        updated = True

    # 변경되었으면 ACK 전송
    if updated:
        ack = {
            "device_id": "ESP32_01",
            "status": "threshold_updated",
            "temp_danger": TEMP_DANGER,
            "smoke_danger": SMOKE_DANGER,
        }
        client.publish(ACK_TOPIC, json.dumps(ack))
        print("[FAKE ESP32] Sent ACK:", ack)


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER_IP, 1883, 60)

print("[FAKE ESP32] Running...")

# MQTT 수신은 백그라운드 스레드에서 돌림
client.loop_start()

# 👉 메인 루프: 현재 임계값을 계속 출력
try:
    while True:
        print(
            f"[FAKE ESP32] CURRENT THRESHOLDS -> "
            f"TEMP_DANGER={TEMP_DANGER:.2f}, SMOKE_DANGER={SMOKE_DANGER:.2f}"
        )
        time.sleep(1.0)
except KeyboardInterrupt:
    print("\n[FAKE ESP32] Stopped by user")
    client.loop_stop()
    client.disconnect()
