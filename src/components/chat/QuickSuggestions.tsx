"use client";

import { Sparkles } from "lucide-react";

interface QuickSuggestionsProps {
  onSelect: (query: string) => void;
}

const suggestions = [
  "Sci-fi movies",
  "Top rated dramas",
  "Christopher Nolan films",
  "Feel-good movies",
  "90s classics",
  "Latest action movies",
  "Movies with DiCaprio",
  "Horror recommendations",
];

export default function QuickSuggestions({ onSelect }: QuickSuggestionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-full bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#e94560]/50 hover:bg-[#e94560]/10 text-xs text-gray-300 hover:text-white transition-all"
        >
          <Sparkles className="w-3 h-3 text-[#e94560]" />
          {suggestion}
        </button>
      ))}
    </div>
  );
}
