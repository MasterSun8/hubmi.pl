"use client";

import { CANVAS_FIELDS } from "@/types/canvas";
import { useCanvas } from "./canvas-provider";

// Print-only copy of the canvas for "Pobierz PDF": textareas clip long text on paper,
// so the printout shows the values as plain text on a single A4 landscape page.
export function CanvasPrint() {
  const { canvas } = useCanvas();

  return (
    <div className="hidden print:grid print:grid-cols-3 print:gap-2" aria-hidden="true">
      {CANVAS_FIELDS.map((field, index) => (
        <div key={field.key} className="flex min-h-40 flex-col gap-1 border border-ink p-3 text-caption break-inside-avoid">
          <p className="font-medium tracking-label-sm uppercase">
            {index + 1}. {field.label}
          </p>
          <p className="whitespace-pre-wrap">{canvas[field.key].trim() || " "}</p>
        </div>
      ))}
    </div>
  );
}
