import time
import json
import random
import math
from datetime import datetime, timedelta
import paho.mqtt.client as mqtt

client = mqtt.Client()
client.connect("localhost", 1883, 60)

# ---------------------------
# Utility Functions
# ---------------------------

def diurnal_pattern(hour: int, min_v: float, max_v: float, peak_hour: float):
    """24시간 동안 완만하게 오르내리는 패턴 생성"""
    x = (hour - peak_hour) / 24 * 2 * math.pi
    norm = (math.cos(x) + 1) / 2  # 0~1
    return min_v + (max_v - min_v) * norm

def smooth_step(prev, target, max_step):
    """prev가 target을 향해 점진적으로 움직이도록 제한"""
    diff = target - prev
    if abs(diff) <= max_step:
        return target
    return prev + max_step * (1 if diff > 0 else -1)

def add_noise(v, noise):
    return v + random.uniform(-noise, noise)

# ---------------------------
# Current State (baseline)
# ---------------------------

current_temp = 45.0
current_humidity = 55.0
current_gas = 800.0
current_conf_flame = 10.0
current_conf_gas = 10.0

# 이벤트 관련
event = "none"
event_end_time = None

# 확률
FIRE_PROB = 0.02   # 화염 발생 확률
GAS_PROB = 0.03    # 가스 발생 확률
BOTH_PROB = 0.01   # 화재(둘 다) 발생 확률

while True:
    now = datetime.now()
    hour = now.hour

    # ---------------------------
    # 이벤트 지속 여부 체크
    # ---------------------------
    if event != "none" and event_end_time and now >= event_end_time:
        event = "none"
        event_end_time = None

    # ---------------------------
    # 새로운 이벤트 발생 확률
    # ---------------------------
    if event == "none":
        r = random.random()
        if r < BOTH_PROB:
            event = "both"
        elif r < BOTH_PROB + FIRE_PROB:
            event = "fire"
        elif r < BOTH_PROB + FIRE_PROB + GAS_PROB:
            event = "gas"
        else:
            event = "none"

        if event != "none":
            duration = random.randint(30, 120)
            event_end_time = now + timedelta(seconds=duration)

    # ---------------------------
    # 기본 24시간 패턴 (기준값)
    # ---------------------------
    target_temp = diurnal_pattern(hour, 40, 60, peak_hour=15)
    target_humidity = diurnal_pattern(hour, 40, 80, peak_hour=4)
    target_gas = diurnal_pattern(hour, 600, 1000, peak_hour=18)
    target_conf_flame = diurnal_pattern(hour, 5, 25, peak_hour=20)
    target_conf_gas = diurnal_pattern(hour, 5, 25, peak_hour=19)

    # ---------------------------
    # 이벤트에 따른 값 변동
    # ---------------------------
    if event == "fire":
        target_temp = random.uniform(70, 110)
        target_conf_flame = random.uniform(60, 100)

    elif event == "gas":
        target_gas = random.uniform(1500, 4000)
        target_conf_gas = random.uniform(60, 100)

    elif event == "both":
        target_temp = random.uniform(90, 120)
        target_gas = random.uniform(2000, 5000)
        target_conf_flame = random.uniform(80, 100)
        target_conf_gas = random.uniform(80, 100)

    # ---------------------------
    # 값이 목표를 자연스럽게 따라가도록
    # ---------------------------
    current_temp = smooth_step(current_temp, target_temp, max_step=1.2)
    current_gas = smooth_step(current_gas, target_gas, max_step=20)
    current_humidity = smooth_step(current_humidity, target_humidity, max_step=0.4)
    current_conf_flame = smooth_step(current_conf_flame, target_conf_flame, max_step=4)
    current_conf_gas = smooth_step(current_conf_gas, target_conf_gas, max_step=4)

    # 노이즈 추가
    current_temp = add_noise(current_temp, 0.3)
    current_gas = add_noise(current_gas, 10)
    current_humidity = add_noise(current_humidity, 0.2)
    current_conf_flame = add_noise(current_conf_flame, 1)
    current_conf_gas = add_noise(current_conf_gas, 1)

    # 범위 제한
    current_temp = max(20, min(130, current_temp))
    current_humidity = max(20, min(100, current_humidity))
    current_gas = max(300, min(6000, current_gas))

    # ---------------------------
    # MQTT 전송
    # ---------------------------
    msg = {
        "device_id": "ESP32_01",
        "temperature": round(current_temp, 2),
        "humidity": round(current_humidity, 2),
        "gas": round(current_gas, 2),
        "timestamp": now.strftime("%Y-%m-%dT%H:%M:%S"),
        "event": event,
        "confidence_flame": round(current_conf_flame, 2),
        "confidence_gas": round(current_conf_gas, 2)
    }

    client.publish("fire/sensor", json.dumps(msg))
    print("Published:", msg)

    time.sleep(5)
