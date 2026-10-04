"use client";

import { ideaStageLabels } from "@/shared/components/idea-stage";
import { RiskBadge } from "../../components/risk-level";
import { useLoadedSubmission } from "./submission-details-provider";

const labelClass = "text-caption font-medium tracking-label-sm uppercase";

// The AI write-up of the conversation (title, summary, category, target group,
// risk reasoning), generated on the server right after the submission is saved.
export function SubmissionSummary() {
  const { submission } = useLoadedSubmission();

  return (
    <section className="flex flex-col gap-5 border-b border-line pb-7.5" aria-labelledby="summary-title">
      <div className="flex flex-col gap-1">
        <h2 id="summary-title" className="text-subtitle font-light">
          Podsumowanie
        </h2>
        <p className="text-caption">Przygotowane przez AI na podstawie rozmowy. Pełny zapis poniżej.</p>
      </div>
      <p className="max-w-[60ch] whitespace-pre-wrap">{submission.summary}</p>
      <dl className="m-0 grid max-w-[60ch] grid-cols-[auto_1fr] gap-x-7.5 gap-y-2.5 max-sm:grid-cols-1 max-sm:gap-y-1">
        <dt className={labelClass}>Kogo dotyczy</dt>
        <dd className="m-0 max-sm:mb-2.5">{submission.targetGroup ?? <span className="text-muted">nie wynika z rozmowy</span>}</dd>
        {submission.essence && (
          <>
            <dt className={labelClass}>Istota pomysłu</dt>
            <dd className="m-0 max-sm:mb-2.5">{submission.essence}</dd>
          </>
        )}
        {submission.stage && (
          <>
            <dt className={labelClass}>Etap</dt>
            <dd className="m-0 max-sm:mb-2.5">{ideaStageLabels[submission.stage]}</dd>
          </>
        )}
        {submission.peopleAffected !== null && (
          <>
            <dt className={labelClass}>Liczba osób</dt>
            <dd className="m-0 max-sm:mb-2.5">{submission.peopleAffected}</dd>
          </>
        )}
        {submission.riskReasoning && (
          <>
            <dt className={labelClass}>Ocena ryzyka</dt>
            <dd className="m-0">
              <RiskBadge item={submission} />
              <p className="mt-1">{submission.riskReasoning}</p>
            </dd>
          </>
        )}
      </dl>
    </section>
  );
}
