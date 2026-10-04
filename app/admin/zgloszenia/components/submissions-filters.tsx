"use client";

import { useState, type ReactNode } from "react";
import { SubmissionsSearch } from "./submissions-search";
import { riskLabels, type RiskLevel } from "./risk-level";
import { statusLabels, useSubmissions, type Filters, type SubmissionStatus } from "./submissions-provider";

// Figma 15:1483 — "Status: wszystkie ⌄" style filters, built on native selects.
function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative flex min-w-0 flex-col gap-1 text-caption font-medium">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full appearance-none rounded-input border border-field bg-surface py-2 pr-10 pl-4 text-body font-normal text-ink"
      >
        {children}
      </select>
      <svg viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-4 bottom-4 size-3" aria-hidden="true">
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}

const periods = [
  { value: "", label: "cały okres" },
  { value: "7", label: "ostatnie 7 dni" },
  { value: "30", label: "ostatnie 30 dni" },
  { value: "90", label: "ostatnie 90 dni" },
];

export function SubmissionsFilters() {
  const { filters, setFilter, categories, counties } = useSubmissions();
  const [expanded, setExpanded] = useState(false);
  const activeCount = [filters.status !== "all", filters.risk !== null, Boolean(filters.category), Boolean(filters.county), filters.days !== null].filter(Boolean).length;

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 sm:gap-5">
        <SubmissionsSearch />
        <button type="button" aria-expanded={expanded} aria-controls="submission-filters" onClick={() => setExpanded(!expanded)} className="flex min-h-11 items-center gap-2.5 px-2.5 font-medium text-primary">
          Filtry{activeCount > 0 && ` (${activeCount})`}
          <span aria-hidden="true">{expanded ? "−" : "+"}</span>
        </button>
      </div>
      <div id="submission-filters" hidden={!expanded} className={`${expanded ? "grid" : "hidden"} mt-5 grid-cols-1 gap-5 border-t border-line pt-5 sm:grid-cols-2 xl:grid-cols-5`} role="group" aria-label="Filtry zgłoszeń">
        <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilter("status", value as Filters["status"])}>
          <option value="all">wszystkie</option>
          {(Object.keys(statusLabels) as SubmissionStatus[]).map((status) => (
            <option key={status} value={status}>
              {statusLabels[status].toLocaleLowerCase("pl")}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Ryzyko"
          value={filters.risk?.toString() ?? ""}
          onChange={(value) => setFilter("risk", value ? Number(value) : null)}
        >
          <option value="">wszystkie</option>
          {([4, 3, 2, 1] as RiskLevel[]).map((level) => (
            <option key={level} value={level}>
              {riskLabels[level]}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Kategoria" value={filters.category} onChange={(value) => setFilter("category", value)}>
          <option value="">wszystkie</option>
          {categories.map(({ category, count }) => (
            <option key={category} value={category}>
              {category} ({count})
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Powiat" value={filters.county} onChange={(value) => setFilter("county", value as Filters["county"])}>
          <option value="">cała Małopolska</option>
          {counties.map(({ county, count }) => (
            <option key={county} value={county}>
              {county} ({count})
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="Okres"
          value={filters.days?.toString() ?? ""}
          onChange={(value) => {
            const days = value ? Number(value) : null;
            setFilter("days", days);
            setFilter("since", days ? Date.now() - days * 24 * 60 * 60 * 1000 : null);
          }}
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </FilterSelect>
      </div>
    </div>
  );
}
