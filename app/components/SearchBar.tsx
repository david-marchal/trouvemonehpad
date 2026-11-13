"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

const DEFAULT_RADIUS_KM = 10;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      params.set("radius", String(DEFAULT_RADIUS_KM));
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
