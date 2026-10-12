
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Project folder paths
BACKEND_DIR = Path(__file__).resolve().parent
MODEL_PATH = BACKEND_DIR / "sunsense_model.pkl"

# Virtual sensor readings: 0% to 100%
X = np.arange(0, 101).reshape(-1, 1)

# Training labels:
# 0 = OFF, 1 = DIM, 2 = ON
def lighting_label(intensity):
    if intensity <= 30:
        return 2  # Dark environment: ON
    elif intensity <= 60:
        return 1  # Medium light: DIM
    return 0      # Bright environment: OFF

y = np.array([lighting_label(value) for value in range(101)])

# Train machine-learning model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)
model.fit(X, y)

# Save trained model
joblib.dump(model, MODEL_PATH)

print("SunSense AI model trained successfully!")
print(f"Model saved: {MODEL_PATH}")

labels = {0: "OFF", 1: "DIM", 2: "ON"}

for intensity in [10, 40, 90]:
    result = int(model.predict([[intensity]])[0])
    print(f"Light {intensity}% -> Streetlight {labels[result]}")
