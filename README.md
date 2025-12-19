# MLOD-fire-system (Multi-Layer On-device fire system)
## Introduction
MLOD-fire-systm is an open-source toolbox for On-device IoT system with Edge-AI
<br>
### Process layer information
| layer | device | function |
| --- | --- | --- |
| Low-end | ESP32/ESP32-CAM | Sense flame, gas and video data |
| Mid-end | RPi4 | Total logic integration |
| High-end | TOPST D3 | Run AI inference |

<br>

## Installation & Run
### Low-end
In this layer, we used Arduino IDE

### Mid-end
```py
# for running server
cd your_path/MLOD-fire-system/mid_end/back
python3 -m venv .venv
source .venv/bin/activate
pip install flask flask-cors paho-mqtt
python app.py
```
```py
# for UI
npm i
npm run build
npm run dev
```

### High-end
```py
cd your_path/MLOD-fire-system/high-end
pip install -r requirements.txt
python etr_video.py
```

<br>
