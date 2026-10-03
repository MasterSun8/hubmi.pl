"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLoadedSubmission } from "./submission-details-provider";

type Match = { id: string; title: string; description: string; sourceUrl: string | null };

// Matchmaking seen from the submission: the closest published innovations (GET /api/submissions/[id]/matches).
export function MatchingSolutions() {
  const { submission } = useLoadedSubmission();
  const [matches, setMatches] = useState<Match[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/submissions/${submission.id}/matches`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<{ data: Match[] }>) : { data: [] }))
      .then((body) => setMatches(body.data))
      .catch(() => {
        if (!controller.signal.aborted) setMatches([]);
      });
    return () => controller.abort();
  }, [submission.id]);

  return (
    <section className="flex flex-col gap-5 border-b border-line pb-7.5" aria-labelledby="solutions-title">
      <div className="flex flex-col gap-1">
        <h2 id="solutions-title" className="text-subtitle font-light">
          Pasujące innowacje
        </h2>
        <p className="text-caption">Sprawdzone rozwiązania z Biblioteki ROPS, które AI dopasowało do tego zgłoszenia.</p>
      </div>
      {matches === null ? (
        <p aria-live="polite">Szukanie dopasowań…</p>
      ) : matches.length === 0 ? (
        <p className="text-muted">Brak dopasowań. Zgłoszenie mogło jeszcze nie zostać przetworzone przez AI.</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5 p-0">
          {matches.map((match) => (
            <li key={match.id} className="relative flex flex-col gap-2.5 border border-line bg-surface p-5">
              <Link href={`/admin/inicjatywy/${match.id}`} className="text-lead font-light text-ink no-underline after:absolute after:inset-0">
                {match.title}
              </Link>
              <p className="line-clamp-3 text-caption">{match.description}</p>
              <span className="mt-auto text-caption font-medium tracking-label-sm text-primary uppercase" aria-hidden="true">
                Zobacz innowację →
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
