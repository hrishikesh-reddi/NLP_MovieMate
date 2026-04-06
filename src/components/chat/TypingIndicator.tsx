"use client";

export default function TypingIndicator() {
  return (
    <div className="message-enter flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#e94560] to-[#f59e0b]">
        <svg
          className="w-4 h-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 8V4H8" />
          <rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
          <path d="M15 13v2" />
          <path d="M9 13v2" />
        </svg>
      </div>
      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-[#1a1a2e] border border-[#2a2a4a]">
        <div className="flex gap-1.5">
          <div className="typing-dot w-2.5 h-2.5 rounded-full bg-[#e94560]" />
          <div className="typing-dot w-2.5 h-2.5 rounded-full bg-[#e94560]" />
          <div className="typing-dot w-2.5 h-2.5 rounded-full bg-[#e94560]" />
        </div>
      </div>
    </div>
  );
}
