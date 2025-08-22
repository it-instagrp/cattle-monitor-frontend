import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { CattleData } from "@/types/cattle";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface HealthTableProps {
  cattle: CattleData[];
}

export const HealthTable = ({ cattle }: HealthTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = (cowId: string) => {
    navigate(`/cow/${cowId}`);
  };

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Cattle Health Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Cow ID</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Temperature (°C)</TableHead>
                <TableHead className="font-semibold">Heart Rate (BPM)</TableHead>
                <TableHead className="font-semibold">Activity Level</TableHead>
                <TableHead className="font-semibold">Signal (RSSI)</TableHead>
                <TableHead className="font-semibold">Last Seen</TableHead>
                <TableHead className="font-semibold">24h Temp Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cattle.map((cow) => (
                <TableRow 
                  key={cow.id}
                  className="cursor-pointer hover:bg-muted/50 transition-[var(--transition-smooth)]"
                  onClick={() => handleRowClick(cow.id)}
                >
                  <TableCell className="font-medium">{cow.nodeId}</TableCell>
                  <TableCell>
                    <StatusBadge status={cow.status} />
                  </TableCell>
                  <TableCell className="font-mono">{cow.temp.toFixed(1)}</TableCell>
                  <TableCell className="font-mono">{cow.bpm.toFixed(0)}</TableCell>
                  <TableCell className="font-mono">{cow.activity}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{cow.rssi} dBm</TableCell>
                  <TableCell className="text-muted-foreground">{cow.lastSeen}</TableCell>
                  <TableCell>
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cow.temperatureHistory.slice(-12)}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};