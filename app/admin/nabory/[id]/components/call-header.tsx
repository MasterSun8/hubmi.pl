"use client";

import { callPhase, callPhaseLabels, formatAmount, formatCallPeriod } from "@/lib/grants/format";
import { useLoadedCall } from "./call-details-provider";

const labelClass = "text-caption font-medium tracking-label-sm uppercase";

// The call's name, period, amount, sections and criteria.
export function CallHeader() {
  const call = useLoadedCall();
  const phase = callPhase(call);

  return (
    <section className="flex flex-col gap-5 border-b border-line pb-7.5" aria-labelledby="call-title">
      <div className="flex flex-col gap-2.5">
        <p className={`${labelClass} ${phase === "open" ? "text-primary" : "text-muted"}`}>
          Nabór · {callPhaseLabels[phase]} · {formatCallPeriod(call)}
        </p>
        <h1 id="call-title" className="font-heading text-section text-primary">
          {call.title}
        </h1>
        {call.description && <p className="max-w-[70ch]">{call.description}</p>}
      </div>
      <dl className="m-0 grid max-w-[70ch] grid-cols-[auto_1fr] gap-x-7.5 gap-y-2.5 max-sm:grid-cols-1 max-sm:gap-y-1">
        <dt className={labelClass}>Kwota</dt>
        <dd className="m-0 max-sm:mb-2.5">{call.maxAmount ? `do ${formatAmount(call.maxAmount)}` : "nie określono"}</dd>
        <dt className={labelClass}>Sekcje wniosku</dt>
        <dd className="m-0 max-sm:mb-2.5">{call.sections.map((section) => section.label).join(", ")}</dd>
        {call.criteria && (
          <>
            <dt className={labelClass}>Kryteria</dt>
            <dd className="m-0 whitespace-pre-wrap">{call.criteria}</dd>
          </>
        )}
      </dl>
    </section>
  );
}
