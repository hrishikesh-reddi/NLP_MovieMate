"use client";

import { Movie, Bot, User } from "lucide-react";
import MovieCard from "./MovieCard";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  movies?: Array<{
    title: string;
    year: number;
    rating: number;
    genre: string[];
    director: string;
    cast: string[];
    duration: number;
    poster?: string;
  }>;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  onMovieClick?: (movie: Message["movies"][number]) => void;
}

export default function MessageBubble({
  message,
  onMovieClick,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-enter flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-[#e94560]"
            : "bg-gradient-to-br from-[#e94560] to-[#f59e0b]"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div
        className={`max-w-[75%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-[#e94560] text-white rounded-br-md"
              : "bg-[#1a1a2e] border border-[#2a2a4a] text-gray-200 rounded-bl-md"
          }`}
        >
          {/* Message text - parse markdown-like bold */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={i} className={isUser ? "font-bold" : "font-bold text-white"}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={i}>{part}</span>;
            })}
          </div>
        </div>

        {/* Movie cards */}
        {message.movies && message.movies.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {message.movies.slice(0, 6).map((movie, idx) => (
              <MovieCard
                key={`${movie.title}-${idx}`}
                title={movie.title}
                year={movie.year}
                rating={movie.rating}
                genre={movie.genre}
                director={movie.director}
                cast={movie.cast}
                duration={movie.duration}
                poster={movie.poster}
                compact
                onClick={() => onMovieClick?.(movie)}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-[10px] text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
