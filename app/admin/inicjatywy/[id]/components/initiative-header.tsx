"use client";

import { useState, type ReactNode } from "react";
import { solutionStatusLabels, type SolutionStatus } from "../../components/initiatives-provider";
import { plural } from "../../../zgloszenia/components/submissions-provider";
import { useLoadedInitiative, useUpdateInitiativeStatus } from "./initiative-provider";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-caption font-medium tracking-label-sm text-primary uppercase">{label}</dt>
      <dd className="m-0 flex min-h-11 items-center">{children}</dd>
    </div>
  );
}

// Same layout as the submission details header: title, then a labelled facts row with the action.
export function InitiativeHeader() {
  const initiative = useLoadedInitiative();
  const updateStatus = useUpdateInitiativeStatus();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matches = initiative.matchingSubmissions.length;

  async function change(status: SolutionStatus) {
    setSaving(true);
    setError(await updateStatus(status));
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-7.5">
      <div className="flex flex-col gap-2.5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
          {initiative.sourceName || "Biblioteka innowacji ROPS"}
        </p>
        <h1 className="max-w-[40ch] font-heading text-title text-ink">{initiative.title}</h1>
      </div>

      <div className="flex flex-col items-start gap-5 border-y border-line py-7.5">
        <dl className="m-0 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-[160px_140px_minmax(0,1fr)]">
          <Fact label="Status">
            <label className="relative flex items-center">
              <span className="sr-only">Status innowacji</span>
              <select
                value={initiative.status}
                disabled={saving}
                onChange={(event) => change(event.target.value as SolutionStatus)}
                className="min-h-11 appearance-none rounded-input border border-field bg-surface py-2 pr-10 pl-4 font-medium text-ink disabled:opacity-50"
              >
                {(Object.keys(solutionStatusLabels) as SolutionStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {solutionStatusLabels[status]}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-4 size-3" aria-hidden="true">
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </label>
          </Fact>
          <Fact label="Dopasowania">
            {matches > 0 ? (
              <span className="text-primary">
                {matches} {plural(matches, "zgłoszenie", "zgłoszenia", "zgłoszeń")}
              </span>
            ) : (
              <span className="text-muted">brak</span>
            )}
          </Fact>
          {(initiative.organization || initiative.authorName) && (
            <Fact label="Autor">{initiative.organization ?? initiative.authorName}</Fact>
          )}
          {initiative.programName && <Fact label="Program">{initiative.programName}</Fact>}
        </dl>
        <p className="text-caption text-muted">
          {initiative.status === "published"
            ? "Opublikowana: asystent może proponować ją mieszkańcom."
            : "Nieopublikowana: asystent nie proponuje jej mieszkańcom."}
        </p>
        {initiative.sourceUrl && (
          <a
            href={initiative.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-input border border-primary px-5 text-caption font-medium tracking-label-sm text-primary uppercase no-underline"
          >
            Zobacz w Bibliotece ROPS <span aria-hidden="true">&nbsp;↗</span>
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
          </a>
        )}
      </div>
      {error && (
        <p role="alert" className="-mt-5 text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
