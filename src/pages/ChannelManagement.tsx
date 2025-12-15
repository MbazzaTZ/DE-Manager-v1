
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { TrendingUp } from "lucide-react";
import { useAgents, useSales } from "@/hooks/useDatabase";

import ChannelSummaryCard from "@/components/ChannelSummaryCard";
import ChannelPieChart from "@/components/ChannelPieChart";

const channelMetrics = [
  "Opening ESP Count",
  "New ESP Count",
  "Existing ESP Count",
  "Churned ESP Count",
  "Closing ESP Count",
  "Sales (New ESP)",
  "Sales (Existing ESP)",
  "Sales (Total ESP)",
  "Prod/ESP (New ESP)",
  "Prod/ESP (Existing ESP)",
  "Prod/ESP (Total ESP)",
];

const ChannelManagement = () => {
    // Last month metrics for trend analysis (user input)
    const [lastMonth, setLastMonth] = useState<{ [key: string]: number | "" }>({});
  // System data for this month
  const { data: agents = [] } = useAgents();
  const { data: sales = [] } = useSales();

  // Channel Performance logic for current month only
  const now = new Date();
  const isThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  // Opening ESP Count: agents who sold this month
  const openingESP = agents.filter(a => sales.some(s => s.agent_id === a.id && isThisMonth(s.sale_date))).length;
  // New ESP Count: 0 (no last month data)
  const newESP = 0;
  // Existing ESP Count: 0 (no last month data)
  const existingESP = 0;
  // Churned ESP Count: 0 (no last month data)
  const churnedESP = 0;
  // Closing ESP Count: 0 (no last month data)
  const closingESP = 0;
  // Sales (New ESP): all sales this month
  const salesNewESP = sales.filter(s => isThisMonth(s.sale_date)).length;
  // Sales (Existing ESP): 0 (no last month data)
  const salesExistingESP = 0;
  // Sales (Total ESP): all sales this month
  const salesTotalESP = salesNewESP;
  // Prod/ESP (New ESP): 0 (no last month data)
  const prodNewESP = 0;
  // Prod/ESP (Existing ESP): 0 (no last month data)
  const prodExistingESP = 0;
  // Prod/ESP (Total ESP): 0 (no last month data)
  const prodTotalESP = 0;

  const thisMonth: { [key: string]: number } = {
    "Opening ESP Count": openingESP,
    "New ESP Count": newESP,
    "Existing ESP Count": existingESP,
    "Churned ESP Count": churnedESP,
    "Closing ESP Count": closingESP,
    "Sales (New ESP)": salesNewESP,
    "Sales (Existing ESP)": salesExistingESP,
    "Sales (Total ESP)": salesTotalESP,
    "Prod/ESP (New ESP)": prodNewESP,
    "Prod/ESP (Existing ESP)": prodExistingESP,
    "Prod/ESP (Total ESP)": prodTotalESP,
  };

  const handleLastMonthChange = (label: string, value: string) => {
    setLastMonth((prev) => ({ ...prev, [label]: value === "" ? "" : Number(value) }));
  };

  // Prepare pie chart data (show only relevant metrics)
  const pieData = [
    { name: "Opening ESP", value: openingESP },
    { name: "Sales (New ESP)", value: salesNewESP },
    { name: "Sales (Total ESP)", value: salesTotalESP },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Channel Management</h1>
          <p className="text-muted-foreground">Channel dashboard: auto-updated metrics, with last month input for trend analysis</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total ESP vs Active */}
          <Card className="p-4 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Total ESP</div>
            <div className="text-2xl font-bold text-foreground">{thisMonth["Existing ESP Count"] ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Active: {agents.filter(a => a.status === "active").length}</div>
            <div className="text-xs text-muted-foreground mt-1">Trend: {/* Example trend, replace with real logic if needed */}0%</div>
          </Card>
          {/* Total Sales with breakdown */}
          <Card className="p-4 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Total Sales</div>
            <div className="text-2xl font-bold text-foreground">{thisMonth["Sales (Total ESP)"] ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">New ESP: {thisMonth["Sales (New ESP)"] ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Existing ESP: {thisMonth["Sales (Existing ESP)"] ?? 0}</div>
          </Card>
          {/* Churned vs Total ESP */}
          <Card className="p-4 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Churned ESP</div>
            <div className="text-2xl font-bold text-foreground">{thisMonth["Churned ESP Count"] ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-1">of Total: {thisMonth["Existing ESP Count"] ?? 0}</div>
          </Card>
          {/* Productivity trend */}
          <Card className="p-4 flex flex-col gap-1">
            <div className="text-xs text-muted-foreground">Productivity Trend</div>
            <div className="text-2xl font-bold text-foreground">
              {/* Example: sales per ESP */}
              {thisMonth["Existing ESP Count"] ? ((thisMonth["Sales (Total ESP)"] ?? 0) / thisMonth["Existing ESP Count"]).toFixed(2) : 0}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">(Sales / ESP)</div>
          </Card>
        </div>
        <ChannelPieChart data={pieData} />
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="gradient-info rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-info-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Channel Performance</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4 bg-muted font-bold">TYPE</th>
                  <th className="text-left py-2 px-4 bg-muted font-bold">This Month</th>
                </tr>
              </thead>
              <tbody>
                {channelMetrics.map((label) => (
                  <tr key={label} className="border-b border-border last:border-0">
                    <td className="py-2 px-4 font-medium text-foreground">{label}</td>
                    <td className="py-2 px-4">
                      {thisMonth[label] ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default ChannelManagement;
