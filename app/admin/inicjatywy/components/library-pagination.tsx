"use client";

import { useInitiatives } from "./initiatives-provider";

const buttonClass = "border-0 bg-transparent p-0 font-medium text-primary disabled:opacity-40";

export function LibraryPagination() {
  const { page, pageCount, setPage } = useInitiatives();
  if (pageCount <= 1) return null;

  return (
    <nav aria-label="Strony wyników" className="flex items-center gap-2.5">
      <button type="button" className={buttonClass} onClick={() => setPage(page - 1)} disabled={page === 1} aria-label="Poprzednia strona">
        ←
      </button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
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
      ))}
      <button type="button" className={buttonClass} onClick={() => setPage(page + 1)} disabled={page === pageCount} aria-label="Następna strona">
        →
      </button>
    </nav>
  );
}
