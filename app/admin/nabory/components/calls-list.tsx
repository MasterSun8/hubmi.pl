"use client";

import Link from "next/link";
import { callPhase, callPhaseLabels, formatAmount, formatCallPeriod } from "@/lib/grants/format";
import { plural } from "../../zgloszenia/components/submissions-provider";
import { useGrantCalls } from "./grant-calls-provider";

// Every call as a card; the whole card opens its applications.
export function CallsList() {
  const { calls } = useGrantCalls();

  if (calls.length === 0) {
    return <p className="py-5">Nie ma jeszcze żadnego naboru. Dodaj pierwszy, a autorzy pomysłów zobaczą go na kanwie.</p>;
  }

  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 p-0">
      {calls.map((call) => {
        const phase = callPhase(call);
        return (
          <li key={call.id} className="relative flex flex-col gap-2.5 border border-line bg-surface p-5">
            <p className={`text-caption font-medium tracking-label-sm uppercase ${phase === "open" ? "text-primary" : "text-muted"}`}>
              {callPhaseLabels[phase]} · {formatCallPeriod(call)}
            </p>
            <Link href={`/admin/nabory/${call.id}`} className="text-card-title font-light text-ink no-underline after:absolute after:inset-0">
              {call.title}
            </Link>
            {call.description && <p className="line-clamp-3">{call.description}</p>}
            <dl className="m-0 mt-auto flex flex-col gap-1 text-caption">
              <div>
                <dt className="inline font-medium">Kwota: </dt>
                <dd className="inline">{call.maxAmount ? `do ${formatAmount(call.maxAmount)}` : "nie określono"}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Sekcje wniosku: </dt>
                <dd className="inline">{call.sections.map((section) => section.label).join(", ")}</dd>
              </div>
              <div>
                <dt className="inline font-medium">Złożono: </dt>
                <dd className="inline">
                  {call.submittedApplications} {plural(call.submittedApplications, "wniosek", "wnioski", "wniosków")}
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
