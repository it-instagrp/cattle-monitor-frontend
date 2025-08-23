// src/lib/data.ts

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { CattleData, HerdSummary, AccelData, GyroData } from '@/types/cattle';

// --- 1. Firebase Configuration ---
// IMPORTANT: Replace with your project's Firebase credentials
const firebaseConfig = {
  apiKey: "AIzaSyDmPwxHAzKKNplV4ZRAPhR7j_JTPkv-6Jc",
  authDomain: "cattle-monitoring-db.firebaseapp.com",
  databaseURL: "https://cattle-monitoring-db-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cattle-monitoring-db",
  storageBucket: "cattle-monitoring-db.firebasestorage.app",
  messagingSenderId: "758571900351",
  appId: "1:758571900351:web:3fd9ea6dda9bd05b37950a",
  measurementId: "G-QY1QXLS7EF"
};

// --- Interfaces for raw Firebase data ---
interface FirebaseCattleRecord {
  accel: AccelData;
  bpm: number;
  gyro: GyroData;
  nodeId: string;
  rssi: number;
  temp: number;
  timestamp: number;
}

// --- 2. Initialize Firebase and Data Store ---
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const cattleDataRef = ref(database, 'cattleData');

// This array will hold the processed data, acting as our live in-memory store
let processedCattleData: CattleData[] = [];

// --- 3. Helper Functions (to transform raw data into UI-ready data) ---

// Re-used from your mockData file
const calculateActivity = (accel: AccelData, gyro: GyroData): number => {
  const accelMagnitude = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
  const gyroMagnitude = Math.sqrt(gyro.x * gyro.x + gyro.y * gyro.y + gyro.z * gyro.z);
  // All numbers are now formatted to one decimal point
  return parseFloat(((accelMagnitude + gyroMagnitude) * 10).toFixed(1));
};

// New function to determine status based on vitals
const determineStatus = (temp: number, bpm: number): 'Normal' | 'Warning' | 'Critical' => {
  if (temp > 40.5 || bpm > 100) return 'Critical';
  if (temp > 39.5 || bpm > 90) return 'Warning';
  return 'Normal';
};

// New function to format timestamps into "X mins ago"
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
};

// --- Mock History Generation (kept to avoid UI changes) ---
// These functions generate plausible history based on the LATEST live data point.
const generateTemperatureHistory = (baseTemp: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    history.push({
      timestamp: Date.now() - (i * 3600 * 1000),
      // All numbers are now formatted to one decimal point
      value: parseFloat((baseTemp + (Math.random() - 0.5) * 1.5).toFixed(1)),
    });
  }
  return history;
};

const generateHeartRateHistory = (baseRate: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    history.push({
      timestamp: Date.now() - (i * 3600 * 1000),
      // All numbers are now formatted to one decimal point
      value: parseFloat((baseRate + (Math.random() - 0.5) * 15).toFixed(1)),
    });
  }
  return history;
};

const generateActivityHistory = () => {
  const activity = [];
  for (let i = 0; i < 24; i++) {
    activity.push({
      hour: i,
      // All numbers are now formatted to one decimal point
      activity: parseFloat((Math.random() * 80).toFixed(1))
    });
  }
  return activity;
};


// --- 4. Firebase Real-time Listener ---
// This is the core function that listens for data and transforms it.
onValue(cattleDataRef, (snapshot) => {
  const rawData = snapshot.val() as Record<string, FirebaseCattleRecord>;
  if (rawData) {
    const transformedData = Object.entries(rawData).map(([id, record]) => {
      // For each record from Firebase, build the rich CattleData object
      return {
        id, // Use the Firebase unique key as the ID
        nodeId: record.nodeId,
        temp: record.temp,
        bpm: record.bpm,
        accel: record.accel,
        gyro: record.gyro,
        rssi: record.rssi,
        timestamp: record.timestamp,
        // --- Derived & Generated Data ---
        status: determineStatus(record.temp, record.bpm),
        lastSeen: formatTimeAgo(record.timestamp),
        activity: calculateActivity(record.accel, record.gyro),
        temperatureHistory: generateTemperatureHistory(record.temp),
        heartRateHistory: generateHeartRateHistory(record.bpm),
        activityHistory: generateActivityHistory(),
      };
    });
    // Sort by timestamp so the newest data is first
    processedCattleData = transformedData.sort((a, b) => b.timestamp - a.timestamp);
    console.log("Live data processed and updated.", processedCattleData);
    // Note: To make your UI update, you'll need to use this data within a React state hook (useState/useEffect)
  }
});

// --- 5. Exported Functions (for your UI components to use) ---
// These functions now provide live data instead of static mock data.

export const getAllCattleData = (): CattleData[] => {
  return processedCattleData;
};

export const getCowById = (id: string): CattleData | undefined => {
  return processedCattleData.find(cow => cow.id === id);
};

export const getHerdSummary = (): HerdSummary => {
  if (processedCattleData.length === 0) {
    return { totalCattle: 0, activeAlerts: 0, averageRssi: 0, networkHealth: 'Poor' };
  }
  const activeAlerts = processedCattleData.filter(cow => cow.status !== 'Normal').length;
  // All numbers are now formatted to one decimal point
  const averageRssi = parseFloat((processedCattleData.reduce((sum, cow) => sum + cow.rssi, 0) / processedCattleData.length).toFixed(1));
  
  let networkHealth: 'Good' | 'Fair' | 'Poor' = 'Good';
  if (averageRssi < -90) networkHealth = 'Poor';
  else if (averageRssi < -80) networkHealth = 'Fair';

  return {
    totalCattle: processedCattleData.length,
    activeAlerts,
    averageRssi,
    networkHealth,
  };
};