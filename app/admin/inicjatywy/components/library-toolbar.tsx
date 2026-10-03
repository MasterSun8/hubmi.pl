"use client";

import { solutionStatusLabels, useInitiatives, type SolutionStatus } from "./initiatives-provider";
import { plural } from "../../zgloszenia/components/submissions-provider";

export function LibraryToolbar() {
  const { query, setQuery, statusFilter, setStatusFilter, results, sort, toggleSort } = useInitiatives();

  return (
    <div className="flex flex-col gap-5">
      <label className="flex min-h-10.5 items-center gap-5 rounded-input border border-field px-5 transition-colors focus-within:border-primary">
        <span className="sr-only">Szukaj innowacji</span>
        <svg viewBox="0 0 16 16" fill="none" className="size-4 flex-none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Szukaj po nazwie, opisie, grupie docelowej lub organizacji"
          className="min-w-0 flex-1 bg-transparent py-2 text-ink placeholder:text-muted focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-x-7.5 gap-y-2.5">
        <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
          <label className="relative flex items-center gap-1">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as SolutionStatus | "all")}
              className="field-sizing-content appearance-none bg-transparent pr-5 text-ink focus:outline-none focus-visible:underline"
            >
              <option value="all">wszystkie</option>
              {(Object.keys(solutionStatusLabels) as SolutionStatus[]).map((status) => (
                <option key={status} value={status}>
                  {solutionStatusLabels[status].toLocaleLowerCase("pl")}
                </option>
              ))}
            </select>
            <svg viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-0 size-3" aria-hidden="true">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
          <p className="text-caption" aria-live="polite">
            {results.length} {plural(results.length, "innowacja", "innowacje", "innowacji")}
          </p>
        </div>
        <button type="button" onClick={toggleSort} className="border-0 bg-transparent p-0 font-medium text-primary">
          Sortuj: {sort === "matches" ? "najwięcej pasujących zgłoszeń" : "alfabetycznie"} <span aria-hidden="true">↓</span>
        </button>
      </div>
    </div>
  );
}
