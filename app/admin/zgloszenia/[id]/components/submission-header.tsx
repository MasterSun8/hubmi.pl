"use client";

import type { ReactNode } from "react";
import { LocationLabel } from "../../components/location-label";
import { RiskBadge } from "../../components/risk-level";
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

  return (
    <div className="flex flex-col gap-7.5">
      <div className="flex flex-col gap-2.5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
          Zgłoszenie {submissionNumber(submission.id)} / {typeLabels[submission.type]}
        </p>
        <h1 className="font-heading text-title text-ink">{submission.title}</h1>
      </div>

      {/* One row of labelled facts with the main action on the right. */}
      <div className="flex flex-wrap items-center justify-between gap-7.5 border border-line bg-surface p-7.5 max-sm:p-5">
        <dl className="m-0 grid min-w-0 flex-1 grid-cols-2 gap-x-7.5 gap-y-5 sm:grid-cols-3 3xl:grid-cols-5">
          <Fact label="Status">
            <StatusSelect />
          </Fact>
          <Fact label="Ryzyko">
            <RiskBadge item={submission} />
          </Fact>
          <Fact label="Lokalizacja">
            <LocationLabel location={submission.location} />
          </Fact>
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
      <dt className="text-caption font-medium tracking-label-sm text-primary uppercase">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}
