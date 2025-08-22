import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { CattleData } from "@/types/cattle";

interface HerdComparisonChartProps {
  cattle: CattleData[];
}

export const HerdComparisonChart = ({ cattle }: HerdComparisonChartProps) => {
  const chartData = cattle.map((cow) => ({
    cowId: cow.nodeId.replace('Node ', ''),
    temperature: cow.temp,
    status: cow.status,
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'Normal': return 'hsl(var(--status-normal))';
      case 'Warning': return 'hsl(var(--status-warning))';
      case 'Critical': return 'hsl(var(--status-critical))';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <Card className="shadow-[var(--shadow-card)] mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Herd Temperature Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                domain={[20, 45]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="cowId"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                width={60}
              />
              <Bar 
                dataKey="temperature" 
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};