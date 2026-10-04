import type { Metadata } from "next";
import { isCountyFilter } from "@/lib/geo/county-names";
import { QueueSummary } from "./components/queue-summary";
import { ResultsBar } from "./components/results-bar";
import { SubmissionsFilters } from "./components/submissions-filters";
import { SubmissionsPagination } from "./components/submissions-pagination";
import { SubmissionsProvider } from "./components/submissions-provider";
import { SubmissionsTable } from "./components/submissions-table";

export const metadata: Metadata = {
  title: "Zgłoszenia — Panel instytucji Hubmi",
};

// Figma 15:1464 — the submissions queue from GET /api/submissions.
// ?powiat= preselects the county filter (links from the reports map).
export default async function SubmissionsPage({ searchParams }: PageProps<"/admin/zgloszenia">) {
  const { powiat } = await searchParams;

  return (
    <SubmissionsProvider initialCounty={isCountyFilter(powiat) ? powiat : ""}>
      <main id="main-content" className="flex flex-col gap-10 p-10 max-sm:gap-7.5 max-sm:p-5">
        <header className="flex flex-col gap-2.5">
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Małopolska / panel instytucji</p>
          <h1 className="font-heading text-section text-primary">Zgłoszenia</h1>
          <p>Przeglądaj potrzeby mieszkańców i oferty pomocy. Ustal priorytet i zaplanuj dalsze działania.</p>
        </header>

        <QueueSummary />
        <section aria-label="Wyszukiwanie i filtry">
          <SubmissionsFilters />
        </section>

        <section aria-labelledby="submissions-heading" className="flex flex-col gap-5">
          <h2 id="submissions-heading" className="text-subtitle font-light">Lista zgłoszeń</h2>
          <ResultsBar />
          <SubmissionsTable />
          <div className="flex flex-wrap items-center justify-between gap-x-7.5 gap-y-2.5">
            <p className="text-caption">Poziom ryzyka to wstępna ocena AI na podstawie rozmowy. Uzasadnienie jest w szczegółach zgłoszenia.</p>
            <SubmissionsPagination />
          </div>
        </section>
      </main>
    </SubmissionsProvider>
  );
}
