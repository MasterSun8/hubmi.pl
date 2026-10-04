import type { Metadata } from "next";
import { QueueSummary } from "./components/queue-summary";
import { ResultsBar } from "./components/results-bar";
import { SubmissionsFilters } from "./components/submissions-filters";
import { SubmissionsPagination } from "./components/submissions-pagination";
import { SubmissionsProvider } from "./components/submissions-provider";
import { SubmissionsSearch } from "./components/submissions-search";
import { SubmissionsTable } from "./components/submissions-table";

export const metadata: Metadata = {
  title: "Zgłoszenia — Panel instytucji Hubmi",
};

// Figma 15:1464 — the submissions queue from GET /api/submissions.
export default function SubmissionsPage() {
  return (
    <SubmissionsProvider>
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Małopolska / panel instytucji</p>
        <h1 className="font-heading text-display text-primary">Zgłoszenia</h1>
        <p>Przeglądaj potrzeby mieszkańców i oferty pomocy. Ustal priorytet i zaplanuj dalsze działania.</p>

        <QueueSummary />
        <SubmissionsSearch />
        <SubmissionsFilters />
        <ResultsBar />
        <SubmissionsTable />

        <div className="flex flex-wrap items-center justify-between gap-x-7.5 gap-y-2.5">
          <p className="text-caption">Poziom ryzyka to wstępna ocena AI na podstawie rozmowy. Uzasadnienie jest w szczegółach zgłoszenia.</p>
          <SubmissionsPagination />
        </div>
      </main>
    </SubmissionsProvider>
  );
}
