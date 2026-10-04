"use client";

import { formatAmount, formatCallDeadline } from "@/lib/grants/format";
import { useApplication } from "./application-provider";

// Which call the application is for: name, deadline, amount and the evaluation criteria.
export function CallSummary() {
  const { call, submitted } = useApplication();
  if (!call) return null;

  return (
    <section className="flex flex-col gap-2.5 border border-line bg-surface p-7.5 max-sm:p-5 print:border-0 print:p-0" aria-labelledby="call-title">
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
        Nabór · do {formatCallDeadline(call.endsOn)}
        {call.maxAmount ? ` · maksymalnie ${formatAmount(call.maxAmount)}` : ""}
      </p>
      <h2 id="call-title" className="text-card-title font-light">
        {call.title}
      </h2>
      {call.description && <p className="max-w-[70ch]">{call.description}</p>}
      {call.criteria && !submitted && (
        <details className="max-w-[70ch] print:hidden">
          <summary className="font-medium text-primary">Jak będzie oceniany wniosek</summary>
          <p className="whitespace-pre-wrap pt-2.5">{call.criteria}</p>
        </details>
      )}
    </section>
  );
}
