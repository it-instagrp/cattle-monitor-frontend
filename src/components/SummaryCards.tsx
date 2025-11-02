import { Card, CardContent } from "@/components/ui/card";
import { Activity, AlertTriangle, Wifi } from "lucide-react";
import { HerdSummary } from "@/types/cattle";

interface SummaryCardsProps {
  summary: HerdSummary;
}

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Cattle</p>
              <p className="text-3xl font-bold text-primary">{summary.totalCattle}</p>
            </div>
            <Activity className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
              <p className="text-3xl font-bold text-status-warning">{summary.activeAlerts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-status-warning" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Network Health</p>
              <p className="text-lg font-semibold text-foreground">{summary.averageRssi} dBm</p>
              <p className={`text-sm font-medium ${
                summary.networkHealth === 'Good' ? 'text-status-normal' :
                summary.networkHealth === 'Fair' ? 'text-status-warning' :
                'text-status-critical'
              }`}>
                {summary.networkHealth}
              </p>
            </div>
            <Wifi className={`h-8 w-8 ${
              summary.networkHealth === 'Good' ? 'text-status-normal' :
              summary.networkHealth === 'Fair' ? 'text-status-warning' :
              'text-status-critical'
            }`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};