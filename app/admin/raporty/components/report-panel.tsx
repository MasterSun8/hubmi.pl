"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { countyTitle } from "@/lib/geo/county-names";
import { ReportMarkdown } from "./report-markdown";
import { useReports } from "./reports-provider";

const actionClass =
  "inline-flex cursor-pointer items-center gap-2.5 border-0 bg-primary px-7.5 py-3.5 text-cta font-medium tracking-label text-on-primary uppercase disabled:cursor-progress";
const secondaryClass =
  "cursor-pointer border border-primary bg-transparent px-5 py-2.5 text-caption font-medium tracking-label-sm text-primary uppercase";

const steps = [
  "Zbieram zgłoszenia mieszkańców…",
  "Zestawiam je ze wskaźnikami GUS…",
  "Szukam powiązań i trendów…",
  "Piszę wnioski i rekomendacje…",
];

const ease = [0.5, 0, 0.2, 1] as const;

const regionLabel = (region: string | null) => (region ? countyTitle(region) : "Cała Małopolska");

// What AI is doing right now; the steps rotate while the request runs (it takes 10–30 s).
function GeneratingState({ region }: { region: string | null }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, steps.length - 1)), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      key="generating"
      className="flex flex-col gap-5 border border-primary bg-surface p-7.5 max-sm:p-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2.5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
          Asystent analizuje · {regionLabel(region)}
        </p>
        <div className="relative h-1 w-full overflow-hidden bg-line/30" aria-hidden="true">
          <span className="absolute inset-y-0 left-0 w-2/5 animate-progress bg-primary motion-reduce:animate-none" />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease }}
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
      </div>
      {/* Skeleton of the coming report, so the page does not jump when it arrives. */}
      <div className="flex flex-col gap-3" aria-hidden="true">
        {["w-1/3", "w-full", "w-11/12", "w-4/5", "w-1/4", "w-full", "w-2/3"].map((width, index) => (
          <span
            key={index}
            className={`h-3 ${width} animate-typing-fade bg-line/40 motion-reduce:animate-none ${index === 0 || index === 4 ? "h-5" : ""}`}
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

const timeFormat = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" });

// "Raport AI": the generate button, the animation while AI writes and the report itself.
export function ReportPanel() {
  const { report, generateReport, selectedCounty } = useReports();
  const generating = report.status === "generating";
  const staleRegion = report.status === "ready" && report.region !== selectedCounty;

  return (
    <section className="flex flex-col gap-5 border-t border-line pt-7.5" aria-labelledby="report-title">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex max-w-[60ch] flex-col gap-1">
          <h2 id="report-title" className="font-heading text-title text-primary">
            Raport AI
          </h2>
          <p>
            Asystent zestawia zgłoszenia mieszkańców ze wskaźnikami GUS i pisze wnioski z rekomendacjami dla ROPS. Zakres:{" "}
            <span className="font-medium">{regionLabel(selectedCounty)}</span>.
          </p>
        </div>
        <button type="button" className={actionClass} onClick={() => void generateReport()} disabled={generating} aria-busy={generating}>
          {generating ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent motion-reduce:animate-none" aria-hidden="true" />
              Generuję…
            </>
          ) : report.status === "ready" && !staleRegion ? (
            "Wygeneruj ponownie"
          ) : (
            "Wygeneruj raport"
          )}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {report.status === "generating" && <GeneratingState key="generating" region={report.region} />}

        {report.status === "error" && (
          <motion.p key="error" role="alert" className="text-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {report.message}
          </motion.p>
        )}

        {report.status === "ready" && (
          <motion.article
            key={`report-${report.generatedAt.getTime()}`}
            className="flex flex-col gap-5 border border-line bg-surface p-7.5 max-sm:p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            aria-labelledby="report-heading"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2.5 border-b border-line pb-5">
              <div className="flex flex-col gap-1">
                <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
                  Synteza analityczna · {regionLabel(report.region)}
                </p>
                <p id="report-heading" className="text-caption text-muted">
                  Wygenerowano o {timeFormat.format(report.generatedAt)}. Wnioski AI wymagają weryfikacji.
                </p>
              </div>
              <button type="button" className={secondaryClass} onClick={() => window.print()}>
                Drukuj / PDF
              </button>
            </div>
            {staleRegion && (
              <p className="text-caption">
                Raport dotyczy obszaru: {regionLabel(report.region)}. Kliknij „Wygeneruj raport”, aby przygotować go dla
                obecnego wyboru.
              </p>
            )}
            <ReportMarkdown>{report.markdown}</ReportMarkdown>
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}
