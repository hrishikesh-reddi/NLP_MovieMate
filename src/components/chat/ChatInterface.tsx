"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Sparkles,
  Film,
  Popcorn,
  Clapperboard,
  Search,
} from "lucide-react";
import MessageBubble, { type Message } from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import QuickSuggestions from "./QuickSuggestions";

interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatInterfaceProps {
  onMovieClick?: (movie: Message["movies"][number]) => void;
}

const genreTags = [
  "Action",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Horror",
  "Thriller",
  "Romance",
  "Animation",
  "Adventure",
  "Fantasy",
  "Crime",
  "War",
  "Musical",
  "Documentary",
  "Mystery",
  "Biography",
];

export default function ChatInterface({ onMovieClick }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const createNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
  };

  const switchToChat = (chatId: string) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setActiveChatId(chatId);
      setMessages(chat.messages);
      setSidebarOpen(false);
    }
  };

  const saveCurrentChat = (newMessages: Message[], title: string) => {
    if (activeChatId) {
      setChatHistory((prev) =>
        prev.map((c) =>
          c.id === activeChatId ? { ...c, messages: newMessages, title } : c
        )
      );
    } else {
      const newChat: ChatHistory = {
        id: generateId(),
        title,
        messages: newMessages,
        createdAt: new Date(),
      };
      setChatHistory((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.message || "I'm sorry, I couldn't understand that. Could you try rephrasing?",
        movies: data.movies || [],
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Save to history
      const title =
        text.trim().length > 40
          ? text.trim().substring(0, 40) + "..."
          : text.trim();
      saveCurrentChat(finalMessages, title);
    } catch {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content:
          "Something went wrong. Please try again!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestionClick = (query: string) => {
    sendMessage(query);
  };

  const filteredHistory = chatHistory.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full relative">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:relative lg:translate-x-0 z-50 w-72 h-full bg-[#111827] border-r border-[#2a2a4a] flex flex-col transition-transform duration-300`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#2a2a4a]">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e94560] hover:bg-[#d63851] text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] text-sm text-gray-200 placeholder:text-muted-foreground focus:outline-none focus:border-[#e94560]/50"
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {filteredHistory.length > 0 ? (
            <div className="space-y-1">
              {filteredHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => switchToChat(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeChatId === chat.id
                      ? "bg-[#1a1a2e] border border-[#e94560]/30 text-white"
                      : "hover:bg-[#1a1a2e] text-muted-foreground hover:text-gray-300 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 pl-5">
                    {chat.createdAt.toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No chat history yet
            </p>
          )}
        </div>

        {/* Popular Genres */}
        <div className="p-3 border-t border-[#2a2a4a]">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
            Popular Genres
          </p>
          <div className="flex flex-wrap gap-1.5">
            {genreTags.slice(0, 8).map((genre) => (
              <button
                key={genre}
                onClick={() => sendMessage(`${genre} movies`)}
                className="px-2 py-1 rounded-md bg-[#1a1a2e] hover:bg-[#e94560]/10 border border-[#2a2a4a] hover:border-[#e94560]/50 text-[10px] text-gray-400 hover:text-white transition-all"
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a4a] bg-[#0f0f1a]/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[#1a1a2e] transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e94560] to-[#f59e0b] flex items-center justify-center">
              <Clapperboard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold gradient-text">MovieMate</h1>
              <p className="text-[10px] text-muted-foreground">
                Your AI Movie Expert
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e94560]/20 to-[#f59e0b]/20 flex items-center justify-center mb-6">
                <Film className="w-10 h-10 text-[#e94560]" />
              </div>
              <h2 className="text-xl font-bold mb-2">
                Welcome to <span className="gradient-text">MovieMate</span>
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                I&apos;m your AI movie expert! Ask me about movies, get
                recommendations, discover new films, or find your next favorite
                movie.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {[
                  {
                    icon: <Sparkles className="w-4 h-4 text-[#e94560]" />,
                    text: "Suggest sci-fi movies after 2010",
                  },
                  {
                    icon: <Film className="w-4 h-4 text-[#f59e0b]" />,
                    text: "Movies similar to Inception",
                  },
                  {
                    icon: <Popcorn className="w-4 h-4 text-[#10b981]" />,
                    text: "What did Christopher Nolan direct?",
                  },
                  {
                    icon: <Clapperboard className="w-4 h-4 text-[#6366f1]" />,
                    text: "Highly rated thriller movies",
                  },
                ].map((item) => (
                  <button
                    key={item.text}
                    onClick={() => sendMessage(item.text)}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#e94560]/50 text-sm text-gray-300 hover:text-white transition-all text-left"
                  >
                    {item.icon}
                    {item.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onMovieClick={onMovieClick}
              />
            ))
          )}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions & Input */}
        <div className="border-t border-[#2a2a4a] bg-[#0f0f1a]/80 backdrop-blur-sm">
          {/* Quick Suggestions */}
          <div className="px-4 pt-3">
            <QuickSuggestions onSelect={handleSuggestionClick} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 pt-2">
            <div className="flex items-end gap-2 bg-[#1a1a2e] rounded-xl border border-[#2a2a4a] focus-within:border-[#e94560]/50 transition-colors p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about movies..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder:text-muted-foreground resize-none focus:outline-none max-h-32 py-1.5 px-2"
                style={{
                  height: "auto",
                  minHeight: "24px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 128) + "px";
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 p-2 rounded-lg bg-[#e94560] hover:bg-[#d63851] disabled:opacity-50 disabled:hover:bg-[#e94560] text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
