"use client";

import { Film, Star, TrendingUp, Calendar } from "lucide-react";

interface StatsCardsProps {
  totalMovies: number;
  avgRating: number;
  topGenre: string;
  moviesThisDecade: number;
}

export default function StatsCards({
  totalMovies,
  avgRating,
  topGenre,
  moviesThisDecade,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total Movies",
      value: totalMovies,
      icon: Film,
      color: "#e94560",
      bgColor: "rgba(233, 69, 96, 0.1)",
    },
    {
      label: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Top Genre",
      value: topGenre,
      icon: TrendingUp,
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "This Decade",
      value: moviesThisDecade,
      icon: Calendar,
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.1)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] p-4 hover:border-opacity-50 transition-all"
          style={{ borderLeftColor: stat.color, borderLeftWidth: "3px" }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground">
              {stat.label}
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: stat.bgColor }}
            >
              <stat.icon
                className="w-4 h-4"
                style={{ color: stat.color }}
              />
            </div>
          </div>
          <p
            className="text-2xl font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
