"use client";

import { CANVAS_FIELD_MAX, CANVAS_FIELDS } from "@/types/canvas";
import { useCanvas } from "./canvas-provider";

// The nine canvas fields as editable cards. Each card is the form field itself:
// its border has field contrast and turns primary while the textarea has focus.
export function CanvasBoard() {
  const { canvas, setField, draftState } = useCanvas();
  const drafting = draftState === "drafting";

  return (
    <form
      className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1 print:hidden"
      aria-label="Pola kanwy"
      aria-busy={drafting}
      onSubmit={(event) => event.preventDefault()}
    >
      {CANVAS_FIELDS.map((field, index) => {
        const id = `canvas-${field.key}`;
        const empty = !canvas[field.key].trim();
        return (
          <div
            key={field.key}
            className="flex min-h-60 flex-col gap-2.5 border border-field bg-surface p-5 transition-colors focus-within:border-primary"
          >
            <label htmlFor={id} className="flex flex-col gap-1">
              <span className="text-caption font-medium tracking-label-sm text-primary uppercase">
                {index + 1}. {field.label}
              </span>
              <span id={`${id}-hint`} className="text-caption text-muted">
                {field.question}
              </span>
            </label>
            <textarea
              id={id}
              aria-describedby={`${id}-hint`}
              value={canvas[field.key]}
              onChange={(event) => setField(field.key, event.target.value)}
              maxLength={CANVAS_FIELD_MAX}
              placeholder={drafting && empty ? "Asystent uzupełnia z rozmowy…" : "Wpisz własnymi słowami"}
              className="field-sizing-content min-h-24 flex-1 resize-none border-0 bg-transparent p-0 text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
        );
      })}
    </form>
  );
}
