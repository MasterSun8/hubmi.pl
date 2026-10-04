"use client";

import { plural } from "../../zgloszenia/components/submissions-provider";
import { countyTitle, useReports, type CountyTrend } from "./reports-provider";

const labelClass = "text-caption font-medium tracking-label-sm uppercase";
const numberFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 });

// Categories as horizontal bars, longest first.
function CategoryBars({ trend }: { trend: CountyTrend }) {
  const entries = Object.entries(trend.categories).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, count]) => count));
  return (
    <ul className="m-0 flex w-full list-none flex-col gap-2.5 p-0">
      {entries.map(([category, count]) => (
        <li key={category} className="flex flex-col gap-1">
          <span className="flex justify-between gap-5">
            <span>{category}</span>
            <span className="font-medium">{count}</span>
          </span>
          <span className="h-1.5 bg-line/30" aria-hidden="true">
            <span className="block h-full bg-primary" style={{ width: `${(count / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function SubmissionsBlock({ trend }: { trend: CountyTrend | undefined }) {
  if (!trend || trend.total === 0) {
    return <p className="text-muted">Brak zgłoszeń mieszkańców z tego obszaru.</p>;
  }
  return (
    <>
      <p className="flex items-baseline gap-2.5">
        <span className="font-heading text-section text-primary">{trend.total}</span>
        <span>{plural(trend.total, "zgłoszenie", "zgłoszenia", "zgłoszeń")}</span>
      </p>
      {trend.avgScore !== null && (
        <p className="-mt-2.5">
          Średni AI Score: <span className="font-medium">{trend.avgScore}/100</span>
        </p>
      )}
      <CategoryBars trend={trend} />
    </>
  );
}

// The column next to the map: the selected county, or the whole region when none is selected.
export function RegionSummary() {
  const { selectedCounty, clearCounty, byCounty, overall, unassigned, statsFor } = useReports();

  if (!selectedCounty) {
    const top = Object.entries(byCounty)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);
    return (
      <div className="flex flex-col items-start gap-5">
        <h2 className="font-heading text-title text-primary">Cała Małopolska</h2>
        <p className={labelClass}>Zgłoszenia mieszkańców</p>
        <SubmissionsBlock trend={overall} />

        {top.length > 0 && (
          <>
            <p className={labelClass}>Najwięcej zgłoszeń</p>
            <ol className="m-0 -mt-2.5 w-full list-none p-0">
              {top.map(([county, trend]) => (
                <li key={county} className="flex justify-between gap-5">
                  <span>{county}</span>
                  <span className="font-medium">{trend.total}</span>
                </li>
              ))}
            </ol>
          </>
        )}

        {unassigned.total > 0 && (
          <p className="text-caption text-muted">
            Bez przypisanego powiatu: {unassigned.total} ({unassigned.locations.join(", ")}). Miejscowość nie pasuje do
            żadnego powiatu albo jest testowa.
          </p>
        )}
        <p className="text-caption">Kliknij powiat na mapie, aby zobaczyć jego zgłoszenia i wskaźniki GUS.</p>
      </div>
    );
  }

  const stats = statsFor(selectedCounty);
  const trend = byCounty[selectedCounty];

  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex w-full items-start justify-between gap-5">
        <h2 className="font-heading text-title text-primary">{countyTitle(selectedCounty)}</h2>
        <button type="button" className="shrink-0 border-0 bg-transparent p-0 text-caption font-medium text-primary" onClick={clearCounty}>
          Cała Małopolska
        </button>
      </div>

      <p className={labelClass}>Zgłoszenia mieszkańców</p>
      <SubmissionsBlock trend={trend} />
      {trend && trend.total > 0 && <p className="-mt-2.5 text-caption text-muted">Miejscowości: {trend.locations.join(", ")}</p>}

      <p className={labelClass}>Wskaźniki GUS (Obserwatorium ROPS)</p>
      {stats.length > 0 ? (
        <dl className="m-0 -mt-2.5 flex w-full flex-col">
          {stats.map((stat) => (
            <div key={stat.indicator} className="flex justify-between gap-5 border-b border-line py-2">
              <dt>{stat.indicator}</dt>
              <dd className="m-0 font-medium">{typeof stat.value === "number" ? numberFormat.format(stat.value) : (stat.value ?? "—")}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="-mt-2.5 text-muted">Brak wskaźników dla tego powiatu.</p>
      )}
    </div>
  );
}
