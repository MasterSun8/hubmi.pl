"use client";

import { GRANT_SECTION_MAX } from "@/types/grants";
import { useApplication } from "./application-provider";

// The call's sections as editable cards, like the canvas. After submitting they are read-only.
// "[uzupełnij: …]" marks what AI could not know; the hint above the cards explains it.
export function ApplicationSections() {
  const { call, sections, setSection, draftState, submitted } = useApplication();
  if (!call) return null;
  const drafting = draftState === "drafting";

  return (
    <form
      className="grid grid-cols-2 gap-5 max-lg:grid-cols-1 print:hidden"
      aria-label="Sekcje wniosku"
      aria-busy={drafting}
      onSubmit={(event) => event.preventDefault()}
    >
      {call.sections.map((section, index) => {
        const id = `application-${section.key}`;
        const empty = !sections[section.key]?.trim();
        return (
          <div
            key={section.key}
            className="flex min-h-60 flex-col gap-2.5 border border-field bg-surface p-5 transition-colors focus-within:border-primary"
          >
            <label htmlFor={id} className="flex flex-col gap-1">
              <span className="text-caption font-medium tracking-label-sm text-primary uppercase">
                {index + 1}. {section.label}
              </span>
              {section.question && (
                <span id={`${id}-hint`} className="text-caption text-muted">
                  {section.question}
                </span>
              )}
            </label>
            <textarea
              id={id}
              aria-describedby={section.question ? `${id}-hint` : undefined}
              value={sections[section.key] ?? ""}
              onChange={(event) => setSection(section.key, event.target.value)}
              readOnly={submitted !== null}
              maxLength={GRANT_SECTION_MAX}
              placeholder={drafting && empty ? "Asystent pisze tę sekcję na podstawie kanwy…" : "Wpisz własnymi słowami"}
              className="field-sizing-content min-h-32 flex-1 resize-none border-0 bg-transparent p-0 text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
        );
      })}
    </form>
  );
}
