"use client";

import Link from "next/link";
import { solutionStatusLabels, useInitiatives } from "./initiatives-provider";
import { plural } from "../../zgloszenia/components/submissions-provider";

const columns = "grid grid-cols-[minmax(0,1fr)_140px_180px_30px] gap-x-5 max-lg:grid-cols-1";
const headerClass = "text-caption font-medium uppercase";

export function LibraryTable() {
  const { status, pageItems, results } = useInitiatives();

  if (status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać innowacji. Spróbuj odświeżyć stronę.
      </p>
    );
  }

  return (
    <div role="table" aria-label="Biblioteka innowacji" aria-busy={status === "loading"}>
      <div role="row" className={`${columns} border-b border-line py-2.5 max-lg:hidden`}>
        <span role="columnheader" className={headerClass}>Innowacja</span>
        <span role="columnheader" className={headerClass}>Status</span>
        <span role="columnheader" className={headerClass}>Dopasowania ↓</span>
        <span role="columnheader" className="sr-only">Szczegóły</span>
      </div>

      {pageItems.map((item) => (
        <div key={item.id} role="row" className={`${columns} relative items-center gap-y-2.5 border-b border-line py-5`}>
          <div role="cell">
            {/* The link covers the whole row, so any part of it opens the details. */}
            <Link href={`/admin/inicjatywy/${item.id}`} className="text-lead font-light text-ink no-underline after:absolute after:inset-0">
              {item.title}
            </Link>
            {item.organization && <p className="text-caption">{item.organization}</p>}
            {item.targetGroups[0] && (
              <p className="mt-1 line-clamp-2 max-w-[70ch] text-caption text-ink/80">Dla kogo: {item.targetGroups.join("; ")}</p>
            )}
          </div>
          <p role="cell" className={`font-medium ${item.status === "published" ? "" : "text-muted"}`}>
            {solutionStatusLabels[item.status]}
          </p>
          <p role="cell">
            {item.matchedSubmissions > 0 ? (
              <span className="text-primary">
                pasuje do {item.matchedSubmissions} {plural(item.matchedSubmissions, "zgłoszenia", "zgłoszeń", "zgłoszeń")}
              </span>
            ) : (
              <span className="text-muted">brak dopasowań</span>
            )}
          </p>
          <span role="cell" className="text-[24px] leading-7.5 text-primary max-lg:hidden" aria-hidden="true">
            →
          </span>
        </div>
      ))}

      {status === "ready" && results.length === 0 && (
        <p className="border-b border-line py-5">Brak innowacji dla wybranych filtrów.</p>
      )}
    </div>
  );
}
