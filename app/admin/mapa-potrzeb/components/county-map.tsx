"use client";

import { MAP_HEIGHT, MAP_WIDTH, counties } from "@/lib/geo/malopolska-counties";
import { formatValue, shortRegionName, useIndicators, type Indicator } from "./indicators-provider";

// The legend from Figma 15:901: secondary → success (35%) → warning (65%) → error.
const scale = [
  { at: 0, color: "var(--color-secondary)" },
  { at: 0.35, color: "var(--color-success)" },
  { at: 0.65, color: "var(--color-warning)" },
  { at: 1, color: "var(--color-error)" },
];

export const legendGradient =
  "bg-[linear-gradient(90deg,var(--color-secondary),var(--color-success)_35%,var(--color-warning)_65%,var(--color-error))]";

function colorFor(indicator: Indicator, value: number | null | undefined) {
  if (value === null || value === undefined) return "var(--color-background)";
  const t = indicator.max === indicator.min ? 0.5 : (value - indicator.min) / (indicator.max - indicator.min);
  const upper = scale.findIndex((stop) => stop.at >= t);
  if (upper <= 0) return scale[0].color;
  const from = scale[upper - 1];
  const to = scale[upper];
  const share = ((t - from.at) / (to.at - from.at)) * 100;
  return `color-mix(in oklab, ${to.color} ${share.toFixed(1)}%, ${from.color})`;
}

const cities = ["powiat m. Kraków", "powiat m. Tarnów", "powiat m. Nowy Sącz"];

export function CountyMap() {
  const { selected, status, hoveredRegion, setHoveredRegion, layer } = useIndicators();
  const heatmap = layer === "heatmap" && selected !== null;

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="h-auto max-h-137.5 w-full"
      role="group"
      aria-label={selected ? `Mapa powiatów Małopolski: ${selected.name}` : "Mapa powiatów Małopolski"}
      aria-busy={status === "loading"}
    >
      {counties.map((county) => {
        const value = selected?.values[county.name];
        const hovered = hoveredRegion === county.name;
        return (
          <path
            key={county.name}
            d={county.path}
            tabIndex={0}
            aria-label={`${county.name}: ${formatValue(value)}`}
            style={{ fill: heatmap && selected ? colorFor(selected, value) : "var(--color-surface)" }}
            className={`cursor-pointer stroke-ink/60 transition-[fill,stroke-width] duration-300 outline-none focus-visible:stroke-ink ${
              hovered ? "stroke-ink stroke-2" : "stroke-1"
            }`}
            strokeLinejoin="round"
            onMouseEnter={() => setHoveredRegion(county.name)}
            onMouseLeave={() => setHoveredRegion(null)}
            onFocus={() => setHoveredRegion(county.name)}
            onBlur={() => setHoveredRegion(null)}
          >
            <title>{`${county.name}: ${formatValue(value)}`}</title>
          </path>
        );
      })}
      {counties
        .filter((county) => cities.includes(county.name))
        .map((county) => (
          <g key={county.name} className="pointer-events-none" aria-hidden="true">
            <circle cx={county.center[0]} cy={county.center[1]} r="4" className="fill-ink" />
            <text x={county.center[0] + 7} y={county.center[1] - 6} className="fill-ink text-[17px]">
              {shortRegionName(county.name)}
            </text>
          </g>
        ))}
    </svg>
  );
}

export function LayerToggle() {
  const { layer, setLayer } = useIndicators();
  const option = (value: "outline" | "heatmap", label: string) => (
    <button
      type="button"
      aria-pressed={layer === value}
      onClick={() => setLayer(value)}
      className="border-0 bg-transparent p-0 text-caption font-medium tracking-label-sm text-primary uppercase aria-pressed:text-ink aria-pressed:underline aria-pressed:underline-offset-4"
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2.5" role="group" aria-label="Warstwa mapy">
      {option("outline", "Sam kontur")}
      <span className="text-caption text-primary" aria-hidden="true">
        /
      </span>
      {option("heatmap", "Heatmapa")}
    </div>
  );
}
