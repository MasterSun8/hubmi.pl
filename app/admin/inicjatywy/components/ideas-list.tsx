"use client";

import Link from "next/link";
import { IdeaStageBar, ideaStageLabels } from "@/shared/components/idea-stage";
import { CANVAS_FIELDS } from "@/types/canvas";
import { statusLabels, submissionNumber } from "../../zgloszenia/components/submissions-provider";
import { useInitiatives } from "./initiatives-provider";

const labelClass = "text-caption font-medium tracking-label-sm uppercase";

// Ideas as idea cards (fiszki): what it is, its essence, for whom, where, how far along,
// and how much of the innovation canvas the author filled in. The whole card opens the details.
export function IdeasList() {
  const { ideas, ideaResults, status } = useInitiatives();

  if (status === "ready" && ideas.length === 0) {
    return <p className="py-5">Nikt nie zgłosił jeszcze pomysłu przez „Zaoferuj pomoc”.</p>;
  }
  if (status === "ready" && ideaResults.length === 0) {
    return <p className="py-5">Żaden pomysł nie jest na tym etapie.</p>;
  }

  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5 p-0">
      {ideaResults.map((idea) => (
        <li key={idea.id} className="relative flex flex-col gap-4 border border-line bg-surface p-5">
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
            Pomysł {submissionNumber(idea.id)} · {statusLabels[idea.status]}
          </p>
          <Link href={`/admin/zgloszenia/${idea.id}`} className="text-card-title font-light text-ink no-underline after:absolute after:inset-0">
            {idea.title}
          </Link>
          <p className="line-clamp-3">{idea.summary}</p>
          <dl className="m-0 mt-auto flex flex-col gap-3">
            {idea.essence && (
              <div className="flex flex-col gap-1">
                <dt className={labelClass}>Istota</dt>
                <dd className="m-0 line-clamp-3">{idea.essence}</dd>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <dt className={labelClass}>Etap</dt>
              <dd className="m-0 flex flex-col gap-2">
                <span className={idea.stage ? "" : "text-muted"}>{idea.stage ? ideaStageLabels[idea.stage] : "nieokreślony"}</span>
                <IdeaStageBar stage={idea.stage ?? null} />
              </dd>
            </div>
            <div className="flex flex-col gap-1 text-caption">
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
              <div>
                <dt className="inline font-medium">Kanwa: </dt>
                <dd className={idea.canvasFilled ? "inline" : "inline text-muted"}>
                  {idea.canvasFilled ? `${idea.canvasFilled} z ${CANVAS_FIELDS.length} pól` : "nie wypełniono"}
                </dd>
              </div>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
