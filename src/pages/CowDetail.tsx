import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Thermometer, Heart, Activity } from "lucide-react";
import { getAggregatedDataForCow, getPaginatedRecordsForCow, DetailRecord, AggregatedCowData } from "@/data/data";
import { StatusBadge } from "@/components/StatusBadge";
import { SensorDataCard } from "@/components/SensorDataCard";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend 
} from "recharts";
import { 
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
    Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext 
} from "@/components/ui/pagination";
import { useState, useEffect, useCallback } from "react";
import { AccelData, GyroData } from "@/types/cattle";

type TimeRange = '6h' | '12h' | '24h' | '7d' | '30d';

type CowDetailState = AggregatedCowData;

const PAGE_SIZE = 10;

interface DetailRecordsTableProps {
    nodeId: string;
}

const DetailRecordsTable = ({ nodeId }: DetailRecordsTableProps) => {
    const [records, setRecords] = useState<DetailRecord[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    const fetchRecords = useCallback((page: number) => {
        const { records, total } = getPaginatedRecordsForCow(nodeId, page, PAGE_SIZE);
        setRecords(records);
        setTotalRecords(total);
        setCurrentPage(page);
    }, [nodeId]);

    useEffect(() => {
        fetchRecords(1);
    }, [nodeId, fetchRecords]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchRecords(currentPage); 
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchRecords, currentPage]);

    const handlePrevious = () => {
        const newPage = Math.max(1, currentPage - 1);
        if (newPage !== currentPage) {
            fetchRecords(newPage);
        }
    };
    
    const handleNext = () => {
        const newPage = Math.min(totalPages, currentPage + 1);
        if (newPage !== currentPage) {
            fetchRecords(newPage);
        }
    };

    return (
        <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Node Raw Records History</CardTitle>
                <div className="text-sm text-muted-foreground">
                    Displaying individual sensor readings (Page {currentPage} of {totalPages}, Total Records: {totalRecords})
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Temp (°C)</TableHead>
                                <TableHead className="font-semibold">BPM</TableHead>
                                <TableHead className="font-semibold">Activity</TableHead>
                                <TableHead className="font-semibold">RSSI (dBm)</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No historical records available for this node.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((record, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono">{record.temp.toFixed(1)}</TableCell>
                                        <TableCell className="font-mono">{record.bpm.toFixed(0)}</TableCell>
                                        <TableCell className="font-mono">{record.activity}</TableCell>
                                        <TableCell className="font-mono text-muted-foreground">{record.rssi}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={record.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                {totalRecords > PAGE_SIZE && (
                    <div className="flex justify-center mt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious onClick={handlePrevious} disabled={currentPage === 1} />
                                </PaginationItem>
                                <PaginationItem>
                                    <span className="text-sm font-medium text-muted-foreground px-4">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext onClick={handleNext} disabled={currentPage === totalPages} />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const CowDetail = () => {
  const { cowId: nodeId } = useParams<{ cowId: string }>(); 
  const navigate = useNavigate();
  
  const [chartTimeRange, setChartTimeRange] = useState<TimeRange>('24h');
  const [gaugeTimeRange, setGaugeTimeRange] = useState<TimeRange>('7d');
  
  const [data, setData] = useState<CowDetailState | undefined | null>(undefined);
  
  const [latestRawRecord, setLatestRawRecord] = useState<{ accel: AccelData; gyro: GyroData; rssi: number; timestamp: number; } | null>(null);

  const fetchData = useCallback(async () => {
    if (!nodeId) return;

    const chartData = getAggregatedDataForCow(nodeId, chartTimeRange);
    const gaugeData = getAggregatedDataForCow(nodeId, gaugeTimeRange);

    const latestRecord = getPaginatedRecordsForCow(nodeId, 1, 1).records[0];

    if (chartData && gaugeData && chartData.lastSeen !== 'N/A' && gaugeData.lastSeen !== 'N/A') {
        const fullData: CowDetailState = {
            nodeId: chartData.nodeId,
            status: chartData.status,
            lastSeen: chartData.lastSeen,
            avgTemp: gaugeData.avgTemp, 
            avgBpm: gaugeData.avgBpm,
            avgActivity: gaugeData.avgActivity,
            temperatureHistory: chartData.temperatureHistory,
            heartRateHistory: chartData.heartRateHistory,
            activityHistory: chartData.activityHistory,
        };
        
        setData(fullData);

        if (latestRecord) {
            setLatestRawRecord({
                accel: latestRecord.accel,
                gyro: latestRecord.gyro,
                rssi: latestRecord.rssi,
                timestamp: latestRecord.timestamp,
            });
        }
    } else {
        setData(null);
    }
  }, [nodeId, chartTimeRange, gaugeTimeRange]);


  useEffect(() => {
    fetchData(); 
    
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const getTimeRangeLabel = (range: TimeRange) => {
      switch(range) {
          case '7d': return 'Last 7 Days Average';
          case '30d': return 'Last 30 Days Average';
          default: return `Last ${range.replace('h', ' Hours')} Average`;
      }
  }


  const GaugeCard = ({
    title,
    value,
    unit,
    icon: Icon,
    min,
    max,
    type,
    setGaugeTimeRange,
    currentGaugeTimeRange,
  }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    min: number;
    max: number;
    type: "temperature" | "bpm" | "activity";
    setGaugeTimeRange: (range: TimeRange) => void;
    currentGaugeTimeRange: TimeRange;
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;

    let barColor = "bg-gray-400";
    if (type === "temperature") {
      barColor = (value >= 37.78 && value <= 38.89) ? "bg-green-500" : "bg-red-500";
    }
    if (type === "bpm") {
      if (value >= 70 && value <= 80) barColor = "bg-green-500";
      else if (value >= 60 && value < 70) barColor = "bg-yellow-400";
      else if (value > 80 && value <= 90) barColor = "bg-red-400";
      else barColor = "bg-red-600";
    }
    if (type === "activity") {
      if (value >= 20 && value <= 80) barColor = "bg-green-500";
      else if (value < 20) barColor = "bg-yellow-400";
      else barColor = "bg-red-500";
    }

    const legendItems =
      type === "temperature"
        ? [
          { color: "bg-green-500", label: "37.78–38.89°C (Normal)" },
          { color: "bg-red-500", label: "Out of Range (Critical)" },
        ]
        : type === "bpm"
          ? [
            { color: "bg-green-500", label: "70–80 BPM (Normal)" },
            { color: "bg-yellow-400", label: "60–70 BPM (Low Warning)" },
            { color: "bg-red-400", label: "80–90 BPM (High Warning)" },
            { color: "bg-red-600", label: "<60 or >90 BPM (Critical)" },
          ]
          : [
            { color: "bg-green-500", label: "20–80 (Normal)" },
            { color: "bg-yellow-400", label: "<20 (Low)" },
            { color: "bg-red-500", label: ">80 (High)" },
          ];

    return (
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Icon className="h-5 w-5 text-primary" />
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-2">
                <select
                    value={currentGaugeTimeRange}
                    onChange={(e) => setGaugeTimeRange(e.target.value as TimeRange)}
                    className="text-xs text-muted-foreground border rounded-md p-1 bg-background"
                >
                    <option value="6h">6 Hours</option>
                    <option value="12h">12 Hours</option>
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                </select>
            </div>
            <div className="text-sm font-medium text-muted-foreground mb-1">
                {getTimeRangeLabel(currentGaugeTimeRange)}
            </div>
            
            <div className="text-2xl font-bold">
              {value.toFixed(1)}{unit}
            </div>

            <div className="mt-4 w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{min}</span>
              <span>{max}</span>
            </div>

            <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
              {legendItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-sm ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };


  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Loading node data...</p>
      </div>
    );
  }

  if (data === null || !nodeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cow Not Found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Back to Herd Overview
          </Button>
        </div>
      </div>
    );
  }

  const combinedChartData = data.temperatureHistory.map((temp: any, index: number) => {
    const timeFormat: Intl.DateTimeFormatOptions = chartTimeRange.endsWith('d')
      ? { month: 'short', day: 'numeric' }
      : { hour: '2-digit', minute: '2-digit', hour12: false };

    return ({
      time: new Date(temp.timestamp).toLocaleString('en-US', timeFormat),
      temperature: temp.value,
      heartRate: data.heartRateHistory[index]?.value || 0,
    });
  });


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-[var(--shadow-card)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Herd Overview
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Details for {data.nodeId}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={data.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <GaugeCard
              title="Temperature"
              value={data.avgTemp}
              unit="°C"
              icon={Thermometer}
              min={20}
              max={45}
              type="temperature"
              setGaugeTimeRange={setGaugeTimeRange} 
              currentGaugeTimeRange={gaugeTimeRange}
            />

            <GaugeCard
              title="Heart Rate"
              value={data.avgBpm}
              unit=" BPM"
              icon={Heart}
              min={50}
              max={120}
              type="bpm"
              setGaugeTimeRange={setGaugeTimeRange} 
              currentGaugeTimeRange={gaugeTimeRange}
            />

            <GaugeCard
              title="Activity Level"
              value={data.avgActivity}
              unit=""
              icon={Activity}
              min={0}
              max={100}
              type="activity"
              setGaugeTimeRange={setGaugeTimeRange} 
              currentGaugeTimeRange={gaugeTimeRange}
            />
          </div>

          <div className="lg:col-span-1">
            {latestRawRecord ? (
                <SensorDataCard
                    accel={latestRawRecord.accel}
                    gyro={latestRawRecord.gyro}
                    rssi={latestRawRecord.rssi}
                    timestamp={latestRawRecord.timestamp}
                />
            ) : (
                <Card className="p-6">No sensor data available.</Card>
            )}
          </div>
        </div>

        <Card className="shadow-[var(--shadow-card)] mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Vital Signs Trends ({chartTimeRange} Trend)</CardTitle>
              <div className="flex gap-2">
                {(['6h', '12h', '24h', '7d', '30d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={chartTimeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartTimeRange(range)}
                  >
                    {range.replace('d', ' Days').replace('h', ' Hours')}
                  </Button>
                ))}
              </div>

            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    interval={chartTimeRange === '7d' ? 24 : chartTimeRange === '30d' ? 72 : 'preserveStartEnd'}
                  />
                  <YAxis
                    yAxisId="temp"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                    domain={[20, 50]}
                  />
                  <YAxis
                    yAxisId="bpm"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Heart Rate (BPM)', angle: 90, position: 'insideRight', fill: 'hsl(var(--foreground))' }}
                    domain={[50, 100]}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="hsl(330, 90%, 65%)"
                    strokeWidth={3}
                    name="Temperature (°C)"
                    dot={false}
                  />
                  <Line
                    yAxisId="bpm"
                    type="monotone"
                    dataKey="heartRate"
                    stroke="hsla(204, 91%, 52%, 1.00)"
                    strokeWidth={3}
                    name="Heart Rate (BPM)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-card)] mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Hourly Activity Levels ({chartTimeRange} Context)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="activity"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <DetailRecordsTable nodeId={data.nodeId} />
      </main>
    </div>
  );
};

export default CowDetail;