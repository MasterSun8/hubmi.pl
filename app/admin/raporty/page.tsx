import type { Metadata } from "next";
import { RegionSummary } from "./components/region-summary";
import { ReportPanel } from "./components/report-panel";
import { ReportsLegend, ReportsMap } from "./components/reports-map";
import { ReportsProvider } from "./components/reports-provider";

export const metadata: Metadata = {
  title: "Raporty i trendy — Panel Administratora Hubmi",
};

// Submissions from residents set against GUS indicators per county, and an AI report on demand
// (POST /api/reports/generate). The data loads in the browser, so the page opens at once.
export default function ReportsPage() {
  return (
    <ReportsProvider>
      <main id="main-content" className="flex flex-col gap-7.5 p-10 max-sm:p-5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Zasobnik wiedzy</p>
        <h1 className="font-heading text-section text-primary">Raporty i trendy</h1>
        <p className="max-w-[60ch]">
          Zestawienie potrzeb zgłaszanych przez mieszkańców z twardymi wskaźnikami Obserwatorium ROPS. Wybierz powiat na
          mapie, a asystent przygotuje syntezę z rekomendacjami.
        </p>

        <div className="grid grid-cols-[minmax(0,860px)_minmax(300px,400px)] items-start gap-7.5 max-xl:grid-cols-1">
          <figure className="m-0 flex flex-col gap-2.5">
            <ReportsMap />
            <figcaption className="flex flex-col gap-2.5 text-caption">
              <ReportsLegend />
              Liczba zgłoszeń mieszkańców w powiatach · granice: polska-geojson (GUGiK PRG)
            </figcaption>
          </figure>
          <aside aria-label="Analiza wybranego obszaru">
            <RegionSummary />
          </aside>
        </div>

        <ReportPanel />
      </main>
    </ReportsProvider>
  );
}
