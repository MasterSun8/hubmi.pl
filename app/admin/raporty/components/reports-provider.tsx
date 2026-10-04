"use client";

import { createContext, use, useMemo, useState, type ReactNode } from "react";
import { countyOfLocation } from "@/lib/geo/county-of-location";
import type { RegionStat, TrendsData } from "@/lib/server/reports";

export type CountyTrend = {
  total: number;
  categories: Record<string, number>;
  // Average AI Score of the county's submissions (0–100), null when none were scored.
  avgScore: number | null;
  locations: string[];
};

export type ReportState =
  | { status: "idle" }
  | { status: "generating"; region: string | null }
  | { status: "ready"; region: string | null; markdown: string; generatedAt: Date }
  | { status: "error"; region: string | null; message: string };

type ReportsState = {
  byCounty: Record<string, CountyTrend>;
  // The whole region, including submissions whose town could not be matched to a county.
  overall: CountyTrend;
  unassigned: CountyTrend;
  maxCountyTotal: number;
  statsFor: (county: string) => RegionStat[];
  selectedCounty: string | null;
  toggleCounty: (county: string) => void;
  clearCounty: () => void;
  hoveredCounty: string | null;
  setHoveredCounty: (county: string | null) => void;
  report: ReportState;
  generateReport: () => Promise<void>;
};

const ReportsContext = createContext<ReportsState | null>(null);

export function useReports() {
  const state = use(ReportsContext);
  if (!state) throw new Error("useReports must be used inside <ReportsProvider>");
  return state;
}

const emptyTrend = (): CountyTrend & { scoreSum: number } => ({
  total: 0,
  categories: {},
  avgScore: null,
  locations: [],
  scoreSum: 0,
});

// Groups the per-town trends from GET /api/reports/trends into counties for the map.
function groupByCounty(data: TrendsData) {
  const counties: Record<string, ReturnType<typeof emptyTrend>> = {};
  const overall = emptyTrend();
  const unassigned = emptyTrend();

  for (const [location, trend] of Object.entries(data.trends)) {
    const county = countyOfLocation(location);
    const targets = [overall, county ? (counties[county] ??= emptyTrend()) : unassigned];
    for (const target of targets) {
      target.total += trend.total;
      target.scoreSum += trend.avgScore * trend.total;
      target.locations.push(location);
      for (const [category, count] of Object.entries(trend.categories)) {
        target.categories[category] = (target.categories[category] ?? 0) + count;
      }
    }
  }

  const finish = ({ scoreSum, ...trend }: ReturnType<typeof emptyTrend>): CountyTrend => ({
    ...trend,
    avgScore: scoreSum > 0 && trend.total > 0 ? Math.round(scoreSum / trend.total) : null,
  });
  return {
    byCounty: Object.fromEntries(Object.entries(counties).map(([county, trend]) => [county, finish(trend)])),
    overall: finish(overall),
    unassigned: finish(unassigned),
  };
}

export function ReportsProvider({ data, children }: { data: TrendsData; children: ReactNode }) {
  const { byCounty, overall, unassigned } = useMemo(() => groupByCounty(data), [data]);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [report, setReport] = useState<ReportState>({ status: "idle" });

  async function generateReport() {
    const region = selectedCounty;
    setReport({ status: "generating", region });
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(region ? { region } : {}),
      });
      const body = (await response.json().catch(() => null)) as { success?: boolean; report?: string } | null;
      if (!response.ok || !body?.success || !body.report) throw new Error(`Report failed: ${response.status}`);
      setReport({ status: "ready", region, markdown: body.report, generatedAt: new Date() });
    } catch (error) {
      console.error(error);
      setReport({
        status: "error",
        region,
        message: "Nie udało się wygenerować raportu. Spróbuj ponownie za chwilę.",
      });
    }
  }

  return (
    <ReportsContext
      value={{
        byCounty,
        overall,
        unassigned,
        maxCountyTotal: Math.max(1, ...Object.values(byCounty).map((trend) => trend.total)),
        statsFor: (county) => data.contextStats[county.toLocaleLowerCase("pl")] ?? [],
        selectedCounty,
        toggleCounty: (county) => setSelectedCounty((current) => (current === county ? null : county)),
        clearCounty: () => setSelectedCounty(null),
        hoveredCounty,
        setHoveredCounty,
        report,
        generateReport,
      }}
    >
      {children}
    </ReportsContext>
  );
}

// "powiat m. Kraków" → "Kraków", "powiat proszowicki" → "proszowicki" (map labels).
export function shortCountyName(county: string) {
  return county.replace(/^powiat (m\. )?/, "");
}

// "powiat m. Kraków" → "Kraków", "powiat proszowicki" → "Powiat proszowicki" (headings).
export function countyTitle(county: string) {
  return county.startsWith("powiat m. ") ? shortCountyName(county) : `Powiat ${shortCountyName(county)}`;
}
