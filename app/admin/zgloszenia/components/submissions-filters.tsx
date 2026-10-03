"use client";

import type { ReactNode } from "react";
import { statusLabels, typeLabels, useSubmissions, type Filters, type SubmissionStatus } from "./submissions-provider";

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
    <label className="relative flex items-center gap-1">
      <span>{label}:</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-sizing-content appearance-none bg-transparent pr-5 text-ink focus:outline-none focus-visible:underline"
      >
        {children}
      </select>
      <svg viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-0 size-3" aria-hidden="true">
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
  const { filters, setFilter, categories, locations } = useSubmissions();

  return (
    <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5" role="group" aria-label="Filtry zgłoszeń">
      <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilter("status", value as Filters["status"])}>
        <option value="all">wszystkie</option>
        {(Object.keys(statusLabels) as SubmissionStatus[]).map((status) => (
          <option key={status} value={status}>
            {statusLabels[status].toLocaleLowerCase("pl")}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect label="Typ" value={filters.type} onChange={(value) => setFilter("type", value as Filters["type"])}>
        <option value="all">wszystkie</option>
        <option value="problem">{typeLabels.problem.toLocaleLowerCase("pl")}</option>
        <option value="idea">{typeLabels.idea.toLocaleLowerCase("pl")}</option>
      </FilterSelect>
      <FilterSelect label="Kategoria" value={filters.category} onChange={(value) => setFilter("category", value)}>
        <option value="">wszystkie</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect label="Lokalizacja" value={filters.location} onChange={(value) => setFilter("location", value)}>
        <option value="">Małopolska</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
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
  );
}
