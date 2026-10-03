"use client";

import Link from "next/link";
import { statusLabels, submissionNumber } from "../../zgloszenia/components/submissions-provider";
import { useInitiatives } from "./initiatives-provider";

// Residents' ideas shown as short cards ("fiszki"): what it is, for whom, where.
export function IdeasList() {
  const { ideas, status } = useInitiatives();

  if (status === "ready" && ideas.length === 0) {
    return <p className="py-5">Nikt nie zgłosił jeszcze pomysłu przez „Zaoferuj pomoc”.</p>;
  }

  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 p-0">
      {ideas.map((idea) => (
        <li key={idea.id} className="relative flex flex-col gap-2.5 border border-line bg-surface p-5">
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
            Pomysł {submissionNumber(idea.id)} · {statusLabels[idea.status]}
          </p>
          <Link href={`/admin/zgloszenia/${idea.id}`} className="text-card-title font-light text-ink no-underline after:absolute after:inset-0">
            {idea.title}
          </Link>
          <p className="line-clamp-4">{idea.summary}</p>
          <dl className="m-0 mt-auto flex flex-col gap-1 text-caption">
            {idea.targetGroup && (
              <div>
                <dt className="inline font-medium">Dla kogo: </dt>
                <dd className="inline">{idea.targetGroup}</dd>
              </div>
            )}
            <div>
              <dt className="inline font-medium">Gdzie: </dt>
              <dd className="inline">{idea.location}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
