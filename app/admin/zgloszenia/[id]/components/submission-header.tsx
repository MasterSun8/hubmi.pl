"use client";

import { statusLabels, submissionNumber, typeLabels } from "../../components/submissions-provider";
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
    <div className="flex flex-col gap-5">
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
        Zgłoszenie {submissionNumber(submission.id)} / {typeLabels[submission.type]}
      </p>
      <h1 className="font-heading text-section text-primary">{submission.title}</h1>
      <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
        <p className={`font-medium ${submission.status === "new" ? "text-primary" : ""}`}>
          {statusLabels[submission.status]}
        </p>
        <p className="text-primary">AI Score: {score === null ? "brak oceny" : `${score} / 100`}</p>
        <p>
          {submission.location}
          {submission.category && ` · ${submission.category}`}
        </p>
        <p className="text-caption">{formatDateTime(submission.createdAt)}</p>
      </div>
    </div>
  );
}
