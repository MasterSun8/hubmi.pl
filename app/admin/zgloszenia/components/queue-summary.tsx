"use client";

import { useSubmissions } from "./submissions-provider";

// Figma 15:1474 — totals for the whole queue, not just the filtered results.
export function QueueSummary() {
  const { all, status } = useSubmissions();
  if (status !== "ready") return <p className="text-lead font-light">Ładowanie zgłoszeń…</p>;

  const fresh = all.filter((item) => item.status === "new").length;
  const inProgress = all.filter((item) => item.status === "in_progress").length;
  // Critical problems that nobody has closed yet.
  const critical = all.filter(
    (item) => item.riskLevel === 4 && item.status !== "resolved" && item.status !== "rejected",
  ).length;

  const metrics = [
    { label: "Wszystkie zgłoszenia", count: all.length, color: "text-ink", border: "border-line" },
    { label: "Nowe", count: fresh, color: "text-primary", border: "border-primary" },
    { label: "W trakcie obsługi", count: inProgress, color: "text-ink", border: "border-line" },
    { label: "Ryzyko krytyczne · otwarte", count: critical, color: "text-error hc:text-ink", border: "border-error hc:border-line" },
  ];

  return (
    <section aria-label="Podsumowanie zgłoszeń">
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, count, color, border }) => (
          <div key={label} className={`flex flex-col gap-2.5 border-t-2 bg-surface p-5 ${border}`}>
            <dt className="text-caption font-medium text-muted">{label}</dt>
            <dd className={`text-section font-light tabular-nums ${color}`}>{count}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
