"use client";

import { Award } from "lucide-react";

interface TopDirectorsProps {
  directors: Array<{ name: string; count: number }>;
}

export default function TopDirectors({ directors }: TopDirectorsProps) {
  const maxCount = directors.length > 0 ? directors[0].count : 1;

  return (
    <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] p-4">
      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-[#e94560]" />
        Top Directors
      </h3>
      <div className="space-y-3">
        {directors.slice(0, 8).map((director, index) => (
          <div key={director.name} className="flex items-center gap-3">
            <span
              className={`text-xs font-bold w-5 ${
                index < 3 ? "text-[#e94560]" : "text-muted-foreground"
              }`}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300 truncate">
                  {director.name}
                </span>
                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                  {director.count} movies
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#16213e] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(director.count / maxCount) * 100}%`,
                    background:
                      index === 0
                        ? "linear-gradient(90deg, #e94560, #f59e0b)"
                        : index === 1
                        ? "linear-gradient(90deg, #e94560, #ec4899)"
                        : "#e94560",
                    opacity: 1 - index * 0.08,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
