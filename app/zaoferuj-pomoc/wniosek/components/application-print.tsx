"use client";

import { useApplication } from "./application-provider";

// Print-only copy of the application for "Pobierz PDF": textareas clip long text on paper.
export function ApplicationPrint() {
  const { call, sections } = useApplication();
  if (!call) return null;

  return (
    <div className="hidden print:flex print:flex-col print:gap-3" aria-hidden="true">
      {call.sections.map((section, index) => (
        <div key={section.key} className="flex flex-col gap-1 border-b border-ink pb-3 break-inside-avoid">
          <p className="text-caption font-medium tracking-label-sm uppercase">
            {index + 1}. {section.label}
          </p>
          <p className="whitespace-pre-wrap">{sections[section.key]?.trim() || " "}</p>
        </div>
      ))}
    </div>
  );
}
