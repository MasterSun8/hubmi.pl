"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { MAP_HEIGHT, MAP_WIDTH, counties } from "@/lib/geo/malopolska-counties";

const scale = [
  { at: 0, color: "var(--color-secondary)" },
  { at: 0.35, color: "var(--color-success)" },
  { at: 0.65, color: "var(--color-warning)" },
  { at: 1, color: "var(--color-error)" },
];

function colorForValue(value: number, max: number) {
  if (value === 0 || max === 0) return "var(--color-surface)";
  const t = value / max;
  const upper = scale.findIndex((stop) => stop.at >= t);
  if (upper <= 0) return scale[0].color;
  const from = scale[upper - 1];
  const to = scale[upper];
  const share = ((t - from.at) / (to.at - from.at)) * 100;
  return `color-mix(in oklab, ${to.color} ${share.toFixed(1)}%, ${from.color})`;
}

export function ReportsDashboard({ initialData }: { initialData: any }) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setReport(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRegion ? { region: selectedRegion } : {}),
      }).then(r => r.json());
      
      if (res.success) {
        setReport(res.report);
      } else {
        alert("Błąd generowania: " + res.error);
      }
    } catch (e) {
      alert("Błąd: " + String(e));
    } finally {
      setGenerating(false);
    }
  };

  const maxSubmissions = Math.max(
    ...Object.values(initialData?.trends || {}).map((t: any) => t.total),
    1
  );

  const activeTrend = selectedRegion ? initialData?.trends[selectedRegion.toLowerCase()] : null;
  const activeStats = selectedRegion ? initialData?.contextStats[selectedRegion.toLowerCase()] : null;

  return (
    <div className="flex flex-col gap-7.5">
      <div className="flex justify-between items-end">
        <h1 className="font-heading text-display text-primary">Raporty i Trendy (AI)</h1>
        <button 
          className="bg-primary text-white px-5 py-2.5 rounded-full font-medium cursor-pointer disabled:opacity-50"
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? "Analizowanie (AI)..." : "Generuj raport tekstowy"}
        </button>
      </div>
      
      <p className="max-w-[80ch]">
        Zestawienie zgłoszeń od mieszkańców (miękkie potrzeby) z twardymi wskaźnikami z Obserwatora ROPS. 
        Wybierz powiat na mapie, aby przeanalizować region, a następnie kliknij wygeneruj, aby Asystent przygotował syntezę.
      </p>

      <div className="grid grid-cols-[minmax(0,860px)_minmax(300px,400px)] items-start gap-7.5 max-xl:grid-cols-1">
        {/* MAPA */}
        <figure className="m-0 flex flex-col gap-2.5">
          <svg
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="h-auto max-h-137.5 w-full"
            role="group"
          >
            {counties.map((county) => {
              const countyData = initialData?.trends[county.name.toLowerCase()];
              const total = countyData ? countyData.total : 0;
              const isSelected = selectedRegion === county.name;

              return (
                <path
                  key={county.name}
                  d={county.path}
                  onClick={() => setSelectedRegion(isSelected ? null : county.name)}
                  style={{ fill: colorForValue(total, maxSubmissions) }}
                  className={`cursor-pointer transition-[fill,stroke] duration-300 outline-none ${
                    isSelected ? "stroke-ink stroke-2" : "stroke-ink/60 stroke-1"
                  } hover:stroke-ink`}
                  strokeLinejoin="round"
                >
                  <title>{`${county.name}: ${total} zgłoszeń`}</title>
                </path>
              );
            })}
          </svg>
          <figcaption className="text-caption">
            Natężenie zgłoszeń mieszkańców w poszczególnych powiatach. Kliknij, aby wyfiltrować dane.
          </figcaption>
        </figure>

        {/* SIDEBAR DANYCH */}
        <aside className="bg-surface p-5 rounded-lg border border-line flex flex-col gap-5">
          <h2 className="text-body font-semibold">
            {selectedRegion ? `Analiza: ${selectedRegion}` : "Analiza: Cała Małopolska"}
          </h2>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-caption font-bold uppercase text-muted">Zgłoszenia (Czaty)</h3>
            {activeTrend ? (
              <>
                <p><strong>Liczba zgłoszeń:</strong> {activeTrend.total}</p>
                <p><strong>Średnia pilność AI:</strong> {activeTrend.avgScore}/10</p>
                <div className="mt-2 text-sm">
                  {Object.entries(activeTrend.categories).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between border-b border-line pb-1 mb-1">
                      <span>{cat}</span>
                      <span className="font-semibold">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Brak zgłoszeń w tym regionie (lub nie wybrano regionu).</p>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <h3 className="text-caption font-bold uppercase text-muted">Statystyki GUS (Obserwator)</h3>
            {activeStats ? (
              <ul className="text-sm flex flex-col gap-2">
                {activeStats.map((stat: any, idx: number) => (
                  <li key={idx} className="border-b border-line pb-1">
                    <span className="block text-muted">{stat.indicator}</span>
                    <span className="font-semibold">{stat.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Wybierz powiat, aby zobaczyć twarde dane z Obserwatora.</p>
            )}
          </div>
        </aside>
      </div>

      {/* RAPORT AI WYNIK */}
      {report && (
        <div className="mt-10 bg-white border border-primary p-7 rounded-xl shadow-sm prose max-w-none">
          <h2 className="text-primary border-b border-line pb-2 mb-4">Synteza Analityczna (Raport AI)</h2>
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
