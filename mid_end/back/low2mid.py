import json
from datetime import datetime
import paho.mqtt.client as mqtt

BROKER_HOST = "localhost"
BROKER_PORT = 1883

# ESP32 → TOPST D3 입력 토픽
ESP32_SUB_TOPIC = "fire/esp32"

# TOPST D3 → RPi4 출력 토픽
RPi4_PUB_TOPIC = "fire/sensor"

client = mqtt.Client()


# -----------------------------------
# 여기에 TOPST YOLO confidence 값을 가져오는 함수 추가
# 실제 YOLO 코드에서 값을 넣도록 연결하면 됩니다.
# -----------------------------------
def get_flame_confidence():
    """
    TOPST D3 YOLO의 flame confidence 값을 반환
    ※ TODO: YOLO 모델 연결 후 실제 confidence 값 반환하도록 수정
    """
    return 82.4   # 예시 (임시 값)


def get_gas_confidence():
    """
    TOPST D3 YOLO의 gas/연기 confidence 값을 반환
    ※ TODO: YOLO 모델 연결 후 실제 confidence 값 반환하도록 수정
    """
    return 45.1   # 예시 (임시 값)


def get_event_type(flame_conf, gas_conf, threshold=60):
    """
    confidence 값을 기반으로 event 결정 로직
    필요하면 마음대로 수정하세요
    """
    if flame_conf >= threshold and gas_conf >= threshold:
        return "both"
    elif flame_conf >= threshold:
        return "fire"
    elif gas_conf >= threshold:
        return "gas"
    return "none"


# -----------------------------------
# MQTT 콜백
# -----------------------------------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT 연결 성공. ESP32 데이터 구독 시작.")
        client.subscribe(ESP32_SUB_TOPIC)
    else:
        print("MQTT 연결 실패:", rc)


def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)

        print("[수신 - ESP32]", data)

        # timestamp 없으면 TOPST에서 채워 넣기
        if "timestamp" not in data:
            data["timestamp"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        # TOPST에서 왔다는 표시
        data["source"] = "topst_d3"

        # ---- TOPST YOLO confidence 값 추가 ----
        flame_conf = get_flame_confidence()
        gas_conf = get_gas_confidence()

        data["confidence_flame"] = flame_conf
        data["confidence_gas"] = gas_conf
        data["event_video"] = get_event_type(flame_conf, gas_conf)

        # RPi4로 전송
        client.publish(RPi4_PUB_TOPIC, json.dumps(data))
        print("[전송 - RPi4]", data)

    except Exception as e:
        print("메시지 처리 오류:", e)


client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER_HOST, BROKER_PORT, 60)
client.loop_forever()
