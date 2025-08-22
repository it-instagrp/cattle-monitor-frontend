import { useState, useEffect } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { HealthTable } from "@/components/HealthTable";
import { HerdComparisonChart } from "@/components/HerdComparisonChart";
import { getAllCattleData, getHerdSummary } from "@/data/data";
import { CattleData, HerdSummary } from "@/types/cattle";

const HerdOverview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cattleData, setCattleData] = useState<CattleData[]>([]);
  const [herdSummary, setHerdSummary] = useState<HerdSummary | null>(null);

  useEffect(() => {
    // Set up a timer to continuously fetch the latest data
    const dataTimer = setInterval(() => {
      const liveData = getAllCattleData();
      const liveSummary = getHerdSummary();

      // Update the state with the new data, which will cause the component to re-render
      setCattleData(liveData);
      setHerdSummary(liveSummary);
    }, 1000); // Check for new data every second

    // Timer for the clock
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up timers when the component is unmounted
    return () => {
      clearInterval(dataTimer);
      clearInterval(clockTimer);
    };
  }, []);

  // Display a loading message until the first data is fetched
  if (!herdSummary || cattleData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Connecting to live herd data...</p>
      </div>
    );
  }

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
        <SummaryCards summary={herdSummary} />
        <HealthTable cattle={cattleData} />
        <div className="mt-8">
          <HerdComparisonChart cattle={cattleData} />
        </div>
      </main>
    </div>
  );
};

export default HerdOverview;