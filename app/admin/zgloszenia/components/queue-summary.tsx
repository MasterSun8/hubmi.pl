"use client";

import { plural, useSubmissions } from "./submissions-provider";

// Figma 15:1474 — totals for the whole queue, not just the filtered results.
export function QueueSummary() {
  const { all, status } = useSubmissions();
  if (status !== "ready") return <p className="text-lead font-light">Ładowanie zgłoszeń…</p>;

  const fresh = all.filter((item) => item.status === "new").length;
  const inProgress = all.filter((item) => item.status === "in_progress").length;

  return (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-2.5">
      <p className="text-lead font-light">
        {all.length} {plural(all.length, "zgłoszenie", "zgłoszenia", "zgłoszeń")}
      </p>
      <p className="font-medium text-primary">
        {fresh} {plural(fresh, "nowe", "nowe", "nowych")}
      </p>
      <p>{inProgress} w trakcie obsługi</p>
    </div>
  );
}
