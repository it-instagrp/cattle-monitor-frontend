import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccelData, GyroData } from "@/types/cattle";

interface SensorDataCardProps {
  accel: AccelData;
  gyro: GyroData;
  rssi: number;
  timestamp: number;
}

export const SensorDataCard = ({ accel, gyro, rssi, timestamp }: SensorDataCardProps) => {
  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  const getRssiStatus = (rssi: number) => {
    if (rssi > -70) return { status: 'Excellent', color: 'bg-status-normal' };
    if (rssi > -80) return { status: 'Good', color: 'bg-status-normal' };
    if (rssi > -90) return { status: 'Fair', color: 'bg-status-warning' };
    return { status: 'Poor', color: 'bg-status-critical' };
  };

  const rssiStatus = getRssiStatus(rssi);

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sensor Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Accelerometer */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Accelerometer (g)</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">X</div>
              <div className="font-mono text-sm">{accel.x.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Y</div>
              <div className="font-mono text-sm">{accel.y.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Z</div>
              <div className="font-mono text-sm">{accel.z.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Gyroscope */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Gyroscope (°/s)</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">X</div>
              <div className="font-mono text-sm">{gyro.x.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Y</div>
              <div className="font-mono text-sm">{gyro.y.toFixed(2)}</div>
            </div>
            <div className="text-center p-2 bg-muted/30 rounded">
              <div className="text-xs text-muted-foreground">Z</div>
              <div className="font-mono text-sm">{gyro.z.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Signal Strength */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Signal Strength</span>
          <div className="flex items-center gap-2">
            <Badge className={`${rssiStatus.color} text-white border-transparent`}>
              {rssiStatus.status}
            </Badge>
            <span className="font-mono text-sm text-muted-foreground">{rssi} dBm</span>
          </div>
        </div>

        {/* Timestamp */}
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">Last Update</div>
          <div className="font-mono text-sm">{formatTimestamp(timestamp)}</div>
        </div>
      </CardContent>
    </Card>
  );
};