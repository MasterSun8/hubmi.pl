"use client";

import { useCanvas, type DraftState, type SaveState } from "./canvas-provider";

const actionClass =
  "cursor-pointer border border-primary bg-transparent px-5 py-2.5 text-caption font-medium tracking-label-sm text-primary uppercase disabled:opacity-50";

const saveLabels: Record<SaveState, string> = {
  idle: "Zmiany zapisują się automatycznie",
  saving: "Zapisuję…",
  saved: "Zapisano",
  error: "Nie udało się zapisać. Sprawdź połączenie i edytuj dalej, spróbuję ponownie.",
};

const draftLabels: Record<DraftState, string> = {
  idle: "",
  drafting: "Asystent uzupełnia puste pola na podstawie rozmowy…",
  done: "Asystent uzupełnił puste pola. Sprawdź je i popraw po swojemu.",
  "nothing-new": "W rozmowie nie ma nic więcej do pustych pól. Uzupełnij je samodzielnie.",
  error: "Nie udało się uzupełnić kanwy. Spróbuj ponownie albo wypełnij ją samodzielnie.",
};

// Actions above the canvas: AI fill, PDF download (the browser's print dialog) and save status.
export function CanvasToolbar() {
  const { saveState, draftState, fillFromConversation } = useCanvas();

  return (
    <div className="flex flex-col gap-2.5 print:hidden">
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className={actionClass}
          onClick={() => void fillFromConversation()}
          disabled={draftState === "drafting"}
        >
          Uzupełnij puste pola z rozmowy
        </button>
        <button type="button" className={actionClass} onClick={() => window.print()}>
          Pobierz PDF
        </button>
        <p className={`text-caption ${saveState === "error" ? "text-error" : "text-muted"}`} aria-live="polite">
          {saveLabels[saveState]}
        </p>
      </div>
      <p className={`min-h-[1lh] text-caption ${draftState === "error" ? "text-error" : ""}`} aria-live="polite">
        {draftLabels[draftState]}
      </p>
    </div>
  );
}
