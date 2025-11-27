import json
from datetime import datetime
import time

import cv2
import numpy as np
import tensorflow as tf        # TFLite CPU 사용 (tf.lite.Interpreter)
import paho.mqtt.client as mqtt

# ============================
# MQTT 설정
# ============================

BROKER_HOST = "localhost"      # 필요시 IP로 변경
BROKER_PORT = 1883

# ESP32 → TOPST D3 입력 토픽
ESP32_SUB_TOPIC = "fire/esp32"

# TOPST D3 → RPi4 출력 토픽
RPi4_PUB_TOPIC = "fire/sensor"


# ============================
# TFLite YOLO + 웹캠 설정
# ============================

# TFLite 모델 경로 (실제 경로로 수정)
TFLITE_MODEL_PATH = "fire_yolo.tflite"

# 클래스 ID (모델 학습할 때 정의한 순서에 맞게 수정)
FIRE_CLASS_ID = 0   # flame
SMOKE_CLASS_ID = 1  # smoke

# 화재 판단용 threshold (원하는 값으로 튜닝)
FIRE_CONF_THRESHOLD = 70.0   # 불꽃 confidence 기준 (0~100)
SMOKE_CONF_THRESHOLD = 70.0  # 연기 confidence 기준 (0~100)

print("[INFO] TFLite 모델 로드 중...")
interpreter = tf.lite.Interpreter(model_path=TFLITE_MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# 입력 텐서 shape: [1, H, W, 3] 가정
INPUT_H = input_details[0]["shape"][1]
INPUT_W = input_details[0]["shape"][2]
print(f"[INFO] TFLite 입력 크기: {INPUT_W}x{INPUT_H}")

# 웹캠 열기 (0: 기본 카메라)
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("[WARN] 웹캠을 열 수 없습니다. 카메라 연결 상태를 확인하세요.")


def run_yolo_tflite_on_webcam():
    """
    웹캠에서 한 프레임을 읽어 TFLite YOLO로 추론하고,
    flame_conf, smoke_conf (0~100) 를 반환.
    """
    ret, frame = cap.read()
    if not ret:
        print("[WARN] 웹캠 프레임을 읽지 못했습니다.")
        return 0.0, 0.0

    # BGR -> RGB 변환 (모델이 RGB 기준이라고 가정)
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # 리사이즈
    img_resized = cv2.resize(img_rgb, (INPUT_W, INPUT_H))

    # [0, 1] 스케일링 + 배치 차원 추가
    input_data = img_resized.astype(np.float32) / 255.0
    input_data = np.expand_dims(input_data, axis=0)  # (1, H, W, 3)

    # TFLite 입력 설정
    interpreter.set_tensor(input_details[0]["index"], input_data)

    # 추론 실행
    interpreter.invoke()

    # 출력 가져오기
    output_data = interpreter.get_tensor(output_details[0]["index"])
    # 예: (1, N, 6) 또는 (N, 6)을 가정
    detections = np.squeeze(output_data)  # (N, 6) 또는 (6,) 등

    flame_conf = 0.0
    smoke_conf = 0.0

    # detections: [x, y, w, h, score, class_id] 형식이라고 가정
    # 모델에 따라 구조가 다르면 이 부분만 수정하면 됩니다.
    if detections.ndim == 1 and detections.shape[0] == 6:
        detections = np.expand_dims(detections, axis=0)

    for det in detections:
        if len(det) < 6:
            continue

        score = float(det[4]) * 100.0   # 0~1 -> 0~100
        class_id = int(det[5])

        if class_id == FIRE_CLASS_ID:
            flame_conf = max(flame_conf, score)
        elif class_id == SMOKE_CLASS_ID:
            smoke_conf = max(smoke_conf, score)

    return flame_conf, smoke_conf


def get_event_type(flame_conf: float, smoke_conf: float) -> str:
    """
    flame_conf / smoke_conf (0~100)를 바탕으로 event_video 문자열 생성.
    - 반환값: "none" / "flame" / "smoke" / "both"
    """
    flame_detected = flame_conf >= FIRE_CONF_THRESHOLD
    smoke_detected = smoke_conf >= SMOKE_CONF_THRESHOLD

    if flame_detected and smoke_detected:
        return "both"
    elif flame_detected:
        return "flame"
    elif smoke_detected:
        return "smoke"
    else:
        return "none"


# 최근 YOLO 결과를 저장해서 재사용할 수 있게 (옵션)
_last_flame_conf = 0.0
_last_smoke_conf = 0.0


def update_yolo_confidence():
    global _last_flame_conf, _last_smoke_conf
    flame_conf, smoke_conf = run_yolo_tflite_on_webcam()
    _last_flame_conf = flame_conf
    _last_smoke_conf = smoke_conf


def get_flame_confidence():
    return _last_flame_conf


def get_gas_confidence():
    # 여기서는 smoke_conf를 gas confidence로 사용
    return _last_smoke_conf


# ============================
# MQTT 클라이언트 설정
# ============================

client = mqtt.Client()


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[MQTT] 연결 성공")
        client.subscribe(ESP32_SUB_TOPIC)
        print(f"[MQTT] ESP32 토픽 구독: {ESP32_SUB_TOPIC}")
    else:
        print(f"[MQTT] 연결 실패, rc={rc}")


def on_message(client, userdata, msg):
    """
    ESP32 → fire/esp32 로 들어온 메시지를 받아서
    - TFLite YOLO로 웹캠 한 프레임 추론
    - confidence_flame / confidence_gas / event_video 추가
    - fire/sensor 토픽으로 RPi4에 전송
    """
    try:
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)

        print("[수신 - ESP32]", data)

        # timestamp 없으면 현재 시간으로 채움
        if "timestamp" not in data:
            data["timestamp"] = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        # 데이터 출처
        data["source"] = "topst_d3"

        # -------------------------
        # TFLite YOLO 추론 수행
        # -------------------------
        update_yolo_confidence()
        flame_conf = get_flame_confidence()
        gas_conf = get_gas_confidence()

        data["confidence_flame"] = float(f"{flame_conf:.2f}")
        data["confidence_gas"] = float(f"{gas_conf:.2f}")

        # event_video 결정
        data["event_video"] = get_event_type(flame_conf, gas_conf)

        # -------------------------
        # RPi4로 전송
        # -------------------------
        client.publish(RPi4_PUB_TOPIC, json.dumps(data))
        print("[전송 - RPi4]", data)

    except Exception as e:
        print("[ERROR] 메시지 처리 오류:", e)


client.on_connect = on_connect
client.on_message = on_message


def main():
    try:
        client.connect(BROKER_HOST, BROKER_PORT, 60)
        print(f"[MQTT] 브로커 연결: {BROKER_HOST}:{BROKER_PORT}")
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n[INFO] 종료 중...")
    finally:
        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
