import json
import paho.mqtt.client as mqtt

BROKER = "10.34.142.229"
PORT = 1883
TOPIC = "fire/event"


def on_connect(client, userdata, flags, rc, properties=None):
    print(f"[TEST] on_connect rc={rc}")
    result, mid = client.subscribe(TOPIC)
    print(f"[TEST] subscribed to {TOPIC}, result={result}, mid={mid}")


def on_message(client, userdata, msg):
    payload = msg.payload.decode(errors="ignore")
    print(f"[TEST] message received | topic={msg.topic}, payload={payload}")


def main():
    try:
        client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2
        )
    except TypeError:
        client = mqtt.Client()

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(BROKER, PORT, 60)
    s = client._sock
    print(s.getsockname(), s.getpeername())

    client.loop_forever()


if __name__ == "__main__":
    main()
