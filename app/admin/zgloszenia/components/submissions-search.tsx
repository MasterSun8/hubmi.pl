"use client";

import { useSubmissions } from "./submissions-provider";

// Figma 15:1480.
export function SubmissionsSearch() {
  const { query, setQuery } = useSubmissions();

  return (
    <label className="flex min-h-10.5 items-center gap-5 rounded-input border border-field px-5 transition-colors focus-within:border-primary">
      <span className="sr-only">Szukaj zgłoszeń</span>
      <svg viewBox="0 0 16 16" fill="none" className="size-4 flex-none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Szukaj po tytule, opisie lub numerze zgłoszenia"
        className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none"
      />
    </label>
  );
}
