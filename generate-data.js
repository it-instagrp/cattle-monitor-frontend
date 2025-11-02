import fs from "fs";

// Helper for smooth drift
const smoothVar = (val, step, min, max) => {
  const newVal = val + (Math.random() * 2 - 1) * step;
  return Math.min(max, Math.max(min, newVal));
};

// Generate node baselines
const nodes = Array.from({ length: 5 }, (_, i) => `Node ${String(i + 1).padStart(5, "0")}`);

const baselines = {};
nodes.forEach((n) => {
  baselines[n] = {
    // New BPM baseline: 70-80
    bpm: 73 + Math.random() * 4,
    // New Temp baseline: 37.78-38.89
    temp: 38.0 + Math.random() * 0.5,
    // New SpO2 baseline: 85-90
    spo2: 86.0 + Math.random() * 3,
    rssi: -100 + Math.random() * 10,
    accel: { x: Math.random() * 0.2 - 0.1, y: Math.random() * 0.2 - 0.1, z: -0.95 },
    gyro: { x: 0.3 + Math.random() * 0.7, y: 0.3 + Math.random() * 0.6, z: 0.8 + Math.random() },
  };
});

// Time setup
const now = new Date();
const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days back
let time = new Date(start);
let id = 0;
const data = {};

while (time <= now) {
  nodes.forEach((node) => {
    id++;
    const b = baselines[node];

    // UPDATED LIMITS: BPM between 70 to 80
    b.bpm = smoothVar(b.bpm, 0.8, 70, 80);
    // UPDATED LIMITS: Temperature between 37.78 to 38.89
    b.temp = smoothVar(b.temp, 0.05, 37.78, 38.89);
    // UPDATED LIMITS: SpO2 between 85% to 90%
    b.spo2 = smoothVar(b.spo2, 0.15, 85.0, 90.0);

    // Other parameters remain with original limits
    b.rssi = smoothVar(b.rssi, 2, -110, -85);
    b.accel.x = smoothVar(b.accel.x, 0.05, -0.3, 0.3);
    b.accel.y = smoothVar(b.accel.y, 0.05, -0.3, 0.3);
    b.accel.z = smoothVar(b.accel.z, 0.02, -1.0, -0.9);
    b.gyro.x = smoothVar(b.gyro.x, 0.1, 0.2, 1.5);
    b.gyro.y = smoothVar(b.gyro.y, 0.1, 0.2, 1.2);
    b.gyro.z = smoothVar(b.gyro.z, 0.15, 0.5, 2.5);

    data[`-AUTO${String(id).padStart(6, "0")}`] = {
      accel: {
        x: +b.accel.x.toFixed(2),
        y: +b.accel.y.toFixed(2),
        z: +b.accel.z.toFixed(2),
      },
      bpm: +b.bpm.toFixed(2),
      gyro: {
        x: +b.gyro.x.toFixed(2),
        y: +b.gyro.y.toFixed(2),
        z: +b.gyro.z.toFixed(2),
      },
      nodeId: node,
      rssi: Math.round(b.rssi),
      spo2: +b.spo2.toFixed(2),
      temp: +b.temp.toFixed(2),
      timestamp: time.getTime(),
    };
  });
  time = new Date(time.getTime() + 10 * 60 * 1000);
}

// Save to file
fs.writeFileSync("cattleData_30days_normal.json", JSON.stringify(data, null, 2));
console.log("✅ File generated: cattleData_30days_normal.json");