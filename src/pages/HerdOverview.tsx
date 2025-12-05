// src/pages/HerdOverview.tsx

import { useState, useEffect } from "react";
import { SummaryCards } from "@/components/SummaryCards";
import { getOverviewCardsData, getHerdSummary, NodeSummaryCard } from "@/data/data";
import { HerdSummary } from "@/types/cattle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Thermometer, Heart, Activity, Signal, ExternalLink } from "lucide-react";

// --- New Component: Node Card ---
interface NodeCardProps {
  summary: NodeSummaryCard;
}

const NodeCard = ({ summary }: NodeCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    // Navigates to /cow/Node 0000X
    navigate(`/cow/${summary.nodeId}`);
  };

  const StatusBadge = ({ status }: { status: 'Normal' | 'Warning' | 'Critical' }) => {
    const variants = {
      Normal: "bg-status-normal text-white border-status-normal",
      Warning: "bg-status-warning text-foreground border-status-warning",
      Critical: "bg-status-critical text-white border-status-critical"
    };
    return (
      <Badge
        className={variants[status]}
        variant="outline"
      >
        {status}
      </Badge>
    );
  };

  return (
    <Card
      className="cursor-pointer shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-[var(--transition-smooth)]"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{summary.nodeId}</CardTitle>
        <StatusBadge status={summary.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground mb-2">7-Day Averages</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <Thermometer className="h-4 w-4 mr-2 text-primary" />
            Temperature
          </div>
          <span className="font-mono font-bold text-base">{summary.avgTemp}°C</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <Heart className="h-4 w-4 mr-2 text-primary" />
            Heart Rate
          </div>
          <span className="font-mono font-bold text-base">{summary.avgBpm} BPM</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <Activity className="h-4 w-4 mr-2 text-primary" />
            Activity Level
          </div>
          <span className="font-mono font-bold text-base">{summary.avgActivity}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm font-medium">
            <Signal className="h-4 w-4 mr-2 text-primary" />
            RSSI
          </div>
          <span className="font-mono font-bold text-base">{summary.avgRssi} dBm</span>
        </div>
      </CardContent>
    </Card>
  );
};
// --- End New Component ---


const HerdOverview = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nodeSummaries, setNodeSummaries] = useState<NodeSummaryCard[]>([]);
  const [herdSummary, setHerdSummary] = useState<HerdSummary | null>(null);

  useEffect(() => {
    // Set up a timer to continuously fetch the latest data
    const dataTimer = setInterval(() => {
      const liveNodeData = getOverviewCardsData();
      const liveHerdSummary = getHerdSummary();

      // Update the state with the new data, which will cause the component to re-render
      setNodeSummaries(liveNodeData);
      setHerdSummary(liveHerdSummary);
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
  if (!herdSummary || nodeSummaries.length === 0) {
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
            <div className="flex items-center space-x-4">
              <img
                src="https://res.cloudinary.com/dfumqck7l/image/upload/v1755595424/insta_logo_yhcocq.png"
                alt="Instagram Logo"
                className="w-20"
              />
              <div>
                <h1 className="text-3xl font-bold text-foreground">Cattle Health Overview</h1>
                <p className="text-muted-foreground mt-1">Real-time monitoring dashboard</p>
              </div>
            </div>
            <div
              className="text-right"
              onClick={() => window.open("https://cms.instagrp.in", "_blank")}
            >
              <p
                className="text-lg font-semibold text-foreground font-mono flex items-center justify-end 
             bg-purple-200 px-4 py-2 rounded-full cursor-pointer 
             hover:bg-purple-300 transition-all inline-flex"
              >
                <ExternalLink className="mr-2 h-4 w-4 text-purple-700" />
                Network Monitor
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-right">
          <p className="text-lg font-semibold text-foreground font-mono">
            {currentTime.toLocaleString()}
          </p>
        </div>
        <br />
        {/* Overall Herd Summary Cards (Existing Component) */}
        <SummaryCards summary={herdSummary} />

        {/* Node Overview Cards - Replaces old table/chart */}
        <h2 className="text-2xl font-bold text-foreground mb-4">Individual Node Status (7-Day Average)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {nodeSummaries.map((summary) => (
            <NodeCard key={summary.nodeId} summary={summary} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default HerdOverview;