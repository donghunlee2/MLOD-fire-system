# sender_topst.py
import cv2
import time
import requests

RPi_SERVER_URL = "http://127.0.0.1:8000/api/frame"  # 나중에 RPi4 IP로 변경
DEVICE_ID = "TOPST_D3_SIM"

TARGET_FPS = 5          # 5 ~ 10 사이로 바꾸면 됨
FRAME_INTERVAL = 1.0 / TARGET_FPS

USE_VIDEO_FILE = True  # True로 두고 아래 VIDEO_PATH 설정하면 파일 재생
VIDEO_PATH = "C:\\Users\\이동훈\\Desktop\\test.gif"

def draw_fake_yolo_bbox(frame, idx):
    """
    YOLO 추론 결과처럼 대충 bbox 하나 그려주는 함수 (시뮬레이션용).
    실제 환경에서는 이 자리에 YOLO 결과 bbox를 그리면 됨.
    """
    h, w, _ = frame.shape

    # 프레임 인덱스에 따라 약간씩 움직이는 박스
    box_w, box_h = int(w * 0.3), int(h * 0.3)
    x = int((w - box_w) / 2 + 30 * (idx % 10 - 5))
    y = int((h - box_h) / 2)

    x1 = max(0, x)
    y1 = max(0, y)
    x2 = min(w - 1, x + box_w)
    y2 = min(h - 1, y + box_h)

    # 초록색 박스 + 라벨 텍스트
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(frame, "fire(?)", (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    return frame

def main():
    if USE_VIDEO_FILE:
        cap = cv2.VideoCapture(VIDEO_PATH)
    else:
        cap = cv2.VideoCapture(0)  # 웹캠

    if not cap.isOpened():
        print("카메라/영상 파일을 열 수 없습니다.")
        return

    frame_idx = 0

    try:
        while True:
            loop_start = time.time()

            ret, frame = cap.read()
            if not ret:
                print("프레임을 읽지 못했습니다. (영상 끝 or 카메라 문제)")
                break

            # 해상도 조정 (ESP32-CAM 수준으로 낮추기)
            frame = cv2.resize(frame, (320, 240))

            # --- YOLO bbox 시뮬레이션: 박스 그리기 ---
            frame = draw_fake_yolo_bbox(frame, frame_idx)

            # JPEG 인코딩
            encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 80]
            success, encoded_image = cv2.imencode(".jpg", frame, encode_param)
            if not success:
                print("JPEG 인코딩 실패")
                continue

            img_bytes = encoded_image.tobytes()
            timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")

            headers = {
                "Content-Type": "image/jpeg",
                "X-Device-ID": DEVICE_ID,
                "X-Timestamp": timestamp,
                "X-Frame-Index": str(frame_idx),
                "X-FPS": str(TARGET_FPS),
            }

            # 터미널에 송신 로그
            print(f"[SEND] frame={frame_idx}, ts={timestamp}")

            try:
                resp = requests.post(
                    RPi_SERVER_URL,
                    headers=headers,
                    data=img_bytes,
                    timeout=1.0  # 서버가 죽었을 때 너무 오래 안 기다리게
                )
                if resp.status_code != 200:
                    print(f"서버 응답 코드 이상: {resp.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"서버 전송 오류: {e}")

            frame_idx += 1

            # FPS 맞추기 (5~10fps 환경 시뮬레이션)
            elapsed = time.time() - loop_start
            sleep_time = FRAME_INTERVAL - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)

    finally:
        cap.release()

if __name__ == "__main__":
    main()
