"use client";

import { useApplication, type DraftState, type SaveState } from "./application-provider";

const actionClass =
  "cursor-pointer border border-primary bg-transparent px-5 py-2.5 text-caption font-medium tracking-label-sm text-primary uppercase disabled:opacity-50";

const saveLabels: Record<SaveState, string> = {
  idle: "Zmiany zapisują się automatycznie",
  saving: "Zapisuję…",
  saved: "Zapisano szkic",
  error: "Nie udało się zapisać. Sprawdź połączenie i edytuj dalej, spróbuję ponownie.",
};

const draftLabels: Record<DraftState, string> = {
  idle: "",
  drafting: "Asystent pisze wniosek na podstawie Twojej kanwy i rozmowy. To potrwa kilka sekund…",
  done: "Asystent uzupełnił puste sekcje. Uzupełnij miejsca oznaczone [uzupełnij: …] i popraw resztę po swojemu.",
  "nothing-new": "Wszystkie sekcje mają już treść. Asystent niczego nie nadpisuje.",
  error: "Nie udało się przygotować wniosku. Spróbuj ponownie albo napisz sekcje samodzielnie.",
};

// Actions above the sections while the application is a draft.
export function ApplicationToolbar() {
  const { saveState, draftState, fillWithAi, submitted } = useApplication();

  return (
    <div className="flex flex-col gap-2.5 print:hidden">
      <div className="flex flex-wrap items-center gap-2.5">
        {!submitted && (
          <button type="button" className={actionClass} onClick={() => void fillWithAi()} disabled={draftState === "drafting"}>
            Uzupełnij puste sekcje z kanwy
          </button>
        )}
        <button type="button" className={actionClass} onClick={() => window.print()}>
          Pobierz PDF
        </button>
        {!submitted && (
          <p className={`text-caption ${saveState === "error" ? "text-error" : "text-muted"}`} aria-live="polite">
            {saveLabels[saveState]}
          </p>
        )}
      </div>
      {!submitted && (
        <p className={`min-h-[1lh] text-caption ${draftState === "error" ? "text-error" : ""}`} aria-live="polite">
          {draftLabels[draftState]}
        </p>
      )}
    </div>
  );
}
