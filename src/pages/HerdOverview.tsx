import { useState, useEffect } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { HealthTable } from "@/components/HealthTable";
import { HerdComparisonChart } from "@/components/HerdComparisonChart";
import { mockCattleData, getHerdSummary } from "@/data/mockData";

const HerdOverview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const summary = getHerdSummary();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-[var(--shadow-card)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Cattle Health Overview</h1>
              <p className="text-muted-foreground mt-1">Real-time monitoring dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Time</p>
              <p className="text-lg font-semibold text-foreground font-mono">
                {currentTime.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SummaryCards summary={summary} />
        <HealthTable cattle={mockCattleData} />
        <div className="mt-8">
          <HerdComparisonChart cattle={mockCattleData} />
        </div>
      </main>
    </div>
  );
};

export default HerdOverview;