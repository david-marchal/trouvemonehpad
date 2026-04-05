"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const RADIUS_OPTIONS = [
  { value: 0, label: "Exact" },
  { value: 10, label: "10 km" },
  { value: 20, label: "20 km" },
  { value: 30, label: "30 km" },
  { value: 50, label: "50 km" },
  { value: 100, label: "100 km" },
];

export default function SearchBar({
  large = false,
  defaultRadius = 20,
}: {
  large?: boolean;
  defaultRadius?: number;
}) {
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(defaultRadius);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      params.set("radius", String(radius));
      router.push(`/search?${params.toString()}`);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-1">
      <form onSubmit={handleSubmit}>
        {/* Desktop: pill layout. Mobile: stacked */}
        <div
          className={`hidden sm:flex items-center bg-white rounded-full border-2 border-sage-200 shadow-sm hover:shadow-md hover:border-teal-300 focus-within:border-teal-400 focus-within:shadow-md transition-all ${large ? "p-2" : "p-1.5"}`}
        >
          <svg
            className={`text-foreground/30 ml-3 flex-shrink-0 ${large ? "w-6 h-6" : "w-5 h-5"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par ville, département ou nom..."
            className={`flex-1 bg-transparent outline-none px-3 text-foreground placeholder:text-foreground/35 ${large ? "text-lg py-2" : "text-base py-1.5"}`}
          />
          <button
            type="submit"
            className={`bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-full transition-colors cursor-pointer ${large ? "px-7 py-3 text-base" : "px-5 py-2 text-sm"}`}
          >
            Rechercher
          </button>
        </div>

        {/* Mobile: stacked layout */}
        <div className="sm:hidden flex flex-col gap-3">
          <div className="flex items-center bg-white rounded-xl border-2 border-sage-200 shadow-sm focus-within:border-teal-400 focus-within:shadow-md transition-all p-1.5">
            <svg
              className="text-foreground/30 ml-2 flex-shrink-0 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ville, département ou nom..."
              className="flex-1 bg-transparent outline-none px-3 text-base py-2 text-foreground placeholder:text-foreground/35"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl py-3 text-base transition-colors cursor-pointer min-h-[44px]"
          >
            Rechercher
          </button>
        </div>
      </form>

      <div className="mt-3 flex items-center gap-2 justify-center flex-wrap">
        <span className="text-xs text-foreground/50">Rayon :</span>
        {RADIUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            aria-pressed={radius === opt.value}
            onClick={() => setRadius(opt.value)}
            className={`text-sm px-4 py-2 rounded-full transition-colors cursor-pointer min-h-[44px] ${
              radius === opt.value
                ? "bg-teal-500 text-white font-semibold"
                : "bg-sage-100 text-foreground/60 hover:bg-sage-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
