import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieData {
  name: string;
  value: number;
}

interface ChannelPieChartProps {
  data: PieData[];
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e42", "#ef4444", "#a855f7", "#fbbf24"];

const ChannelPieChart: React.FC<ChannelPieChartProps> = ({ data }) => (
  <div className="w-full max-w-full h-80 mb-8 overflow-x-auto">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default ChannelPieChart;
