"use client";

import type { ReactNode } from "react";
import { submissionNumber, typeLabels } from "../../components/submissions-provider";
import { ResolveButton, StatusSelect } from "./status-control";
import { useLoadedSubmission } from "./submission-details-provider";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Figma 16:1553–16:1559 — reference, title and the metadata line.
export function SubmissionHeader() {
  const { submission } = useLoadedSubmission();
  const score = submission.priorityOverride ?? submission.aiScore;

  return (
    <div className="flex flex-col gap-7.5">
      <div className="flex flex-col gap-2.5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
          Zgłoszenie {submissionNumber(submission.id)} / {typeLabels[submission.type]}
        </p>
        <h1 className="font-heading text-section text-primary">{submission.title}</h1>
      </div>

      {/* One row of labelled facts with the main action on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-5 border-y border-line py-5">
        <dl className="m-0 flex flex-wrap gap-x-10 gap-y-5">
          <Fact label="Status">
            <StatusSelect />
          </Fact>
          <Fact label="AI Score">
            {score === null ? <span className="text-muted">brak oceny</span> : <span className="text-primary">{score} / 100</span>}
          </Fact>
          <Fact label="Lokalizacja">{submission.location}</Fact>
          <Fact label="Kategoria">{submission.category ?? <span className="text-muted">nieprzypisana</span>}</Fact>
          <Fact label="Data">{formatDateTime(submission.createdAt)}</Fact>
        </dl>
        <ResolveButton />
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-caption font-medium tracking-label-sm text-muted uppercase">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}
