"use client";

import { MAP_HEIGHT, MAP_WIDTH, counties } from "@/lib/geo/malopolska-counties";
import { plural } from "../../zgloszenia/components/submissions-provider";
import { shortCountyName, useReports } from "./reports-provider";

// Same scale as the needs map (Figma 15:901): secondary → success → warning → error.
const scale = [
  { at: 0, color: "var(--color-secondary)" },
  { at: 0.35, color: "var(--color-success)" },
  { at: 0.65, color: "var(--color-warning)" },
  { at: 1, color: "var(--color-error)" },
];

export const legendGradient =
  "bg-[linear-gradient(90deg,var(--color-secondary),var(--color-success)_35%,var(--color-warning)_65%,var(--color-error))]";

function colorFor(total: number, max: number) {
  if (total === 0) return "var(--color-surface)";
  const t = total / max;
  const upper = scale.findIndex((stop) => stop.at >= t);
  if (upper <= 0) return scale[0].color;
  const from = scale[upper - 1];
  const to = scale[upper];
  const share = ((t - from.at) / (to.at - from.at)) * 100;
  return `color-mix(in oklab, ${to.color} ${share.toFixed(1)}%, ${from.color})`;
}

const cities = ["powiat m. Kraków", "powiat m. Tarnów", "powiat m. Nowy Sącz"];

const countLabel = (total: number) => `${total} ${plural(total, "zgłoszenie", "zgłoszenia", "zgłoszeń")}`;

// Counties colored by the number of submissions; click (or Enter / Space) selects a county.
export function ReportsMap() {
  const { byCounty, maxCountyTotal, selectedCounty, toggleCounty, hoveredCounty, setHoveredCounty } = useReports();

  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-auto max-h-137.5 w-full" role="group" aria-label="Zgłoszenia w powiatach Małopolski">
      {counties.map((county) => {
        const total = byCounty[county.name]?.total ?? 0;
        const selected = selectedCounty === county.name;
        const label = `${county.name}: ${countLabel(total)}`;
        return (
          <path
            key={county.name}
            d={county.path}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={label}
            style={{ fill: colorFor(total, maxCountyTotal) }}
            className={`cursor-pointer transition-[fill,stroke,stroke-width] duration-300 outline-none focus-visible:stroke-ink ${
              selected ? "stroke-primary stroke-3" : hoveredCounty === county.name ? "stroke-ink stroke-1" : "stroke-ink/60 stroke-1"
            }`}
            strokeLinejoin="round"
            onClick={() => toggleCounty(county.name)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleCounty(county.name);
              }
            }}
            onMouseEnter={() => setHoveredCounty(county.name)}
            onMouseLeave={() => setHoveredCounty(null)}
            onFocus={() => setHoveredCounty(county.name)}
            onBlur={() => setHoveredCounty(null)}
          >
            <title>{label}</title>
          </path>
        );
      })}
      {counties
        .filter((county) => cities.includes(county.name))
        .map((county) => (
          <g key={county.name} className="pointer-events-none" aria-hidden="true">
            <circle cx={county.center[0]} cy={county.center[1]} r="4" className="fill-ink" />
            <text x={county.center[0] + 7} y={county.center[1] - 6} className="fill-ink text-[17px]">
              {shortCountyName(county.name)}
            </text>
          </g>
        ))}
    </svg>
  );
}

// Legend under the map: 0 … the busiest county.
export function ReportsLegend() {
  const { maxCountyTotal } = useReports();
  return (
    <div className="flex max-w-90 flex-col gap-1">
      <div className={`h-3 w-full ${legendGradient}`} aria-hidden="true" />
      <p className="flex justify-between text-caption">
        <span>1 zgłoszenie</span>
        <span>{countLabel(maxCountyTotal)}</span>
      </p>
    </div>
  );
}
