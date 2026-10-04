"use client";

import Link from "next/link";
import { ArrowButton } from "@/shared/components/arrow-button";
import { useApplication } from "./application-provider";

const dateFormat = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

// Submitting the application; afterwards a confirmation in its place.
export function ApplicationSubmit() {
  const { submit, submitting, submitError, submitted, draftState, sections } = useApplication();
  const unfinished = Object.values(sections).some((text) => text.includes("[uzupełnij"));

  if (submitted) {
    return (
      <section className="flex flex-col items-start gap-2.5 border-t border-line pt-7.5 print:hidden" aria-labelledby="submitted-title">
        <h2 id="submitted-title" className="font-heading text-title text-primary">
          Wniosek złożony
        </h2>
        <p className="max-w-[60ch]">
          Złożono {submitted.submittedAt ? dateFormat.format(new Date(submitted.submittedAt)) : "przed chwilą"}. ROPS
          oceni wniosek po zakończeniu naboru i odezwie się na podany kontakt.
        </p>
        <Link href="/" className="text-caption font-medium tracking-label-sm text-ink uppercase no-underline">
          Wróć na stronę główną
        </Link>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-start gap-2.5 border-t border-line pt-7.5 print:hidden" aria-labelledby="submit-title">
      <h2 id="submit-title" className="font-heading text-title text-primary">
        Gotowe do złożenia?
      </h2>
      <p className="max-w-[60ch]">
        Po złożeniu wniosku nie można już zmienić. Sprawdź każdą sekcję
        {unfinished ? " i uzupełnij miejsca oznaczone [uzupełnij: …]" : ""}.
      </p>
      {submitError && (
        <p role="alert" className="text-error">
          {submitError}
        </p>
      )}
      <div className="pt-2.5">
        <ArrowButton onClick={() => void submit()} disabled={submitting || draftState === "drafting"}>
          {submitting ? "Składam…" : "Złóż\nwniosek"}
        </ArrowButton>
      </div>
    </section>
  );
}
