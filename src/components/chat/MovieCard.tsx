"use client";

import { Star } from "lucide-react";

interface MovieCardProps {
  title: string;
  year: number;
  rating: number;
  genre: string[];
  director: string;
  cast: string[];
  duration?: number;
  poster?: string;
  compact?: boolean;
  onClick?: () => void;
}

const genreColors: Record<string, string> = {
  Action: "bg-red-500/20 text-red-400 border-red-500/30",
  Comedy: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Drama: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Sci-Fi": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Horror: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Thriller: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Romance: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Adventure: "bg-green-500/20 text-green-400 border-green-500/30",
  Animation: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Fantasy: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Mystery: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  War: "bg-stone-500/20 text-stone-400 border-stone-500/30",
  Crime: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Musical: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Documentary: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  Biography: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  Western: "bg-amber-600/20 text-amber-500 border-amber-600/30",
  Sport: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  "Film-Noir": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function MovieCard({
  title,
  year,
  rating,
  genre,
  director,
  cast,
  duration,
  poster,
  compact = false,
  onClick,
}: MovieCardProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg bg-[#16213e]/50 border border-[#2a2a4a] hover:border-[#e94560]/50 transition-all cursor-pointer hover:bg-[#1a1a2e]"
        onClick={onClick}
      >
        <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-[#1a1a2e]">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              🎬
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{title}</p>
          <p className="text-xs text-muted-foreground">
            {year} • {director}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
          <span className="text-sm font-medium text-[#f59e0b]">{rating}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="movie-card-hover rounded-xl overflow-hidden bg-[#1a1a2e] border border-[#2a2a4a] cursor-pointer group"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#16213e]">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🎬
          </div>
        )}
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
          <span className="text-sm font-bold text-[#f59e0b]">{rating}</span>
        </div>
        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <span className="text-xs text-gray-300">{duration} min</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-1">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mb-2">
          {year} • {director}
        </p>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {genre.slice(0, 3).map((g) => (
            <span
              key={g}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                genreColors[g] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {g}
            </span>
          ))}
        </div>

        {/* Cast */}
        <p className="text-[11px] text-muted-foreground truncate">
          {cast.slice(0, 3).join(", ")}
        </p>
      </div>
    </div>
  );
}
