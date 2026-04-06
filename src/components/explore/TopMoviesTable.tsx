"use client";

import { Star, Trophy } from "lucide-react";

interface TopMoviesTableProps {
  movies: Array<{
    title: string;
    year: number;
    rating: number;
    genre: string[];
    director: string;
  }>;
  onMovieClick?: (movie: { title: string }) => void;
}

export default function TopMoviesTable({
  movies,
  onMovieClick,
}: TopMoviesTableProps) {
  return (
    <div className="rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] overflow-hidden">
      <div className="p-4 border-b border-[#2a2a4a]">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#f59e0b]" />
          Top 10 Rated Movies
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-[#2a2a4a]">
              <th className="text-left p-3 font-medium">#</th>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">
                Year
              </th>
              <th className="text-left p-3 font-medium hidden md:table-cell">
                Director
              </th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">
                Genre
              </th>
              <th className="text-right p-3 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie, index) => (
              <tr
                key={`${movie.title}-${index}`}
                className="border-b border-[#2a2a4a]/50 hover:bg-[#16213e]/50 transition-colors cursor-pointer"
                onClick={() => onMovieClick?.(movie)}
              >
                <td className="p-3">
                  <span
                    className={`text-xs font-bold ${
                      index < 3 ? "text-[#f59e0b]" : "text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-sm font-medium text-gray-200">
                    {movie.title}
                  </span>
                </td>
                <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">
                  {movie.year}
                </td>
                <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">
                  {movie.director}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 2).map((g) => (
                      <span
                        key={g}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#16213e] text-muted-foreground border border-[#2a2a4a]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                    <span className="text-sm font-bold text-[#f59e0b]">
                      {movie.rating}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
