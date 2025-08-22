export interface CattleData {
  id: string;
  nodeId: string;
  status: 'Normal' | 'Warning' | 'Critical';
  temperature: number;
  heartRate: number;
  spO2: number;
  lastSeen: string;
  rssi: number;
  temperatureHistory: Array<{
    timestamp: string;
    value: number;
  }>;
  heartRateHistory: Array<{
    timestamp: string;
    value: number;
  }>;
  spO2History: Array<{
    timestamp: string;
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