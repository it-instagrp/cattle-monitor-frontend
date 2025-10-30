// src/data/data.ts

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { CattleData, HerdSummary, AccelData, GyroData } from '@/types/cattle';

// --- 1. Firebase Configuration ---
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

export interface NodeSummaryCard {
    id: string;
    nodeId: string;
    status: 'Normal' | 'Warning' | 'Critical';
    avgTemp: number;
    avgBpm: number;
    avgActivity: number;
    avgRssi: number;
    lastSeen: string;
}

export type DetailRecord = Omit<CattleData, 'temperatureHistory' | 'heartRateHistory' | 'activityHistory' | 'id'>;

interface DetailedHistory {
    temperatureHistory: Array<{ timestamp: number; value: number }>;
    heartRateHistory: Array<{ timestamp: number; value: number }>;
    activityHistory: Array<{ hour: number; activity: number }>;
    rawRecords: DetailRecord[];
}

export interface AggregatedCowData {
    nodeId: string;
    status: 'Normal' | 'Warning' | 'Critical';
    lastSeen: string;
    avgTemp: number;
    avgBpm: number;
    avgActivity: number;
    temperatureHistory: Array<{ timestamp: number; value: number }>;
    heartRateHistory: Array<{ timestamp: number; value: number }>;
    activityHistory: Array<{ hour: number; activity: number }>;
}

// --- 2. Initialize Firebase and Data Store ---
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const cattleDataRef = ref(database, 'cattleData');

let rawCattleData: Record<string, FirebaseCattleRecord> = {};
let cattleHistoryMap: Record<string, DetailedHistory> = {};


// --- 3. Helper Functions ---

const calculateActivity = (accel: AccelData, gyro: GyroData): number => {
    const accelMagnitude = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
    const gyroMagnitude = Math.sqrt(gyro.x * gyro.x + gyro.y * gyro.y + gyro.z * gyro.z);
    return parseFloat(((accelMagnitude + gyroMagnitude) * 10).toFixed(1));
};

const determineStatus = (temp: number, bpm: number): 'Normal' | 'Warning' | 'Critical' => {
    if (temp > 40.5 || bpm > 100) return 'Critical';
    if (temp > 39.5 || bpm > 90) return 'Warning';
    return 'Normal';
};

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

const generateMockHistory = (baseValue: number, fluctuation: number, hours: number = 720) => {
    const history = [];
    for (let i = hours - 1; i >= 0; i--) {
        history.push({
            timestamp: Date.now() - (i * 3600 * 1000),
            value: parseFloat((baseValue + (Math.random() - 0.5) * fluctuation).toFixed(1)),
        });
    }
    return history;
};

const generateActivityHistory = () => {
    const activity = [];
    for (let i = 0; i < 24; i++) {
        activity.push({
            hour: i,
            activity: parseFloat((Math.random() * 80).toFixed(1))
        });
    }
    return activity;
};

const calculateAverageForTimeRange = (
    history: Array<{ timestamp: number; value: number }>,
    days: number
) => {
    if (history.length === 0) return 0;

    const oneDayMs = 24 * 3600 * 1000;
    const timeThreshold = Date.now() - (days * oneDayMs);

    const relevantData = history.filter(item => item.timestamp >= timeThreshold);

    if (relevantData.length === 0) return 0;

    const sum = relevantData.reduce((acc, curr) => acc + curr.value, 0);
    return parseFloat((sum / relevantData.length).toFixed(1));
};

const transformRecordToDetail = (id: string, record: FirebaseCattleRecord): DetailRecord => {
    return {
        nodeId: record.nodeId,
        temp: record.temp,
        bpm: record.bpm,
        accel: record.accel,
        gyro: record.gyro,
        rssi: record.rssi,
        timestamp: record.timestamp,
        status: determineStatus(record.temp, record.bpm),
        lastSeen: formatTimeAgo(record.timestamp),
        activity: calculateActivity(record.accel, record.gyro),
    };
};

// --- 4. Firebase Real-time Listener ---
onValue(cattleDataRef, (snapshot) => {
    const newRawData = snapshot.val() as Record<string, FirebaseCattleRecord>;
    if (newRawData) {
        rawCattleData = newRawData;
        const allRecords = Object.values(rawCattleData);

        const groupedData = allRecords.reduce((acc, record) => {
            if (!acc[record.nodeId]) {
                acc[record.nodeId] = [];
            }
            acc[record.nodeId].push(record);
            return acc;
        }, {} as Record<string, FirebaseCattleRecord[]>);

        Object.keys(groupedData).forEach(nodeId => {
            const latestRecord = groupedData[nodeId].sort((a, b) => b.timestamp - a.timestamp)[0];
            if (!latestRecord) return;

            const tempHistory = generateMockHistory(latestRecord.temp, 1.5, 720);
            const heartRateHistory = generateMockHistory(latestRecord.bpm, 15, 720);
            const activityHistory = generateActivityHistory();

            const rawRecords = groupedData[nodeId]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(record => transformRecordToDetail(record.nodeId, record));

            cattleHistoryMap[nodeId] = {
                temperatureHistory: tempHistory,
                heartRateHistory: heartRateHistory,
                activityHistory: activityHistory,
                rawRecords: rawRecords,
            };
        });
    }
});

// --- 5. Exported Functions (for your UI components to use) ---

export const getOverviewCardsData = (): NodeSummaryCard[] => {
    const nodeIds = ['Node 00001', 'Node 00002', 'Node 00003', 'Node 00004', 'Node 00005'];

    const summaries: NodeSummaryCard[] = nodeIds.map(nodeId => {
        const history = cattleHistoryMap[nodeId];

        if (!history || history.rawRecords.length === 0) {
            return {
                id: nodeId,
                nodeId,
                status: 'Normal',
                avgTemp: 0,
                avgBpm: 0,
                avgActivity: 0,
                avgRssi: 0,
                lastSeen: 'N/A'
            };
        }

        const avgTemp = calculateAverageForTimeRange(history.temperatureHistory, 7);
        const avgBpm = calculateAverageForTimeRange(history.heartRateHistory, 7);

        const avgActivity = parseFloat(
            (history.rawRecords.slice(0, 7).reduce((sum, r) => sum + r.activity, 0) / Math.min(7, history.rawRecords.length)).toFixed(1)
        );

        const avgRssi = parseFloat(
            (history.rawRecords.slice(0, 7).reduce((sum, r) => sum + r.rssi, 0) / Math.min(7, history.rawRecords.length)).toFixed(1)
        );

        const latestRecord = history.rawRecords[0];

        return {
            id: latestRecord.nodeId,
            nodeId: latestRecord.nodeId,
            status: latestRecord.status,
            avgTemp,
            avgBpm,
            avgActivity,
            avgRssi,
            lastSeen: latestRecord.lastSeen,
        };
    });

    return summaries.filter(s => s.avgTemp > 0);
};

export const getAggregatedDataForCow = (
    nodeId: string,
    timeRange: '6h' | '12h' | '24h' | '7d' | '30d',
): AggregatedCowData | null => {
    const history = cattleHistoryMap[nodeId];
    if (!history) return null;

    let hours: number;
    let days: number;

    switch (timeRange) {
        case '6h': hours = 6; days = 0.25; break;
        case '12h': hours = 12; days = 0.5; break;
        case '24h': hours = 24; days = 1; break;
        case '7d': hours = 7 * 24; days = 7; break;
        case '30d': hours = 30 * 24; days = 30; break;
        default: hours = 24; days = 1;
    }

    const chartDataCount = Math.min(hours, history.temperatureHistory.length);

    const temperature = history.temperatureHistory.slice(-chartDataCount);
    const heartRate = history.heartRateHistory.slice(-chartDataCount);

    const avgTemp = calculateAverageForTimeRange(history.temperatureHistory, days);
    const avgBpm = calculateAverageForTimeRange(history.heartRateHistory, days);

    const oneDayMs = 24 * 3600 * 1000;
    const timeThreshold = Date.now() - (days * oneDayMs);
    const relevantRecords = history.rawRecords.filter(item => item.timestamp >= timeThreshold);

    const avgActivity = parseFloat(
        (relevantRecords.reduce((sum, r) => sum + r.activity, 0) / relevantRecords.length).toFixed(1)
    ) || 0;

    // Define a safe fallback record to ensure status and lastSeen exist
    const emptyRecord: DetailRecord = {
        nodeId: nodeId,
        temp: 0,
        bpm: 0,
        accel: { x: 0, y: 0, z: 0 },
        gyro: { x: 0, y: 0, z: 0 },
        rssi: 0,
        timestamp: 0,
        status: 'Normal',
        lastSeen: 'N/A',
        activity: 0,
    };

    // Use the latest record or the fallback
    const latestRecord: DetailRecord = history.rawRecords[0] || emptyRecord;


    return {
        nodeId: nodeId,
        status: latestRecord.status,
        lastSeen: latestRecord.lastSeen,
        avgTemp,
        avgBpm,
        avgActivity,
        temperatureHistory: temperature,
        heartRateHistory: heartRate,
        activityHistory: history.activityHistory,
    };
};

export const getPaginatedRecordsForCow = (
    nodeId: string,
    page: number = 1,
    pageSize: number = 10
) => {
    const history = cattleHistoryMap[nodeId];
    if (!history) return { records: [], total: 0 };

    const sortedRecords = history.rawRecords;
    const total = sortedRecords.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedRecords = sortedRecords.slice(startIndex, endIndex);

    return {
        records: paginatedRecords,
        total: total,
    };
};

export const getHerdSummary = (): HerdSummary => {
    const allRecords = Object.values(rawCattleData).map(record => ({
        ...record,
        status: determineStatus(record.temp, record.bpm),
        rssi: record.rssi
    }));

    if (allRecords.length === 0) {
        return { totalCattle: 0, activeAlerts: 0, averageRssi: 0, networkHealth: 'Poor' };
    }
    const activeAlerts = allRecords.filter(cow => cow.status !== 'Normal').length;
    const averageRssi = parseFloat((allRecords.reduce((sum, cow) => sum + cow.rssi, 0) / allRecords.length).toFixed(1));

    let networkHealth: 'Good' | 'Fair' | 'Poor' = 'Good';
    if (averageRssi < -90) networkHealth = 'Poor';
    else if (averageRssi < -80) networkHealth = 'Fair';

    return {
        totalCattle: Object.keys(cattleHistoryMap).length,
        activeAlerts,
        averageRssi,
        networkHealth,
    };
};