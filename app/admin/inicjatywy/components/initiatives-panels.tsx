"use client";

import { IdeasList } from "./ideas-list";
import { IdeasToolbar } from "./ideas-toolbar";
import { useInitiatives } from "./initiatives-provider";
import { LibraryPagination } from "./library-pagination";
import { LibraryTable } from "./library-table";
import { LibraryToolbar } from "./library-toolbar";

export function InitiativesPanels() {
  const { tab } = useInitiatives();

  if (tab === "ideas") {
    return (
      <section className="flex flex-col gap-5">
        <IdeasToolbar />
        <h2 className="mt-5 text-subtitle font-light">Pomysły mieszkańców</h2>
        <IdeasList />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <LibraryToolbar />
      <LibraryTable />
      <div className="flex flex-wrap items-center justify-between gap-x-7.5 gap-y-2.5">
        <p className="text-caption">
          Dopasowania: dla każdego zgłoszenia system wybiera 3 najbliższe opublikowane innowacje (AI, podobieństwo opisów).
        </p>
        <LibraryPagination />
      </div>
    </section>
  );
}
