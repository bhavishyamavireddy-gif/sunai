
from pathlib import Path

import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = Path(__file__).resolve().parent / "sunsense_model.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        "AI model missing. Run: python ai_backend/train_ai.py"
    )

model = joblib.load(MODEL_PATH)

LABELS = {
    0: "OFF",
    1: "DIM",
    2: "ON"
}

BRIGHTNESS = {
    0: 0,
    1: 50,
    2: 100
}


@app.route("/")
def home():
    return jsonify({
        "project": "SunSense AI",
        "status": "Backend running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}

    try:
        intensity = float(data["intensity"])

        if not 0 <= intensity <= 100:
            return jsonify({
                "error": "Intensity must be between 0 and 100"
            }), 400

        prediction = int(model.predict([[intensity]])[0])

        return jsonify({
            "intensity": intensity,
            "status": LABELS[prediction],
            "brightness": BRIGHTNESS[prediction],
            "message": {
                "OFF": "Bright environment detected",
                "DIM": "Medium environmental light detected",
                "ON": "Low environmental light detected"
            }[LABELS[prediction]]
        })

    except (KeyError, TypeError, ValueError):
        return jsonify({
            "error": "Send a valid intensity between 0 and 100"
        }), 400


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
