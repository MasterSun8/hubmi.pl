"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { createSubmission } from "@/lib/chat/chat-client";
import { ArrowButton } from "@/shared/components/arrow-button";
import { useChat } from "@/shared/components/chat/chat-provider";
import { validateContact, type ContactDetails, type ContactErrors } from "@/shared/components/chat/contact-dialog";

const contactFields: { key: keyof ContactDetails; label: string; hint: string; placeholder: string; type: string; autoComplete: string }[] = [
  { key: "location", label: "Miejscowość lub gmina", hint: "Gdzie ma działać pomysł?", placeholder: "np. Słomniki", type: "text", autoComplete: "address-level2" },
  { key: "email", label: "E-mail", hint: "Podaj e-mail lub telefon, żeby Hub mógł odpowiedzieć.", placeholder: "np. anna@example.com", type: "email", autoComplete: "email" },
  { key: "phone", label: "Telefon", hint: "Wystarczy jeden sposób kontaktu.", placeholder: "np. 600 123 456", type: "tel", autoComplete: "tel" },
];

// The last part of the canvas: contact cards in the same style as the canvas fields and the
// submit button. The submission is the conversation; the canvas is stored on it, so the admin sees both.
export function CanvasHandoff() {
  const { sent, started, conversationId, submissionDraft, markSent, startNew, newConversationLabel } = useChat();
  const router = useRouter();
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const wasStarted = useRef(false);

  // "Nowa oferta pomocy" clears the conversation; the next one starts in the chat.
  useEffect(() => {
    if (started) wasStarted.current = true;
    else if (wasStarted.current) router.push("/zaoferuj-pomoc");
  }, [started, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const contact = {
      location: String(data.get("location") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    };
    const nextErrors = validateContact(contact);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      // The first field to fix gets focus, so screen readers announce its error.
      const first = nextErrors.location ? "location" : nextErrors.email || nextErrors.form ? "email" : "phone";
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    const draft = submissionDraft();
    if (!draft) return setErrors({ submit: "Najpierw opisz pomysł asystentowi, żeby było co przekazać." });

    setSubmitting(true);
    const failure = await createSubmission({
      ...draft,
      location: contact.location,
      submitter: { email: contact.email || undefined, phone: contact.phone || undefined },
    });
    setSubmitting(false);
    if (failure) setErrors({ submit: failure });
    else markSent();
  }

  if (sent) {
    return (
      <section className="flex flex-col items-start gap-2.5 border-t border-line pt-7.5 print:hidden" aria-labelledby="handoff-title">
        <h2 id="handoff-title" className="font-heading text-title text-primary" tabIndex={-1}>
          Pomysł przekazany
        </h2>
        <p className="max-w-[60ch]">
          Dziękujemy. Rozmowa i kanwa trafiły do Hubu. Odezwiemy się, gdy pomysł zostanie przejrzany. Kanwę możesz
          dalej poprawiać, zmiany też do nas dotrą.
        </p>
        <div className="pt-2.5">
          <ArrowButton onClick={startNew}>{newConversationLabel}</ArrowButton>
        </div>
        <Link href="/" className="text-caption font-medium tracking-label-sm text-ink uppercase no-underline">
          Wróć na stronę główną
        </Link>
      </section>
    );
  }

  const fieldError = (key: keyof ContactDetails) => errors[key] ?? (key !== "location" ? errors.form : undefined);

  return (
    <form className="flex flex-col gap-5 print:hidden" noValidate onSubmit={handleSubmit} aria-labelledby="handoff-title">
      <div className="flex flex-col gap-1 pt-5">
        <h2 id="handoff-title" className="font-heading text-title text-primary">
          Gotowe do przekazania?
        </h2>
        <p className="max-w-[60ch]">
          Uzupełnij jeszcze, gdzie i jak się z Tobą skontaktować. Przekażesz pomysł razem z kanwą i całą rozmową.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {contactFields.map((field, index) => {
          const id = `contact-${field.key}`;
          const error = fieldError(field.key);
          return (
            <div
              key={field.key}
              className={`flex flex-col gap-2.5 border bg-surface p-5 transition-colors focus-within:border-primary ${error ? "border-error" : "border-field"}`}
            >
              <label htmlFor={id} className="flex flex-col gap-1">
                <span className="text-caption font-medium tracking-label-sm text-primary uppercase">
                  {10 + index}. {field.label}
                </span>
                <span id={`${id}-hint`} className="text-caption text-muted">
                  {field.hint}
                </span>
              </label>
              <input
                id={id}
                name={field.key}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-hint ${id}-error` : `${id}-hint`}
                className="border-0 bg-transparent p-0 text-ink placeholder:text-muted focus:outline-none"
              />
              {error && (
                <p id={`${id}-error`} className="text-caption text-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {errors.submit && (
        <p role="alert" className="text-error">
          {errors.submit}
        </p>
      )}
      <div className="flex flex-col items-start gap-2.5 pt-2.5">
        <ArrowButton type="submit" disabled={submitting || !conversationId}>
          {submitting ? "Wysyłam…" : "Przekaż\npomysł"}
        </ArrowButton>
        <p className="text-caption text-muted">Hub dostanie kanwę, całą rozmowę i podane dane kontaktowe.</p>
      </div>
    </form>
  );
}
