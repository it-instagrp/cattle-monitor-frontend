import { CattleData, HerdSummary } from '@/types/cattle';

// Generate mock historical data
const generateTemperatureHistory = (baseTemp: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setHours(date.getHours() - i);
    history.push({
      timestamp: date.toISOString(),
      value: baseTemp + (Math.random() - 0.5) * 2,
    });
  }
  return history;
};

const generateHeartRateHistory = (baseRate: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setHours(date.getHours() - i);
    history.push({
      timestamp: date.toISOString(),
      value: baseRate + (Math.random() - 0.5) * 20,
    });
  }
  return history;
};

const generateSpO2History = (baseSpO2: number) => {
  const history = [];
  for (let i = 23; i >= 0; i--) {
    const date = new Date();
    date.setHours(date.getHours() - i);
    history.push({
      timestamp: date.toISOString(),
      value: baseSpO2 + (Math.random() - 0.5) * 5,
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

export const mockCattleData: CattleData[] = [
  {
    id: '1',
    nodeId: 'Node 00001',
    status: 'Normal',
    temperature: 38.2,
    heartRate: 72,
    spO2: 98,
    lastSeen: '2 mins ago',
    rssi: -75,
    temperatureHistory: generateTemperatureHistory(38.2),
    heartRateHistory: generateHeartRateHistory(72),
    spO2History: generateSpO2History(98),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '2',
    nodeId: 'Node 00002',
    status: 'Warning',
    temperature: 39.8,
    heartRate: 92,
    spO2: 96,
    lastSeen: '1 min ago',
    rssi: -82,
    temperatureHistory: generateTemperatureHistory(39.8),
    heartRateHistory: generateHeartRateHistory(92),
    spO2History: generateSpO2History(96),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '3',
    nodeId: 'Node 00003',
    status: 'Critical',
    temperature: 40.5,
    heartRate: 105,
    spO2: 93,
    lastSeen: '30 secs ago',
    rssi: -95,
    temperatureHistory: generateTemperatureHistory(40.5),
    heartRateHistory: generateHeartRateHistory(105),
    spO2History: generateSpO2History(93),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '4',
    nodeId: 'Node 00004',
    status: 'Normal',
    temperature: 37.9,
    heartRate: 68,
    spO2: 99,
    lastSeen: '3 mins ago',
    rssi: -78,
    temperatureHistory: generateTemperatureHistory(37.9),
    heartRateHistory: generateHeartRateHistory(68),
    spO2History: generateSpO2History(99),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '5',
    nodeId: 'Node 00005',
    status: 'Normal',
    temperature: 38.1,
    heartRate: 74,
    spO2: 97,
    lastSeen: '1 min ago',
    rssi: -73,
    temperatureHistory: generateTemperatureHistory(38.1),
    heartRateHistory: generateHeartRateHistory(74),
    spO2History: generateSpO2History(97),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '6',
    nodeId: 'Node 00006',
    status: 'Warning',
    temperature: 39.3,
    heartRate: 88,
    spO2: 95,
    lastSeen: '4 mins ago',
    rssi: -88,
    temperatureHistory: generateTemperatureHistory(39.3),
    heartRateHistory: generateHeartRateHistory(88),
    spO2History: generateSpO2History(95),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '7',
    nodeId: 'Node 00007',
    status: 'Normal',
    temperature: 38.3,
    heartRate: 70,
    spO2: 98,
    lastSeen: '2 mins ago',
    rssi: -76,
    temperatureHistory: generateTemperatureHistory(38.3),
    heartRateHistory: generateHeartRateHistory(70),
    spO2History: generateSpO2History(98),
    activityHistory: generateActivityHistory(),
  },
  {
    id: '8',
    nodeId: 'Node 00008',
    status: 'Normal',
    temperature: 37.8,
    heartRate: 66,
    spO2: 99,
    lastSeen: '5 mins ago',
    rssi: -80,
    temperatureHistory: generateTemperatureHistory(37.8),
    heartRateHistory: generateHeartRateHistory(66),
    spO2History: generateSpO2History(99),
    activityHistory: generateActivityHistory(),
  },
];

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