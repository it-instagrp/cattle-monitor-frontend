export interface AccelData {
  x: number;
  y: number;
  z: number;
}

export interface GyroData {
  x: number;
  y: number;
  z: number;
}

export interface CattleRecord {
  accel: AccelData;
  bpm: number;
  gyro: GyroData;
  nodeId: string;
  rssi: number;
  temp: number;
  timestamp: number;
}

export interface CattleData {
  id: string;
  nodeId: string;
  status: 'Normal' | 'Warning' | 'Critical';
  temp: number;
  bpm: number;
  accel: AccelData;
  gyro: GyroData;
  rssi: number;
  timestamp: number;
  lastSeen: string;
  activity: number; // Calculated from accel/gyro
  temperatureHistory: Array<{
    timestamp: number;
    value: number;
  }>;
  heartRateHistory: Array<{
    timestamp: number;
    value: number;
  }>;
  activityHistory: Array<{
    hour: number;
    activity: number;
  }>;
}

export interface HerdSummary {
  totalCattle: number;
  activeAlerts: number;
  averageRssi: number;
  networkHealth: 'Good' | 'Fair' | 'Poor';
}