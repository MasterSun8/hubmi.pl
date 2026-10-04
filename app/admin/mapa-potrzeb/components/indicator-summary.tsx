"use client";

import { shortCountyName } from "@/lib/geo/county-names";
import { legendGradient } from "./county-map";
import { formatValue, useIndicators } from "./indicators-provider";

const labelClass = "text-caption font-medium tracking-label-sm uppercase";

// Figma 15:897 — the analysis column next to the map, driven by the selected indicator.
export function IndicatorSummary() {
  const { selected, status, hoveredRegion } = useIndicators();

  if (status === "loading") {
    return <p aria-live="polite">Ładowanie wskaźników z bazy…</p>;
  }
  if (status === "error" || !selected) {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać wskaźników. Spróbuj odświeżyć stronę.
      </p>
    );
  }

  const ranked = Object.entries(selected.values)
    .filter((entry): entry is [string, number] => entry[1] !== null)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col items-start gap-5">
      <h2 className="font-heading text-title text-primary">{selected.name}</h2>
      <p>
        {selected.category.toLocaleLowerCase("pl")} · rok {selected.year}
      </p>

      <p className={labelClass}>Skala wartości</p>
      <div className={`h-3 w-full max-w-90 ${legendGradient}`} aria-hidden="true" />
      <p className="-mt-2.5 flex w-full max-w-90 justify-between text-caption">
        <span>{formatValue(selected.min)}</span>
        <span>{formatValue(selected.max)}</span>
      </p>

      <p className={labelClass}>Najwyższe wartości</p>
      <ol className="m-0 w-full max-w-90 list-none p-0">
        {ranked.slice(0, 3).map(([region, value]) => (
          <li key={region} className="flex justify-between gap-5">
            <span>{region}</span>
            <span className="font-medium">{formatValue(value)}</span>
          </li>
        ))}
      </ol>

      {/* Always rendered with the same height, so hovering the map never shifts the layout. */}
      <p className={labelClass}>Wybrany powiat</p>
      <p className="-mt-2.5 flex w-full max-w-90 justify-between gap-5">
        {hoveredRegion ? (
          <>
            <span>{hoveredRegion}</span>
            <span className="font-medium">{formatValue(selected.values[hoveredRegion])}</span>
          </>
        ) : (
          <span className="text-muted">Najedź na powiat na mapie</span>
        )}
      </p>

      <details className="w-full max-w-90">
        <summary className={`${labelClass} text-primary`}>Wszystkie powiaty ({ranked.length})</summary>
        <ol className="m-0 mt-2.5 list-none p-0">
          {ranked.map(([region, value]) => (
            <li key={region} className="flex justify-between gap-5 border-t border-line/40 py-1">
              <span>{shortCountyName(region)}</span>
              <span>{formatValue(value)}</span>
            </li>
          ))}
        </ol>
      </details>

      <p className="max-w-90 text-caption">
        {selected.description ?? "Kolor powiatu pokazuje wartość wskaźnika względem pozostałych powiatów Małopolski."}
        <br />
        Źródło: {selected.source ?? "Obserwatorium ROPS Kraków (GUS, Bank Danych Lokalnych)"}
      </p>
    </div>
  );
}
