import { CattleData, HerdSummary } from '@/types/cattle';

// Utility function to calculate activity from accelerometer and gyroscope data
const calculateActivity = (accel: { x: number; y: number; z: number }, gyro: { x: number; y: number; z: number }): number => {
  const accelMagnitude = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
  const gyroMagnitude = Math.sqrt(gyro.x * gyro.x + gyro.y * gyro.y + gyro.z * gyro.z);
  return Math.round((accelMagnitude + gyroMagnitude) * 10);
};

// Generate mock historical data
const generateTemperatureHistory = (baseTemp: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    const timestamp = Date.now() - (i * 60 * 60 * 1000);
    history.push({
      timestamp,
      value: baseTemp + (Math.random() - 0.5) * 2,
    });
  }
  return history;
};

const generateHeartRateHistory = (baseRate: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    const timestamp = Date.now() - (i * 60 * 60 * 1000);
    history.push({
      timestamp,
      value: baseRate + (Math.random() - 0.5) * 20,
    });
  }
  return history;
};

const generateActivityHistory = () => {
  const activity = [];
  for (let i = 0; i < 24; i++) {
    activity.push({
      hour: i,
      activity: Math.floor(Math.random() * 100),
    });
  }
  return activity;
};

const generateAccelData = () => ({
  x: (Math.random() - 0.5) * 2,
  y: (Math.random() - 0.5) * 2,
  z: -0.8 + (Math.random() - 0.5) * 0.4,
});

const generateGyroData = () => ({
  x: (Math.random() - 0.5) * 4,
  y: (Math.random() - 0.5) * 4,
  z: (Math.random() - 0.5) * 6,
});

export const mockCattleData: CattleData[] = [
  {
    id: '1',
    nodeId: 'Node 00001',
    status: 'Normal',
    temp: 26.67,
    bpm: 72.68,
    accel: { x: -0.44, y: -0.19, z: -0.9 },
    gyro: { x: 1.58, y: 1.01, z: 3.1 },
    rssi: -102,
    timestamp: 1755877275245,
    lastSeen: '2 mins ago',
    activity: calculateActivity({ x: -0.44, y: -0.19, z: -0.9 }, { x: 1.58, y: 1.01, z: 3.1 }),
    temperatureHistory: generateTemperatureHistory(26.67),
    heartRateHistory: generateHeartRateHistory(72.68),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '2',
    nodeId: 'Node 00002',
    status: 'Warning',
    temp: 39.8,
    bpm: 92,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -82,
    timestamp: Date.now() - 60000,
    lastSeen: '1 min ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(39.8),
    heartRateHistory: generateHeartRateHistory(92),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '3',
    nodeId: 'Node 00003',
    status: 'Critical',
    temp: 40.5,
    bpm: 105,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -95,
    timestamp: Date.now() - 30000,
    lastSeen: '30 secs ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(40.5),
    heartRateHistory: generateHeartRateHistory(105),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '4',
    nodeId: 'Node 00004',
    status: 'Normal',
    temp: 37.9,
    bpm: 68,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -78,
    timestamp: Date.now() - 180000,
    lastSeen: '3 mins ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(37.9),
    heartRateHistory: generateHeartRateHistory(68),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '5',
    nodeId: 'Node 00005',
    status: 'Normal',
    temp: 38.1,
    bpm: 74,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -73,
    timestamp: Date.now() - 60000,
    lastSeen: '1 min ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(38.1),
    heartRateHistory: generateHeartRateHistory(74),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '6',
    nodeId: 'Node 00006',
    status: 'Warning',
    temp: 39.3,
    bpm: 88,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -88,
    timestamp: Date.now() - 240000,
    lastSeen: '4 mins ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(39.3),
    heartRateHistory: generateHeartRateHistory(88),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '7',
    nodeId: 'Node 00007',
    status: 'Normal',
    temp: 38.3,
    bpm: 70,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -76,
    timestamp: Date.now() - 120000,
    lastSeen: '2 mins ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(38.3),
    heartRateHistory: generateHeartRateHistory(70),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '8',
    nodeId: 'Node 00008',
    status: 'Normal',
    temp: 37.8,
    bpm: 66,
    accel: generateAccelData(),
    gyro: generateGyroData(),
    rssi: -80,
    timestamp: Date.now() - 300000,
    lastSeen: '5 mins ago',
    activity: 0,
    temperatureHistory: generateTemperatureHistory(37.8),
    heartRateHistory: generateHeartRateHistory(66),
    activityHistory: generateActivityHistory(),
  },
];

// Calculate activity for all mock data
mockCattleData.forEach(cow => {
  cow.activity = calculateActivity(cow.accel, cow.gyro);
});

export const getHerdSummary = (): HerdSummary => {
  const activeAlerts = mockCattleData.filter(cow => cow.status !== 'Normal').length;
  const averageRssi = Math.round(mockCattleData.reduce((sum, cow) => sum + cow.rssi, 0) / mockCattleData.length);
  
  let networkHealth: 'Good' | 'Fair' | 'Poor' = 'Good';
  if (averageRssi < -90) networkHealth = 'Poor';
  else if (averageRssi < -80) networkHealth = 'Fair';

  return {
    totalCattle: mockCattleData.length,
    activeAlerts,
    averageRssi,
    networkHealth,
  };
};

export const getCowById = (id: string): CattleData | undefined => {
  return mockCattleData.find(cow => cow.id === id);
};