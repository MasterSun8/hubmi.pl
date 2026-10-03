"use client";

import { useState } from "react";
import { statusLabels, type SubmissionStatus } from "../../components/submissions-provider";
import { useLoadedSubmission, useUpdateStatus } from "./submission-details-provider";

// Figma 16:1556 ("Nowe ⌄") — the status can be changed, and resolving has its own button.
export function StatusSelect() {
  const { submission } = useLoadedSubmission();
  const { saving, error, change } = useStatusChange();

  return (
    <div className="flex flex-col">
      <label className="relative flex items-center">
        <span className="sr-only">Status zgłoszenia</span>
        <select
          value={submission.status}
          disabled={saving}
          onChange={(event) => change(event.target.value as SubmissionStatus)}
          className={`field-sizing-content appearance-none bg-transparent pr-5 font-medium focus:outline-none focus-visible:underline disabled:opacity-50 ${
            submission.status === "new" ? "text-primary" : "text-ink"
          }`}
        >
          {(Object.keys(statusLabels) as SubmissionStatus[]).map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 12 12" fill="none" className="pointer-events-none absolute right-0 size-3" aria-hidden="true">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </label>
      {error && (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function ResolveButton() {
  const { submission } = useLoadedSubmission();
  const { saving, error, change } = useStatusChange();

  if (submission.status === "resolved") {
    return (
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <p className="font-medium">Zgłoszenie rozwiązane</p>
        <button
          type="button"
          onClick={() => change("in_progress")}
          disabled={saving}
          className="border-0 bg-transparent p-0 text-caption font-medium tracking-label-sm text-primary uppercase disabled:opacity-50"
        >
          Przywróć do obsługi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1 max-sm:items-start">
      <button
        type="button"
        onClick={() => change("resolved")}
        disabled={saving}
        className="inline-flex h-10 items-center gap-2.5 rounded-input border border-primary bg-primary px-5 text-caption font-medium tracking-label-sm text-on-primary uppercase transition-opacity disabled:opacity-50"
      >
        <svg viewBox="0 0 16 16" fill="none" className="size-4" aria-hidden="true">
          <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {saving ? "Zapisywanie…" : "Oznacz jako rozwiązane"}
      </button>
      {error && (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}

function useStatusChange() {
  const updateStatus = useUpdateStatus();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(status: SubmissionStatus) {
    setSaving(true);
    setError(await updateStatus(status));
    setSaving(false);
  }

  return { saving, error, change };
}
