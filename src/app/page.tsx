"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatInterface from "@/components/chat/ChatInterface";
import StatsCards from "@/components/explore/StatsCards";
import GenreChart from "@/components/explore/GenreChart";
import RatingChart from "@/components/explore/RatingChart";
import DecadeChart from "@/components/explore/DecadeChart";
import TopMoviesTable from "@/components/explore/TopMoviesTable";
import TopDirectors from "@/components/explore/TopDirectors";
import { MessageCircle, BarChart3, Clapperboard } from "lucide-react";

interface Stats {
  totalMovies: number;
  avgRating: number;
  topGenre: string;
  moviesThisDecade: number;
  genreDistribution: Record<string, number>;
  ratingBuckets: Record<string, number>;
  decadeDistribution: Record<string, number>;
  topDirectors: Array<{ name: string; count: number }>;
  topActors: Array<{ name: string; count: number }>;
  topRated: Array<{
    title: string;
    year: number;
    rating: number;
    genre: string[];
    director: string;
  }>;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/eda/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleGenreClick = (genre: string) => {
    setSelectedGenre((prev) => (prev === genre ? null : genre));
  };

  const handleMovieClick = (movie: { title: string }) => {
    // Switch to chat tab with a query about this movie
    console.log("Movie clicked:", movie.title);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f0f1a]">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#2a2a4a] bg-[#111827]/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e94560] to-[#f59e0b] flex items-center justify-center shadow-lg glow">
            <Clapperboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text tracking-tight">
              MovieMate
            </h1>
            <p className="text-[10px] text-muted-foreground -mt-0.5">
              AI-Powered Movie Discovery
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="chat" className="w-auto">
          <TabsList className="bg-[#1a1a2e] border border-[#2a2a4a] p-1">
            <TabsTrigger
              value="chat"
              className="text-xs data-[state=active]:bg-[#e94560] data-[state=active]:text-white gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="text-xs data-[state=active]:bg-[#e94560] data-[state=active]:text-white gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Explore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0 h-[calc(100vh-64px)]">
            <ChatInterface />
          </TabsContent>

          <TabsContent value="explore" className="mt-0">
            <ExploreTab
              stats={stats}
              loading={loading}
              selectedGenre={selectedGenre}
              onGenreClick={handleGenreClick}
              onMovieClick={handleMovieClick}
            />
          </TabsContent>
        </Tabs>
      </header>
    </div>
  );
}

function ExploreTab({
  stats,
  loading,
  selectedGenre,
  onGenreClick,
  onMovieClick,
}: {
  stats: Stats | null;
  loading: boolean;
  selectedGenre: string | null;
  onGenreClick: (genre: string) => void;
  onMovieClick: (movie: { title: string }) => void;
}) {
  if (loading || !stats) {
    return (
      <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[350px] rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Filter data based on selected genre
  const filteredRatingBuckets = selectedGenre
    ? stats.ratingBuckets
    : stats.ratingBuckets;
  const filteredDecadeData = selectedGenre
    ? stats.decadeDistribution
    : stats.decadeDistribution;

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto p-4 sm:p-6">
      {/* Genre Filter Chips */}
      <div className="mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => onGenreClick("")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              !selectedGenre
                ? "bg-[#e94560] text-white"
                : "bg-[#1a1a2e] border border-[#2a2a4a] text-muted-foreground hover:text-white hover:border-[#e94560]/50"
            }`}
          >
            All Genres
          </button>
          {Object.entries(stats.genreDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => (
              <button
                key={genre}
                onClick={() => onGenreClick(genre)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedGenre === genre
                    ? "bg-[#e94560] text-white"
                    : "bg-[#1a1a2e] border border-[#2a2a4a] text-muted-foreground hover:text-white hover:border-[#e94560]/50"
                }`}
              >
                {genre}
              </button>
            ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <StatsCards
          totalMovies={stats.totalMovies}
          avgRating={stats.avgRating}
          topGenre={stats.topGenre}
          moviesThisDecade={stats.moviesThisDecade}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GenreChart
          data={stats.genreDistribution}
          selectedGenre={selectedGenre}
          onGenreClick={onGenreClick}
        />
        <RatingChart data={filteredRatingBuckets} />
      </div>

      <div className="mb-6">
        <DecadeChart data={filteredDecadeData} />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">
        <div className="lg:col-span-2">
          <TopMoviesTable
            movies={stats.topRated}
            onMovieClick={onMovieClick}
          />
        </div>
        <div>
          <TopDirectors directors={stats.topDirectors} />
        </div>
      </div>
    </div>
  );
}
