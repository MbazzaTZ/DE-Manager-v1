import React from "react";
import { Card } from "@/components/ui/card";

interface ChannelSummaryCardProps {
  metrics: { label: string; lastMonth: number | ""; thisMonth: number }[];
}

const ChannelSummaryCard: React.FC<ChannelSummaryCardProps> = ({ metrics }) => {
  const totalThisMonth = metrics.reduce((sum, m) => sum + (typeof m.thisMonth === "number" ? m.thisMonth : 0), 0);
  const totalLastMonth = metrics.reduce((sum, m) => sum + (typeof m.lastMonth === "number" ? m.lastMonth : 0), 0);
  const trend = totalLastMonth === 0 ? 0 : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  return (
    <Card className="mb-6 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Channel Performance Summary</h3>
          <p className="text-muted-foreground text-sm">Total (This Month): <span className="font-bold">{totalThisMonth}</span></p>
        </div>
        <div className="text-right">
          <span className={`font-bold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>{trend > 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          <div className="text-xs text-muted-foreground">vs last month</div>
        </div>
      </div>
    </Card>
  );
};

export default ChannelSummaryCard;
