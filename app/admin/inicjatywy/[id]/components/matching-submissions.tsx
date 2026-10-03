"use client";

import Link from "next/link";
import { statusLabels, submissionNumber, typeLabels, type SubmissionStatus } from "../../../zgloszenia/components/submissions-provider";
import { useLoadedInitiative } from "./initiative-provider";

// Matchmaking seen from the innovation: submissions that have it among their closest matches.
export function MatchingSubmissions() {
  const { matchingSubmissions } = useLoadedInitiative();

  return (
    <section className="flex flex-col gap-5 border-y border-line py-5" aria-labelledby="matches-title">
      <div className="flex flex-col gap-1">
        <h2 id="matches-title" className="text-subtitle font-light">
          Pasujące zgłoszenia
        </h2>
        <p className="text-caption">Zgłoszenia mieszkańców, którym AI proponuje tę innowację.</p>
      </div>
      {matchingSubmissions.length === 0 ? (
        <p className="text-muted">Żadne zgłoszenie nie pasuje jeszcze do tej innowacji.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {matchingSubmissions.map((item) => (
            <li key={item.id} className="relative border-t border-line/60 py-2.5 first:border-t-0 first:pt-0">
              <Link href={`/admin/zgloszenia/${item.id}`} className="font-medium text-ink no-underline after:absolute after:inset-0">
                {item.title}
              </Link>
              <p className="text-caption">
                {submissionNumber(item.id)} · {typeLabels[item.type]} · {item.location} ·{" "}
                {statusLabels[item.status as SubmissionStatus] ?? item.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
