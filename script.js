
const heartRateElement = document.getElementById("heartRate");
const oxygenElement = document.getElementById("oxygen");
const temperatureElement = document.getElementById("temperature");

const heartStatusElement = document.getElementById("heartStatus");
const oxygenStatusElement = document.getElementById("oxygenStatus");
const temperatureStatusElement = document.getElementById("temperatureStatus");

const overallStatusElement = document.getElementById("overallStatus");
const alertMessageElement = document.getElementById("alertMessage");
const lastUpdatedElement = document.getElementById("lastUpdated");

const simulateBtn = document.getElementById("simulateBtn");
const alertBtn = document.getElementById("alertBtn");
const resetBtn = document.getElementById("resetBtn");

const chartCanvas = document.getElementById("healthChart");
const ctx = chartCanvas.getContext("2d");

// Demonstration thresholds only.
// They are not NASA medical standards.

const thresholds = {
    heartMin: 50,
    heartMax: 100,
    oxygenMin: 95,
    tempMin: 36.1,
    tempMax: 37.2
};

let readings = {
    heartRate: 72,
    oxygen: 98,
    temperature: 36.8
};

let history = [72, 74, 71, 73, 75, 72, 76];
let labels = ["1", "2", "3", "4", "5", "6", "7"];

// Check health values against demonstration thresholds.

function getStatus(value, min, max) {
    if (value < min || value > max) {
        return "WARNING";
    }

    return "NORMAL";
}

// Update a status label.

function updateStatus(element, status) {
    element.textContent = status;

    element.classList.remove(
        "normal",
        "warning",
        "critical"
    );

    if (status === "NORMAL") {
        element.classList.add("normal");
    } else if (status === "WARNING") {
        element.classList.add("warning");
    } else {
        element.classList.add("critical");
    }
}

// Update the dashboard.

function updateDashboard() {
    heartRateElement.textContent = readings.heartRate;
    oxygenElement.textContent = readings.oxygen;
    temperatureElement.textContent = readings.temperature.toFixed(1);

    const heartStatus = getStatus(
        readings.heartRate,
        thresholds.heartMin,
        thresholds.heartMax
    );

    const oxygenStatus = getStatus(
        readings.oxygen,
        thresholds.oxygenMin,
        100
    );

    const temperatureStatus = getStatus(
        readings.temperature,
        thresholds.tempMin,
        thresholds.tempMax
    );

    updateStatus(heartStatusElement, heartStatus);
    updateStatus(oxygenStatusElement, oxygenStatus);
    updateStatus(temperatureStatusElement, temperatureStatus);

    const statuses = [
        heartStatus,
        oxygenStatus,
        temperatureStatus
    ];

    const hasWarning = statuses.includes("WARNING");

    if (hasWarning) {
        updateStatus(overallStatusElement, "WARNING");

        alertMessageElement.className = "alert warning-alert";

        alertMessageElement.innerHTML = `
            <span>⚠</span>
            <div>
                <strong>Potential health concern detected</strong>
                <p>
                    One or more simulated vital signs are outside
                    the configured demonstration thresholds.
                    Review the readings.
                </p>
            </div>
        `;
    } else {
        updateStatus(overallStatusElement, "NORMAL");

        alertMessageElement.className = "alert normal-alert";

        alertMessageElement.innerHTML = `
            <span>✓</span>
            <div>
                <strong>All systems normal</strong>
                <p>
                    No demo threshold alerts detected.
                </p>
            </div>
        `;
    }

    lastUpdatedElement.textContent =
        "Last updated: " + new Date().toLocaleTimeString();

    drawChart();
}

// Generate simulated readings.

function simulateReadings() {
    readings.heartRate = Math.floor(
        Math.random() * 21 + 65
    );

    readings.oxygen = Math.floor(
        Math.random() * 4 + 96
    );

    readings.temperature = Number(
        (Math.random() * 0.6 + 36.5).toFixed(1)
    );

    history.push(readings.heartRate);
    labels.push(String(labels.length + 1));

    if (history.length > 10) {
        history.shift();
        labels.shift();
    }

    updateDashboard();
}

// Demonstrate an abnormal reading.

function simulateAbnormalReading() {
    readings.heartRate = 115;
    readings.oxygen = 90;
    readings.temperature = 38.0;

    history.push(readings.heartRate);
    labels.push(String(labels.length + 1));

    if (history.length > 10) {
        history.shift();
        labels.shift();
    }

    updateDashboard();
}

// Reset the demonstration.

function resetDemo() {
    readings = {
        heartRate: 72,
        oxygen: 98,
        temperature: 36.8
    };

    history = [72, 74, 71, 73, 75, 72, 76];
    labels = ["1", "2", "3", "4", "5", "6", "7"];

    updateDashboard();
}

// Draw a simple health trend graph.

function drawChart() {
    const rect = chartCanvas.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;

    chartCanvas.width = rect.width * dpr;
    chartCanvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const padding = 35;
    const minValue = 40;
    const maxValue = 130;

    function getX(index) {
        if (history.length === 1) {
            return padding;
        }

        return padding +
            index * (width - 2 * padding) /
            (history.length - 1);
    }

    function getY(value) {
        return height - padding -
            (value - minValue) *
            (height - 2 * padding) /
            (maxValue - minValue);
    }

    // Draw grid lines.

    ctx.strokeStyle = "#26354e";
    ctx.lineWidth = 1;

    for (let value = 50; value <= 120; value += 20) {
        const y = getY(value);

        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px Arial";
        ctx.fillText(value, 3, y + 4);
    }

    // Draw heart rate line.

    ctx.beginPath();

    history.forEach((value, index) => {
        const x = getX(index);
        const y = getY(value);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw data points.

    history.forEach((value, index) => {
        const x = getX(index);
        const y = getY(value);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);

        ctx.fillStyle = "#60a5fa";
        ctx.fill();
    });

    // Draw labels.

    history.forEach((value, index) => {
        const x = getX(index);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px Arial";

        ctx.fillText(
            labels[index],
            x - 3,
            height - 8
        );
    });
}

// Connect buttons.

simulateBtn.addEventListener(
    "click",
    simulateReadings
);

alertBtn.addEventListener(
    "click",
    simulateAbnormalReading
);

resetBtn.addEventListener(
    "click",
    resetDemo
);

// Redraw chart when the screen size changes.

window.addEventListener("resize", drawChart);

// Start the website.

updateDashboard();
