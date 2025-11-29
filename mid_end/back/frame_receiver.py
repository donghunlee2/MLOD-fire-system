from flask import Flask, request, Response
import cv2
import numpy as np
import time
import os

app = Flask(__name__)

SHOW_WINDOW = False  # True로 바꾸면 OpenCV 창으로 프레임 확인 가능

# 🔥 수신 프레임 저장 디렉토리 (한 디렉토리만 사용)
SAVE_DIR = "received_frames"
os.makedirs(SAVE_DIR, exist_ok=True)

# 최근 프레임 저장용 (테스트용)
last_frame = None

@app.route("/api/frame", methods=["POST"])
def receive_frame():
    global last_frame

    # --- 헤더에서 메타데이터 읽기 ---
    device_id     = request.headers.get("X-Device-ID", "UNKNOWN")
    timestamp_str = request.headers.get("X-Timestamp", "")
    frame_index   = request.headers.get("X-Frame-Index", "-1")
    fps           = request.headers.get("X-FPS", "?")

    # --- 바디에서 JPEG 바이트 읽기 ---
    img_bytes = request.data
    if not img_bytes:
        return Response("No image data", status=400)

    # JPEG 디코딩
    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return Response("Failed to decode image", status=400)

    last_frame = frame

    # 🔥 프레임 파일로 저장 ---------------------------
    # 타임스탬프가 비어있으면 현재 시각 사용
    if timestamp_str:
        ts = timestamp_str.replace(":", "-")
    else:
        ts = time.strftime("%Y-%m-%dT%H-%M-%S")

    # 파일 이름: 2025-10-15T21-32-40_frame_0.jpg 이런 식
    filename = f"{ts}_frame_{frame_index}.jpg"
    save_path = os.path.join(SAVE_DIR, filename)
    print(save_path)

    # JPG로 저장
    cv2.imwrite(save_path, frame)
    print(f"[SAVE] {save_path}")
    # ----------------------------------------------

    # 터미널 로그 출력
    print(f"[{time.strftime('%H:%M:%S')}] "
          f"device={device_id}, frame={frame_index}, fps={fps}, ts={timestamp_str}, "
          f"shape={frame.shape}")

    # 필요하면 바로 화면에 띄우기 (테스트용)
    if SHOW_WINDOW:
        cv2.imshow("RPi4 Receiver", frame)
        # 1ms 기다리며 키 입력 체크
        if cv2.waitKey(1) & 0xFF == ord('q'):
            # q 눌러도 서버는 계속 돌아가지만 창만 닫힘
            cv2.destroyAllWindows()

    return Response("OK", status=200)

# 최근 프레임을 확인하는 엔드포인트 (브라우저에서 확인용)
@app.route("/latest_frame", methods=["GET"])
def latest_frame():
    global last_frame
    if last_frame is None:
        return Response("No frame yet", status=404)

    success, encoded_image = cv2.imencode(".jpg", last_frame)
    if not success:
        return Response("Failed to encode image", status=500)

    return Response(encoded_image.tobytes(), mimetype="image/jpeg")

if __name__ == "__main__":
    # 0.0.0.0으로 열어두면 나중에 실제 RPi4에서 외부 접속 가능
    app.run(host="0.0.0.0", port=5000, debug=False)
