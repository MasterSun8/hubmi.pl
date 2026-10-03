"use client";

import Link from "next/link";
import { statusLabels, submissionNumber, typeLabels, useSubmissions, type Submission } from "./submissions-provider";

const columns = "grid grid-cols-[minmax(0,1fr)_220px_160px_100px_30px] gap-x-5 max-lg:grid-cols-1";
const headerClass = "text-caption font-medium uppercase";

// "dziś, 09:42", "wczoraj, 18:05", otherwise "01.10.2026".
function formatDate(iso: string) {
  const date = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const time = date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  const dayMs = 24 * 60 * 60 * 1000;
  if (date >= startOfToday) return `dziś, ${time}`;
  if (date.getTime() >= startOfToday.getTime() - dayMs) return `wczoraj, ${time}`;
  return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Score({ item }: { item: Submission }) {
  const score = item.priorityOverride ?? item.aiScore;
  if (score === null) return <span className="text-muted">brak oceny</span>;
  return (
    <span className="text-lead font-light text-primary">
      {score} / 100{item.priorityOverride !== null && <span className="sr-only"> (priorytet ustawiony ręcznie)</span>}
    </span>
  );
}

// Figma 15:1492 — one row per submission; the columns stack on narrow screens.
export function SubmissionsTable() {
  const { status, pageItems, results, all } = useSubmissions();

  if (status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać zgłoszeń. Spróbuj odświeżyć stronę.
      </p>
    );
  }

  return (
    <div role="table" aria-label="Zgłoszenia" aria-busy={status === "loading"}>
      <div role="row" className={`${columns} border-b border-line py-2.5 max-lg:hidden`}>
        <span role="columnheader" className={headerClass}>Zgłoszenie</span>
        <span role="columnheader" className={headerClass}>Lokalizacja / temat</span>
        <span role="columnheader" className={headerClass}>Status</span>
        <span role="columnheader" className={headerClass}>AI Score ↓</span>
        <span role="columnheader" className="sr-only">Szczegóły</span>
      </div>

      {pageItems.map((item) => (
        <div key={item.id} role="row" className={`${columns} relative items-center gap-y-2.5 border-b border-line py-5`}>
          <div role="cell">
            {/* The link covers the whole row, so any part of it opens the details. */}
            <Link href={`/admin/zgloszenia/${item.id}`} className="text-lead font-light text-ink no-underline after:absolute after:inset-0">
              {item.title}
            </Link>
            <p className="text-caption">
              {submissionNumber(item.id)} · {typeLabels[item.type]} · {formatDate(item.createdAt)}
            </p>
            <p className="mt-1 line-clamp-2 max-w-[70ch] text-caption text-ink/80">{item.summary}</p>
          </div>
          <p role="cell">
            {item.location}
            <br />
            {item.category ?? <span className="text-muted">bez kategorii</span>}
          </p>
          <p role="cell" className={`font-medium ${item.status === "new" ? "text-primary" : ""}`}>
            {statusLabels[item.status]}
          </p>
          <p role="cell">
            <Score item={item} />
          </p>
          <span role="cell" className="text-[24px] leading-7.5 text-primary max-lg:hidden" aria-hidden="true">
            →
          </span>
        </div>
      ))}

      {status === "ready" && results.length === 0 && (
        <p className="border-b border-line py-5">
          {all.length === 0 ? "Nie ma jeszcze żadnych zgłoszeń." : "Brak zgłoszeń dla wybranych filtrów."}
        </p>
      )}
    </div>
  );
}
