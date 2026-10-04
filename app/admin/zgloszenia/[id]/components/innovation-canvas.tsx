"use client";

import { CANVAS_FIELDS } from "@/types/canvas";
import { useLoadedSubmission } from "./submission-details-provider";

// The innovation canvas the author filled in on /zaoferuj-pomoc/kanwa (ideas only).
export function InnovationCanvas() {
  const { canvas } = useLoadedSubmission();
  const filled = canvas ? CANVAS_FIELDS.filter((field) => canvas[field.key].trim()) : [];
  if (!canvas || filled.length === 0) return null;

  return (
    <section className="flex flex-col gap-5 border border-line bg-surface p-7.5 max-sm:p-5" aria-labelledby="canvas-title">
      <div className="flex flex-col gap-1">
        <h2 id="canvas-title" className="text-subtitle font-light text-primary">
          Kanwa innowacji
        </h2>
        <p className="text-caption">
          Wypełniona przez autora pomysłu ({filled.length} z {CANVAS_FIELDS.length} pól), z pomocą AI.
        </p>
      </div>
      <dl className="m-0 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
        {filled.map((field) => (
          <div key={field.key} className="flex flex-col gap-1 border border-line bg-surface p-5">
            <dt className="text-caption font-medium tracking-label-sm text-primary uppercase">{field.label}</dt>
            <dd className="m-0 whitespace-pre-wrap">{canvas[field.key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
