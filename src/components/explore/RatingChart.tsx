"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface RatingChartProps {
  data: Record<string, number>;
}

const chartConfig = {
  count: {
    label: "Movies",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

export default function RatingChart({ data }: RatingChartProps) {
  const chartData = Object.entries(data)
    .filter(([, count]) => count > 0)
    .map(([range, count]) => ({
      range,
      count,
    }));

  return (
    <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] p-4">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
        Rating Distribution
      </h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis
            dataKey="range"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a4a" }}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a4a" }}
          />
          <Tooltip
            content={
              <ChartTooltipContent
                labelKey="range"
                nameKey="count"
                formatter={(value, _name, _item, _index) => (
                  <span className="text-white font-medium">{value} movies</span>
                )}
              />
            }
            cursor={{ fill: "rgba(245, 158, 11, 0.05)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => {
              const midValue = parseFloat(entry.range.split("-")[0]);
              let color = "#ef4444";
              if (midValue >= 8) color = "#10b981";
              else if (midValue >= 7) color = "#f59e0b";
              else if (midValue >= 6) color = "#6366f1";
              else if (midValue >= 5) color = "#06b6d4";
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
