from collections import deque
from datetime import datetime, timezone
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import os, json, time, threading
import paho.mqtt.client as mqtt
import sqlite3

# ===== Flask =====
app = Flask(__name__)
CORS(app)

BUFFER_MAXLEN = 200
HEARTBEAT_SEC = 15

buffer = deque(maxlen=BUFFER_MAXLEN)
subscribers = []
subscribers_lock = threading.Lock()

DB_PATH = os.getenv("DB_PATH", "sensor_data.db")

# 하나의 커넥션을 전역으로 두고, 스레드에서 같이 쓰기 위해 check_same_thread=False
db_conn = sqlite3.connect(DB_PATH, check_same_thread=False)
db_conn.row_factory = sqlite3.Row
db_lock = threading.Lock()


def publish(msg: dict):
    buffer.append(msg)
    frame = f"data: {json.dumps(msg, ensure_ascii=False)}\n\n"
    with subscribers_lock:
        dead = []
        # list()로 복사해 순회하며 안전하게 push
        for q in list(subscribers):
            try:
                q.append(frame)
            except Exception:
                dead.append(q)
        # 끊긴 구독자 제거
        for q in dead:
            if q in subscribers:
                subscribers.remove(q)

def init_db():
    with db_lock:
        cur = db_conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS sensor_data (
                id               INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id        TEXT,
                temperature      REAL,
                humidity         REAL,
                gas              REAL,
                event_sensor     TEXT,
                event_video      TEXT,
                confidence_flame REAL,
                confidence_gas   REAL,
                ts               INTEGER,
                timestamp        TEXT,
                received_at      TEXT,
                raw_json         TEXT
            )
            """
        )
        db_conn.commit()

def save_to_db(data: dict):
    """MQTT에서 받은 JSON dict를 sensor_data 테이블에 저장"""
    with db_lock:
        cur = db_conn.cursor()
        cur.execute(
            """
            INSERT INTO sensor_data (
                device_id,
                temperature,
                humidity,
                gas,
                event_sensor,
                event_video,
                confidence_flame,
                confidence_gas,
                ts,
                timestamp,
                received_at,
                raw_json
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.get("device_id"),
                data.get("temperature"),
                data.get("humidity"),
                # 센서 이름에 따라 smoke / gas 둘 다 가능성을 고려
                data.get("gas"),
                data.get("event_sensor"),
                data.get("event_video"),
                data.get("confidence_flame"),
                data.get("confidence_gas"),
                data.get("ts"),
                data.get("timestamp"),
                data.get("_received_at"),
                json.dumps(data, ensure_ascii=False),
            ),
        )
        db_conn.commit()

init_db()

def classify_log_type(event_sensor, event_video):
    """
    DB row의 event_sensor, event_video 값을 기준으로
    로그 타입을 'DANGER' / 'WARNING' / 'INFO' 로 분류
    """
    sensor = (event_sensor is not None) and (event_sensor != "" and event_sensor != "none")
    video  = (event_video  is not None) and (event_video  != "" and event_video  != "none")

    if sensor and video:
        return "DANGER"   # 대시보드에서 isFire == true인 경우
    if sensor or video:
        return "WARNING"
    return "INFO"


@app.route("/latest")
def latest():
    return jsonify(buffer[-1] if buffer else {})

@app.route("/stream")
def stream():
    q = deque()
    with subscribers_lock:
        subscribers.append(q)  # set.add -> list.append

    def gen():
        if buffer:
            yield f"data: {json.dumps(buffer[-1], ensure_ascii=False)}\n\n"
        last_hb = time.time()
        try:
            while True:
                if q:
                    yield q.popleft()
                else:
                    if time.time() - last_hb > HEARTBEAT_SEC:
                        yield ": ping\n\n"
                        last_hb = time.time()
                    time.sleep(0.05)
        finally:
            # 연결 종료시 목록에서 제거
            with subscribers_lock:
                if q in subscribers:
                    subscribers.remove(q)

    resp = Response(gen(), mimetype="text/event-stream")
    resp.headers["Cache-Control"] = "no-cache"
    resp.headers["X-Accel-Buffering"] = "no"
    return resp

# ===== MQTT =====
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT   = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC  = os.getenv("MQTT_TOPIC", "fire/sensor")

def on_connect(client, userdata, flags, rc, properties=None):
    print("MQTT connected:", rc)
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        if "ts" not in data:
            data["ts"] = int(time.time())
        data["_received_at"] = datetime.now(timezone.utc).isoformat()
        publish(data)  # ← 여기서 웹으로 즉시 푸시
        save_to_db(data)
    except Exception as e:
        print("MQTT parse error:", e)

@app.route("/api/available-dates", methods=["GET"])
def available_dates():
    """
    sensor_data에 데이터가 있는 날만 YYYY-MM-DD 형식으로 반환
    """
    with db_lock:
        cur = db_conn.cursor()
        cur.execute(
            """
            SELECT substr(timestamp, 1, 10) AS date
            FROM sensor_data
            WHERE timestamp IS NOT NULL
            GROUP BY date
            ORDER BY date ASC
            """
        )
        rows = cur.fetchall()
    dates = [row["date"] for row in rows]
    return jsonify({"dates": dates})

@app.route("/api/data", methods=["GET"])
def get_data():
    start_dt = request.args.get("start_dt")  # ISO string
    end_dt = request.args.get("end_dt")

    if not start_dt or not end_dt:
        return jsonify({"error": "start_dt and end_dt are required"}), 400

    with db_lock:
        cur = db_conn.cursor()
        cur.execute(
            """
            SELECT timestamp, temperature, gas
            FROM sensor_data
            WHERE timestamp BETWEEN ? AND ?
            ORDER BY timestamp ASC
            """,
            (start_dt, end_dt),
        )
        rows = cur.fetchall()

    data = [
        {
            "timestamp": row["timestamp"],
            "temperature": row["temperature"],
            "gas": row["gas"],
        }
        for row in rows
    ]
    return jsonify({"data": data})

@app.route("/api/logs", methods=["GET"])
def get_logs():
    page      = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 20))
    offset    = (page - 1) * page_size

    with db_lock:
        cur = db_conn.cursor()

        # 전체 개수
        cur.execute("SELECT COUNT(*) AS cnt FROM sensor_data")
        total = cur.fetchone()["cnt"]

        # 페이지 데이터
        cur.execute(
            """
            SELECT
                id,
                timestamp,
                device_id,
                temperature,
                humidity,
                gas,
                event_sensor,
                event_video
            FROM sensor_data
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
            """,
            (page_size, offset),
        )
        rows = cur.fetchall()

    logs = []
    for row in rows:
        row_id       = row["id"]
        ts           = row["timestamp"]
        device_id    = row["device_id"]
        temperature  = row["temperature"]
        humidity     = row["humidity"]
        gas          = row["gas"]
        event_sensor = row["event_sensor"]
        event_video  = row["event_video"]

        log_type = classify_log_type(event_sensor, event_video)

        # 화재 위험 / 경고 / 정상 메시지 구성
        if log_type == "DANGER":
            temp_str = f"{temperature:.1f}" if temperature is not None else "-"
            gas_str  = f"{gas:.1f}"         if gas is not None         else "-"
            message = f"[FireDetection] 화재 위험 감지! 온도 {temp_str}°C, 연기 {gas_str}ppm"
        elif log_type == "WARNING":
            if event_sensor not in (None, "", "none") and event_video in (None, "", "none"):
                message = "[SensorHub] 센서 데이터에서 이상 징후 감지"
            elif event_video not in (None, "", "none") and event_sensor in (None, "", "none"):
                message = "[VideoAI] 영상 분석에서 이상 징후 감지"
            else:
                message = "[System] 이상 징후가 감지되었습니다."
        else:
            message = "[System] 정상 데이터 수신"

        logs.append(
            {
                "id": row_id,
                "time": ts,
                "type": log_type,  # "DANGER" / "WARNING" / "INFO"
                "message": message,
            }
        )

    total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1

    return jsonify(
        {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
            "logs": logs,
        }
    )


mqtt_client = mqtt.Client(callback_api_version=mqtt.CallbackAPIVersion.VERSION2)
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
mqtt_client.loop_start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True, threaded=True)
