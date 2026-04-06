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

interface DecadeChartProps {
  data: Record<string, number>;
}

const COLORS = [
  "#e94560",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
  "#06b6d4",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
  "#ef4444",
  "#84cc16",
  "#a855f7",
];

const chartConfig = {
  count: {
    label: "Movies",
    color: "#6366f1",
  },
} satisfies ChartConfig;

export default function DecadeChart({ data }: DecadeChartProps) {
  const chartData = Object.entries(data)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([decade, count]) => ({
      decade,
      count,
    }));

  return (
    <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] p-4">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
        Movies by Decade
      </h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis
            dataKey="decade"
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
                labelKey="decade"
                nameKey="count"
                formatter={(value, _name, _item, _index) => (
                  <span className="text-white font-medium">{value} movies</span>
                )}
              />
            }
            cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
