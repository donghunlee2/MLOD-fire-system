import cv2
import numpy as np
import tflite_runtime.interpreter as tflite
import time
import json
import threading
import datetime
import base64

# --- USER CONFIGURATION -------------------------------------------------
# YOLO TFLite model path
MODEL_PATH = "/root/models/best_int_quant.tflite"

# ESP32-CAM stream URL
STREAM_URL = "/root/videos/fire_test.mp4"

# Class names (must match your model)
CLASSES = ["Fire", "Smoke"]

# Detection settings
CONF_THRESHOLD = 0.4       # Confidence threshold for detections
IOU_THRESHOLD = 0.4        # IoU threshold for NMS

MAX_RETRY = 5              # Maximum reconnect attempts for stream

# MQTT settings (sensor in, event out)
MQTT_BROKER = "10.34.142.229"   # RPi4 broker IP
MQTT_PORT = 1883

# Topics
MQTT_SENSOR_TOPIC = "fire/event"   # ESP32 sensor → TOPST
MQTT_EVENT_TOPIC  = "fire/sensor"    # TOPST → RPi4 (summary + image)

DEVICE_ID = "TOPST_D3P"

# Event aggregation
WINDOW_SECONDS = 1.0       # Time window to pick the highest-confidence frame
EVENT_MIN_CONF = 0.5       # Only treat as detection if confidence >= this value
# ------------------------------------------------------------------------


# Global sensor status (last received values)
latest_sensor = {
    "device_id": None,
    "temperature": None,
    "humidity": None,
    "gas": None,
    "timestamp": None,   # sensor-side timestamp
    "event_sensor": None
}
sensor_lock = threading.Lock()

mqtt_client = None


# ======================= MQTT HANDLERS ==================================

def on_mqtt_connect(client, userdata, flags, rc, properties=None):
    print(f"[MQTT] Connected with result code {rc}")
#    client.subscribe(MQTT_SENSOR_TOPIC)
    result, mid = client.subscribe("fire/#")
    print(f"[MQTT] Subscribed to sensor topic: {MQTT_SENSOR_TOPIC}", result, mid)


def on_mqtt_message(client, userdata, msg):
    global latest_sensor
    try:
        text = msg.payload.decode("utf-8", errors="ignore").strip()
    except Exception as e:
        print(f"[MQTT] Decode error: {e}")
        return

    if msg.topic != MQTT_SENSOR_TOPIC:
        # ignore other topics
        return

    if not text:
        return

    print(f"[SENSOR][RAW] {msg.topic}: {text}")

    try:
        payload = json.loads(text)
#        print(payload)
    except json.JSONDecodeError:
        print("[SENSOR] Invalid JSON")
        return

    with sensor_lock:
        for k in ["device_id","temperature", "humidity", "gas", "timestamp","event_sensor"]:
            if k in payload:
                latest_sensor[k] = payload[k]

#    print(f"[SENSOR][PARSED] {latest_sensor}")


def init_mqtt():
    """
    Initialize MQTT client and connect to broker.
    Returns client or None if connection fails.
    """
    global mqtt_client
    import paho.mqtt.client as mqtt

#    try:
#        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
#    except TypeError:
    client = mqtt.Client()

#    print("connect")
    client.on_connect = on_mqtt_connect
#    print("message")
    client.on_message = on_mqtt_message

    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
    except Exception as e:
        print(f"[MQTT] connect error: {e}")
        return None

    client.loop_start()
    print(f"[MQTT] Connected to {MQTT_BROKER}:{MQTT_PORT}")
    mqtt_client = client
    return client


# ===================== EVENT JSON + PUBLISH =============================

def _get_sensor_snapshot():
    with sensor_lock:
        return latest_sensor.copy()


def build_summary_json(event_label: str,
                       confidence: float,
                       bbox=None) -> dict:
    """
    Summary event JSON: sensor + detection.
    bbox: [x, y, w, h] in original image coords or None
    """
    sensor_snapshot = _get_sensor_snapshot()

    # Local TOPST D3 timestamp (fallback)
    now_iso = datetime.datetime.now().isoformat(timespec="seconds")

    payload = {
        "msg_type": "summary",
        "device_id": DEVICE_ID,
        "temperature": sensor_snapshot.get("temperature"),
        "humidity": sensor_snapshot.get("humidity"),
        "gas": sensor_snapshot.get("gas"),
        # Prefer sensor timestamp if present, otherwise use local time
        "timestamp": sensor_snapshot.get("timestamp") or now_iso,
        "event_sensor": sensor_snapshot.get("event_sensor"),
        "event_video": event_label,                     # "fire" / "smoke" / "unknown" / "none"
        "confidence_flame": round(float(confidence), 4),  # 0.0 ~ 1.0
        "confidence_gas": None,
        "bbox": {
            "x": int(bbox[0]),
            "y": int(bbox[1]),
            "w": int(bbox[2]),
            "h": int(bbox[3]),
        } if bbox is not None else None,
        "image_format": None,
        "image_base64": None
    }
    return payload


def build_image_json(event_label: str,
                     confidence: float,
                     bbox,
                     frame_bgr) -> dict:
    """
    Image event JSON: summar.
    """
    sensor_snapshot = _get_sensor_snapshot()
    now_iso = datetime.datetime.now().isoformat(timespec="seconds")

    x, y, w, h = map(int, bbox)
    # frame 복사 후 박스 그리기
    draw_frame = frame_bgr.copy()
    cv2.rectangle(draw_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.putText(
        draw_frame,
        f"{event_label} {confidence:.2f}",
        (x, max(0, y - 5)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2,
        cv2.LINE_AA,
    )

    # JPEG 인코딩
    ok, buf = cv2.imencode(".jpg", draw_frame)
    if not ok:
        print("[EVENT_IMAGE] JPEG encode failed")
        img_b64 = None
    else:
        img_b64 = base64.b64encode(buf.tobytes()).decode("ascii")

    payload = {
        "msg_type": "image",
        "device_id": DEVICE_ID,
        "temperature": sensor_snapshot.get("temperature"),
        "humidity": sensor_snapshot.get("humidity"),
        "gas": sensor_snapshot.get("gas"),
        "event_sensor": sensor_snapshot.get("event_sensor"),
        "timestamp": sensor_snapshot.get("timestamp") or now_iso,
        "event_video": event_label,
        "confidence_flame": round(float(confidence), 4),
        "confidence_gas": None,
        "bbox": {
            "x": x,
            "y": y,
            "w": w,
            "h": h,
        },
        "image_format": "jpeg",
        "image_base64": img_b64,
    }
    return payload


def send_event(payload: dict):
    """
    Output event JSON to console and MQTT.
    """
    global mqtt_client
    j = json.dumps(payload, ensure_ascii=False)
    print(f"[EVENT][{payload.get('msg_type')}] {j}")

    if mqtt_client is not None:
        try:
            mqtt_client.publish(MQTT_EVENT_TOPIC, j)
        except Exception as e:
            print(f"[MQTT] publish error: {e}")


# =========================== VIDEO / YOLO ================================

def open_stream(url: str):
    """
    Open ESP32-CAM HTTP MJPEG stream.
    """
    cap = cv2.VideoCapture(url)
    try:
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    except Exception:
        pass
    return cap


def load_tflite_model():
    """
    Load TFLite YOLO model and return interpreter and I/O details.
    """
    print(f"[INFO] Loading YOLO TFLite model: {MODEL_PATH}")
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    h_model = input_details[0]["shape"][1]
    w_model = input_details[0]["shape"][2]
    print(f"[INFO] Model input size: {w_model}x{h_model}")
    print(f"[INFO] Stream URL: {STREAM_URL}")

    return interpreter, input_details, output_details, w_model, h_model


def run():
    # 1) Init MQTT (sensor in + event out)
    client = init_mqtt()
    if client is None:
        print("[ERROR] MQTT init failed, exiting.")
        return

    # 2) Load YOLO TFLite model
    try:
        (
            interpreter,
            input_details,
            output_details,
            w_model,
            h_model,
        ) = load_tflite_model()
    except Exception as e:
        print(f"[ERROR] Model load failed: {e}")
        return

    # 3) Connect to ESP32-CAM stream
    retry = 0
    cap = open_stream(STREAM_URL)

    if not cap.isOpened():
        print("[WARN] Initial stream open failed.")

    frame_count = 0

    # Tracking best detection in the current time window
    window_start = time.time()
    # {"conf": float, "label": str, "bbox": [x,y,w,h], "frame": np.ndarray}
    best_det = None

    while True:
        if not cap.isOpened():
            if retry >= MAX_RETRY:
                print("[ERROR] Max retry reached. Exiting.")
                break
            print(f"[WARN] Stream not opened. Retry {retry + 1}/{MAX_RETRY} ...")
            time.sleep(1.0)
            cap.release()
            cap = open_stream(STREAM_URL)
            retry += 1
            continue

        ret, frame = cap.read()
        if not ret or frame is None:
            print("[WARN] Failed to read frame. Reconnecting...")
            cap.release()
            time.sleep(0.5)
            cap = open_stream(STREAM_URL)
            retry += 1
            if retry > MAX_RETRY:
                print("[ERROR] Too many read errors. Exiting.")
                break
            continue

        retry = 0
        frame_count += 1
        t_start = time.time()

        h_orig, w_orig = frame.shape[:2]

        # --- Preprocessing ---
        frame_resized = cv2.resize(frame, (w_model, h_model))
        frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
        input_data = np.expand_dims(frame_rgb, axis=0)

        # Support both float and quantized models (uint8/int8)
        if input_details[0]["dtype"] == np.float32:
            input_data = np.float32(input_data) / 255.0
        else:
            # quantized model: 그냥 dtype만 맞춰서 넣음
            input_data = input_data.astype(input_details[0]["dtype"])

        # --- Inference ---
        interpreter.set_tensor(input_details[0]["index"], input_data)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]["index"])

        if output_data.ndim != 3:
            print(f"[WARN] Unexpected output shape: {output_data.shape}")
            continue

        # For YOLO-like output: (1, 6, N) -> (1, N, 6) -> (N, 6)
        output_data = np.transpose(output_data, (0, 2, 1))
        predictions = output_data[0]

        boxes = []
        confidences = []
        class_ids = []

        for i in range(len(predictions)):
            row = predictions[i]
            if row.shape[0] < 6:
                continue

            scores = row[4:]
            cls_id = int(np.argmax(scores))
            conf = float(scores[cls_id])

            if conf < CONF_THRESHOLD:
                continue

            x, y, w_box, h_box = row[0], row[1], row[2], row[3]

            # Convert from model-space to original image coordinates
            left = int((x - 0.5 * w_box) * w_orig)
            top = int((y - 0.5 * h_box) * h_orig)
            width = int(w_box * w_orig)
            height = int(h_box * h_orig)

            boxes.append([left, top, width, height])
            confidences.append(conf)
            class_ids.append(cls_id)

        det_count = 0
        frame_best_conf = 0.0
        frame_best_label = None
        frame_best_bbox = None

        if len(boxes) > 0:
            indices = cv2.dnn.NMSBoxes(
                boxes, confidences, CONF_THRESHOLD, IOU_THRESHOLD
            )
            if len(indices) > 0:
                for idx in indices.flatten():
                    det_count += 1
                    conf = confidences[idx]
                    cls_id = class_ids[idx]
                    label = CLASSES[cls_id] if cls_id < len(CLASSES) else f"Class{cls_id}"

                    if conf > frame_best_conf:
                        frame_best_conf = conf
                        frame_best_label = label
                        frame_best_bbox = boxes[idx]

        # Update best detection in the current time window
        if frame_best_label is not None:
            if (best_det is None) or (frame_best_conf > best_det["conf"]):
                best_det = {
                    "conf": frame_best_conf,
                    "label": frame_best_label,
                    "bbox": frame_best_bbox,
                    "frame": frame.copy(),
                }

        t_end = time.time()
        infer_ms = (t_end - t_start) * 1000.0
        fps = 1.0 / max(1e-6, (t_end - t_start))

        if frame_count % 10 == 0:
            print(
                f"[RUN] Frame {frame_count} | FPS: {fps:.1f} | "
                f"infer: {infer_ms:.1f} ms | det: {det_count}"
            )

        # --- Every WINDOW_SECONDS, send event ---
        now = time.time()
        if now - window_start >= WINDOW_SECONDS:
            if best_det is not None and best_det["conf"] >= EVENT_MIN_CONF:
                label_lower = best_det["label"].lower()
                if "fire" in label_lower:
                    event_name = "fire"
                elif "smoke" in label_lower:
                    event_name = "smoke"
                else:
                    event_name = "unknown"

                summary_payload = build_summary_json(
                    event_name,
                    best_det["conf"],
                    bbox=best_det["bbox"],
                )
                send_event(summary_payload)

                image_payload = build_image_json(
                    event_name,
                    best_det["conf"],
                    best_det["bbox"],
                    best_det["frame"],
                )
                send_event(image_payload)
            else:
                summary_payload = build_summary_json("none", 0.0, bbox=None)
                send_event(summary_payload)

            # Reset for the next time window
            best_det = None
            window_start = now

    cap.release()
    print("[INFO] Stream processing finished.")


if __name__ == "__main__":
    run()

