
const API_URL = "http://127.0.0.1:5000";

const slider = document.getElementById("lightSlider");
const sliderValue = document.getElementById("sliderValue");
const intensityValue = document.getElementById("intensityValue");
const brightnessValue = document.getElementById("brightnessValue");
const lightStatus = document.getElementById("lightStatus");
const statusDescription = document.getElementById("statusDescription");
const modelStatus = document.getElementById("modelStatus");
const connectionStatus = document.getElementById("connectionStatus");
const highway = document.getElementById("highway");
const sceneLabel = document.getElementById("sceneLabel");
const decisionReason = document.getElementById("decisionReason");
const errorMessage = document.getElementById("errorMessage");

const dailyUsage = document.getElementById("dailyUsage");
const dailySavings = document.getElementById("dailySavings");
const savingsPercent = document.getElementById("savingsPercent");

let requestNumber = 0;

function updateEnergy(brightness) {
  // Illustrative model: 12 kWh/day at full output.
  const baseline = 12;
  const usage = baseline * brightness / 100;
  const saved = baseline - usage;
  const percent = (saved / baseline) * 100;

  dailyUsage.textContent = `${usage.toFixed(1)} kWh`;
  dailySavings.textContent = `${saved.toFixed(1)} kWh`;
  savingsPercent.textContent = `${percent.toFixed(0)}%`;
}

function updateHighway(intensity, status) {
  highway.classList.remove("day", "dim", "lights-on", "dim-lights");

  if (intensity > 60) {
    highway.classList.add("day");
  } else if (intensity > 30) {
    highway.classList.add("dim");
  }

  if (status === "ON") {
    highway.classList.add("lights-on");
  } else if (status === "DIM") {
    highway.classList.add("dim-lights");
  }

  sceneLabel.textContent =
    `SENSOR: ${intensity}% · AI DECISION: ${status}`;
}

async function predictLighting() {
  const currentRequest = ++requestNumber;
  const intensity = Number(slider.value);

  sliderValue.textContent = intensity;
  intensityValue.textContent = intensity;
  errorMessage.textContent = "";
  lightStatus.textContent = "Thinking...";
  statusDescription.textContent = "Requesting Python AI prediction";

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ intensity })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Prediction failed");
    }

    // Ignore old responses if the slider moved again.
    if (currentRequest !== requestNumber) return;

    lightStatus.textContent = result.status;
    brightnessValue.textContent = result.brightness;
    statusDescription.textContent = result.message;
    modelStatus.textContent = "Connected";
    connectionStatus.textContent = "AI Backend Online";
    decisionReason.textContent =
      `AI detected ${intensity}% environmental light. ` +
      `Recommended streetlight state: ${result.status}, ` +
      `brightness: ${result.brightness}%.`;

    updateHighway(intensity, result.status);
    updateEnergy(result.brightness);

  } catch (error) {
    if (currentRequest !== requestNumber) return;

    modelStatus.textContent = "Offline";
    connectionStatus.textContent = "Backend Offline";
    lightStatus.textContent = "Unavailable";
    brightnessValue.textContent = "--";
    statusDescription.textContent = "Could not reach Python AI";
    sceneLabel.textContent = "AI BACKEND NOT CONNECTED";
    decisionReason.textContent =
      "Start the Python Flask backend to enable AI predictions.";
    errorMessage.textContent =
      `Connection error: ${error.message}`;
  }
}

slider.addEventListener("input", predictLighting);

document.querySelectorAll("[data-intensity]").forEach((button) => {
  button.addEventListener("click", () => {
    slider.value = button.dataset.intensity;
    predictLighting();
  });
});

// Check backend and get initial prediction.
fetch(`${API_URL}/`)
  .then((response) => {
    if (!response.ok) throw new Error("Backend unavailable");
    return response.json();
  })
  .then(() => {
    connectionStatus.textContent = "AI Backend Online";
    predictLighting();
  })
  .catch(() => {
    connectionStatus.textContent = "Backend Offline";
    modelStatus.textContent = "Offline";
    errorMessage.textContent =
      "Python backend start chesi page refresh cheyyi.";
  });
