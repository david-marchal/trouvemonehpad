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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function SearchBar({
  defaultRadius = 20,
}: {
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
    <form
      onSubmit={handleSubmit}
      role="search"
      className="w-full max-w-3xl mx-auto text-left"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch bg-white rounded-3xl sm:rounded-full shadow-[0_8px_30px_rgba(23,40,43,0.14)] ring-1 ring-black/5 sm:p-2 p-2 gap-1 sm:gap-0">
        <label
          htmlFor="home-search-q"
          className="flex-1 min-w-0 rounded-2xl sm:rounded-full px-5 py-3 cursor-text hover:bg-sage-50 focus-within:bg-sage-50 transition-colors"
        >
          <span className="block text-xs font-bold text-foreground">Où ?</span>
          <input
            id="home-search-q"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ville, code postal ou nom de l'EHPAD"
            autoComplete="off"
            className="block w-full min-w-0 bg-transparent outline-none text-base text-foreground placeholder:text-foreground/50"
          />
        </label>

        <span
          className="hidden sm:block self-center h-8 w-px bg-sage-200"
          aria-hidden="true"
        />

        <label
          htmlFor="home-search-radius"
          className="sm:w-40 rounded-2xl sm:rounded-full px-5 py-3 cursor-pointer hover:bg-sage-50 focus-within:bg-sage-50 transition-colors"
        >
          <span className="block text-xs font-bold text-foreground">
            Autour de
          </span>
          <select
            id="home-search-radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="block w-full bg-transparent outline-none text-base text-foreground cursor-pointer -ml-1"
          >
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          aria-label="Rechercher"
          className="flex items-center justify-center gap-2 bg-coral-600 hover:bg-coral-700 text-white font-semibold rounded-2xl sm:rounded-full min-h-[52px] sm:min-h-0 sm:w-[60px] sm:self-center sm:h-[60px] transition-colors cursor-pointer"
        >
          <SearchIcon className="w-6 h-6" />
          <span className="sm:hidden">Rechercher</span>
        </button>
      </div>
    </form>
  );
}
