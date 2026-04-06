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

interface GenreChartProps {
  data: Record<string, number>;
  selectedGenre?: string | null;
  onGenreClick?: (genre: string) => void;
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
  "#0ea5e9",
  "#d946ef",
  "#22d3ee",
  "#fb923c",
];

const chartConfig = {
  count: {
    label: "Movies",
    color: "#e94560",
  },
} satisfies ChartConfig;

export default function GenreChart({
  data,
  selectedGenre,
  onGenreClick,
}: GenreChartProps) {
  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
    }));

  return (
    <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] p-4">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#e94560]" />
        Genre Distribution
      </h3>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a4a" }}
          />
          <Tooltip
            content={
              <ChartTooltipContent
                labelKey="name"
                nameKey="count"
                formatter={(value, _name, _item, _index, payload) => (
                  <span className="text-white font-medium">{value} movies</span>
                )}
              />
            }
            cursor={{ fill: "rgba(233, 69, 96, 0.05)" }}
          />
          <Bar
            dataKey="count"
            radius={[4, 4, 0, 0]}
            onClick={(data) => onGenreClick?.(data.name)}
            style={{ cursor: "pointer" }}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  selectedGenre === entry.name
                    ? "#e94560"
                    : COLORS[index % COLORS.length]
                }
                fillOpacity={selectedGenre && selectedGenre !== entry.name ? 0.3 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
