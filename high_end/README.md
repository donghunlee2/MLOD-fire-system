# High-End Module (TOPST D3-P)

## 1. Overview
`high_end` 디렉토리는 TOPST D3-P 보드에서 실행되는 고성능 처리 모듈로 다음 기능들을 수행한다:
- ESP32 등에서 전달되는 센서 이벤트 수신  
- YOLO 기반 화재/연기 탐지 실행  
- 탐지 결과를 MQTT 등으로 상위 서버에 전달  


## 2. TOPST D3-P Image (Ubuntu / Yocto)
TOPST 이미지는 다음 링크에서 다운로드 할 수 있다:
<https://topst.ai/tech/docs?page=624bd237b3013e87c05c125b8031e2f370ccca2b>

프로젝트 테스트 환경은 다음과 같다:
- 운영체제: D3P-ubuntu-22.04-topst-weston_desktop-v1.0.0
- 문제점: GPU 사용 불가 (GPU 가속 미지원)
- 안내받은 내용: Yocto 기반 이미지를 사용하면 가속 기능 사용 가능

제공된 코드는 **Ubuntu 이미지**에서만 테스트되었으며 Yocto 이미지에서는 테스트하지 않았다.
Ubuntu 이미지는 일반 Linux 환경과 동일하게 Python 코드 실행이 가능하다.


## 3. Environment
필요 패키지 설치: 'pip install -r requirements.txt'


## 4. Running the codes
**Model**: 'best_int_quant.tflite' 학습된 YOLOv8 기반 모델
**Run**: 'python etr_video.py'
