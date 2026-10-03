"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";

// Row shape returned by GET /api/regional-statistics (table regional_statistics).
type StatisticRow = {
  category: string;
  indicator: string;
  region: string;
  year: number;
  value: number | null;
  valueText: string | null;
  description: string | null;
  source: string | null;
};

export type Indicator = {
  name: string;
  category: string;
  year: number;
  description: string | null;
  source: string | null;
  values: Record<string, number | null>;
  min: number;
  max: number;
};

type IndicatorsState = {
  status: "loading" | "ready" | "error";
  indicators: Indicator[];
  selected: Indicator | null;
  select: (name: string) => void;
  hoveredRegion: string | null;
  setHoveredRegion: (region: string | null) => void;
  layer: "heatmap" | "outline";
  setLayer: (layer: "heatmap" | "outline") => void;
};

const IndicatorsContext = createContext<IndicatorsState | null>(null);

export function useIndicators() {
  const state = use(IndicatorsContext);
  if (!state) throw new Error("useIndicators must be used inside <IndicatorsProvider>");
  return state;
}

function groupByIndicator(rows: StatisticRow[]): Indicator[] {
  const byName = new Map<string, Indicator>();
  for (const row of rows) {
    const indicator =
      byName.get(row.indicator) ??
      ({
        name: row.indicator,
        category: row.category,
        year: row.year,
        description: row.description,
        source: row.source,
        values: {},
        min: Infinity,
        max: -Infinity,
      } satisfies Indicator);
    indicator.values[row.region] = row.value;
    if (row.value !== null) {
      indicator.min = Math.min(indicator.min, row.value);
      indicator.max = Math.max(indicator.max, row.value);
    }
    byName.set(row.indicator, indicator);
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "pl"));
}

const defaultIndicator = "Beneficjenci pomocy społecznej";

export function IndicatorsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<IndicatorsState["status"]>("loading");
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [layer, setLayer] = useState<IndicatorsState["layer"]>("heatmap");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/regional-statistics", { signal: controller.signal })
      .then((response) => response.json())
      .then((body: { success: boolean; data?: StatisticRow[] }) => {
        if (!body.success || !body.data) throw new Error("Statistics request failed");
        const grouped = groupByIndicator(body.data);
        setIndicators(grouped);
        setSelectedName(grouped.find((indicator) => indicator.name === defaultIndicator)?.name ?? grouped[0]?.name ?? null);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setStatus("error");
        }
      });
    return () => controller.abort();
  }, []);

  const selected = useMemo(
    () => indicators.find((indicator) => indicator.name === selectedName) ?? null,
    [indicators, selectedName],
  );

  return (
    <IndicatorsContext
      value={{
        status,
        indicators,
        selected,
        select: setSelectedName,
        hoveredRegion,
        setHoveredRegion,
        layer,
        setLayer,
      }}
    >
      {children}
    </IndicatorsContext>
  );
}

export function formatValue(value: number | null | undefined) {
  if (value === null || value === undefined) return "brak danych";
  return value.toLocaleString("pl-PL", { maximumFractionDigits: 2 });
}

// "powiat m. Kraków" -> "Kraków", "powiat bocheński" -> "bocheński".
export function shortRegionName(region: string) {
  return region.replace(/^powiat (m\. )?/, "");
}
