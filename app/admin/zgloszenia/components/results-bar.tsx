"use client";

import { PAGE_SIZE, plural, useSubmissions } from "./submissions-provider";

// Figma 15:1489 — result count and the sort switch.
export function ResultsBar() {
  const { results, sort, toggleSort } = useSubmissions();

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-7.5 gap-y-2.5">
      <p className="text-caption" aria-live="polite">
        {results.length} {plural(results.length, "wynik", "wyniki", "wyników")} · {PAGE_SIZE} na stronie
      </p>
      <button type="button" onClick={toggleSort} className="border-0 bg-transparent p-0 font-medium text-primary">
        Sortuj: {sort === "risk" ? "ryzyko — od najwyższego" : "data — od najnowszych"}{" "}
        <span aria-hidden="true">↓</span>
      </button>
    </div>
  );
}
