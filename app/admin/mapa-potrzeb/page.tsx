import type { Metadata } from "next";
import { CountyMap } from "./components/county-map";
import { IndicatorMeta } from "./components/indicator-meta";
import { IndicatorSearch } from "./components/indicator-search";
import { IndicatorSummary } from "./components/indicator-summary";
import { IndicatorsProvider } from "./components/indicators-provider";

export const metadata: Metadata = {
  title: "Mapa wyzwań społecznych — Panel Administratora Hubmi",
};

// Figma 15:817 / 15:908 / 15:1049 / 15:1232 — regional indicators from GET /api/regional-statistics.
export default function NeedsMapPage() {
  return (
    <IndicatorsProvider>
      <main id="main-content" className="flex flex-col gap-7.5 p-10 max-sm:p-5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
          Zasobnik wiedzy
        </p>
        <h1 className="font-heading text-section text-primary">Mapa wyzwań społecznych</h1>
        <p className="max-w-[60ch]">
          Zobacz, jak wskaźniki społeczne rozkładają się w powiatach Małopolski. Wybierz wskaźnik i porównaj obszary.
        </p>

        <IndicatorSearch />
        <IndicatorMeta />

        <div className="grid grid-cols-[minmax(0,860px)_minmax(300px,400px)] items-start gap-7.5 max-xl:grid-cols-1">
          <figure className="m-0 flex flex-col gap-2.5">
            <CountyMap />
            <figcaption className="text-caption">
              Granice powiatów: polska-geojson (GUGiK PRG) · dane: Obserwatorium ROPS Kraków
            </figcaption>
          </figure>
          <aside aria-label="Analiza wybranego wskaźnika">
            <IndicatorSummary />
          </aside>
        </div>
      </main>
    </IndicatorsProvider>
  );
}
