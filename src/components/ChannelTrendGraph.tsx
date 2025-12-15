
import React from "react";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";


interface ChannelTrendGraphProps {
  metrics: { label: string; thisMonth: number }[];
}

const ChannelTrendGraph: React.FC<ChannelTrendGraphProps> = ({ metrics }) => {
  // Only show Total ESP, Sales Total, Churned ESP
  const keys = [
    { label: "Total ESP", match: ["Opening ESP Count", "Existing ESP Count", "Closing ESP Count"] },
    { label: "Sales Total", match: ["Sales (Total ESP)"] },
    { label: "Churned ESP", match: ["Churned ESP Count"] },
  ];

  const data = keys.map((k) => {
    const metric = metrics.find(m => k.match.includes(m.label));
    return {
      name: k.label,
      value: metric ? metric.thisMonth : 0,
    };
  });

  return (
    <div className="w-full max-w-full h-80 mb-8 overflow-x-auto">
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={14} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default ChannelTrendGraph;
