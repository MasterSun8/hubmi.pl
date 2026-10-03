"use client";

import { useSubmissions } from "./submissions-provider";

// "1 2 3 … 57": first pages, the current one and the last, with gaps collapsed.
function pagesToShow(page: number, count: number): (number | "gap")[] {
  const wanted = new Set([1, 2, 3, page - 1, page, page + 1, count].filter((n) => n >= 1 && n <= count));
  const sorted = [...wanted].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? ["gap" as const, n] : [n]));
}

const buttonClass = "border-0 bg-transparent p-0 font-medium text-primary disabled:opacity-40";

// Figma 15:1529.
export function SubmissionsPagination() {
  const { page, pageCount, setPage } = useSubmissions();

  return (
    <nav aria-label="Strony wyników" className="flex items-center gap-2.5">
      <button type="button" className={buttonClass} onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Poprzednia strona">
        ←
      </button>
      {pagesToShow(page, pageCount).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="text-primary" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`${buttonClass} aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:underline-offset-4`}
            onClick={() => setPage(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Strona ${item}`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        className={buttonClass}
        onClick={() => setPage(page + 1)}
        disabled={page === pageCount}
        aria-label="Następna strona"
      >
        →
      </button>
    </nav>
  );
}
