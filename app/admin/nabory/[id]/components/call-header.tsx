"use client";

import { callPhase, callPhaseLabels, formatAmount, formatCallPeriod } from "@/lib/grants/format";
import { useLoadedCall } from "./call-details-provider";

const labelClass = "text-caption font-medium tracking-label-sm text-primary uppercase";

// The call's name, period, amount, sections and criteria.
export function CallHeader() {
  const call = useLoadedCall();
  const phase = callPhase(call);

  return (
    <section className="flex flex-col gap-7.5 border-b border-line pb-10" aria-labelledby="call-title">
      <div className="flex flex-col gap-2.5">
        <p className={labelClass}>
          Nabór · {callPhaseLabels[phase]} · {formatCallPeriod(call)}
        </p>
        <h1 id="call-title" className="max-w-[40ch] font-heading text-title text-ink">
          {call.title}
        </h1>
        {call.description && <p className="max-w-[70ch]">{call.description}</p>}
      </div>
      <dl className="m-0 grid grid-cols-1 gap-7.5 border-t border-line pt-7.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-2.5">
          <dt className={labelClass}>Dofinansowanie</dt>
          <dd className="m-0 text-subtitle font-light">{call.maxAmount ? `do ${formatAmount(call.maxAmount)}` : "nie określono"}</dd>
        </div>
        <div className="flex flex-col gap-2.5">
          <dt className={labelClass}>Sekcje wniosku</dt>
          <dd className="m-0">
            <ol className="m-0 grid list-inside list-decimal grid-cols-1 gap-x-7.5 gap-y-2.5 p-0 sm:grid-cols-2">
              {call.sections.map((section) => <li key={section.key}>{section.label}</li>)}
            </ol>
          </dd>
        </div>
        {call.criteria && (
          <div className="flex flex-col gap-5 border-t border-line pt-7.5 lg:col-span-2">
            <dt className={labelClass}>Kryteria oceny</dt>
            <dd className="m-0 max-w-[70ch] whitespace-pre-wrap">{call.criteria}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
