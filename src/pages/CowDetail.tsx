import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Thermometer, Heart, Activity } from "lucide-react";
import { getCowById } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState } from "react";

const CowDetail = () => {
  const { cowId } = useParams<{ cowId: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'6h' | '12h' | '24h'>('24h');
  
  const cow = cowId ? getCowById(cowId) : null;

  if (!cow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Cow Not Found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Herd Overview
          </Button>
        </div>
      </div>
    );
  }

  const getTimeRangeData = () => {
    const hours = timeRange === '6h' ? 6 : timeRange === '12h' ? 12 : 24;
    return {
      temperature: cow.temperatureHistory.slice(-hours),
      heartRate: cow.heartRateHistory.slice(-hours),
      spO2: cow.spO2History.slice(-hours),
    };
  };

  const { temperature, heartRate, spO2 } = getTimeRangeData();

  // Combine all vital signs for multi-line chart
  const combinedData = temperature.map((temp, index) => ({
    time: new Date(temp.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    temperature: temp.value,
    heartRate: heartRate[index]?.value || 0,
    spO2: spO2[index]?.value || 0,
  }));

  const GaugeCard = ({ 
    title, 
    value, 
    unit, 
    icon: Icon, 
    min, 
    max, 
    normal 
  }: { 
    title: string; 
    value: number; 
    unit: string; 
    icon: any; 
    min: number; 
    max: number; 
    normal: [number, number] 
  }) => {
    const percentage = ((value - min) / (max - min)) * 100;
    const isNormal = value >= normal[0] && value <= normal[1];
    const isHigh = value > normal[1];
    
    return (
      <Card className="shadow-[var(--shadow-card)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Icon className="h-5 w-5 text-primary" />
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isNormal ? 'text-status-normal' : 
              isHigh ? 'text-status-critical' : 
              'text-status-warning'
            }`}>
              {value.toFixed(1)}{unit}
            </div>
            
            {/* Simple gauge visualization */}
            <div className="mt-4 w-full h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  isNormal ? 'bg-status-normal' : 
                  isHigh ? 'bg-status-critical' : 
                  'bg-status-warning'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                <h1 className="text-2xl font-bold text-foreground">Details for {cow.nodeId}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={cow.status} />
                  <span className="text-muted-foreground">Last seen: {cow.lastSeen}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Real-Time Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GaugeCard
            title="Temperature"
            value={cow.temperature}
            unit="°C"
            icon={Thermometer}
            min={36}
            max={42}
            normal={[37, 39]}
          />
          <GaugeCard
            title="Heart Rate"
            value={cow.heartRate}
            unit=" BPM"
            icon={Heart}
            min={50}
            max={120}
            normal={[60, 85]}
          />
          <GaugeCard
            title="SpO₂"
            value={cow.spO2}
            unit="%"
            icon={Activity}
            min={85}
            max={100}
            normal={[95, 100]}
          />
        </div>

        {/* Vital Signs Chart */}
        <Card className="shadow-[var(--shadow-card)] mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">Vital Signs Trends</CardTitle>
              <div className="flex gap-2">
                {(['6h', '12h', '24h'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="temp"
                    orientation="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="vitals"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Line 
                    yAxisId="temp"
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="hsl(var(--status-critical))" 
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                  <Line 
                    yAxisId="vitals"
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Heart Rate (BPM)"
                  />
                  <Line 
                    yAxisId="vitals"
                    type="monotone" 
                    dataKey="spO2" 
                    stroke="hsl(var(--status-normal))" 
                    strokeWidth={2}
                    name="SpO₂ (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Hourly Activity Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cow.activityHistory}>
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
      </main>
    </div>
  );
};

export default CowDetail;