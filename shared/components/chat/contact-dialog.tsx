"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowButton } from "@/shared/components/arrow-button";
import { useChat } from "./chat-provider";

export type ContactDetails = { email: string; phone: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[\d\s-]{9,15}$/;

const bodyClass = "flex flex-col items-start gap-5 pt-5";
const inputClass =
  "min-h-10 rounded-input border border-line bg-transparent px-5 py-1.75 text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none aria-invalid:border-error";
const errorClass = "-mt-2.5 text-caption leading-6.5 text-error";
const backClass = "cursor-pointer border-0 bg-transparent p-0 text-caption font-medium tracking-label-sm text-ink uppercase no-underline";

type Errors = Partial<Record<keyof ContactDetails | "form", string>>;

function validate({ email, phone }: ContactDetails): Errors {
  const errors: Errors = {};
  if (!email && !phone) errors.form = "Podaj e-mail lub numer telefonu.";
  if (email && !emailPattern.test(email)) errors.email = "Sprawdź adres e-mail, np. anna@example.com.";
  if (phone && !phonePattern.test(phone)) errors.phone = "Sprawdź numer telefonu, np. 600 123 456.";
  return errors;
}

export function ContactDialog() {
  const { dialogOpen: open, sent, closeDialog: onClose, markSent } = useChat();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const titleId = useId();
  const formErrorId = useId();
  const emailErrorId = useId();
  const phoneErrorId = useId();

  // The native dialog gives focus trapping, Esc to close and an inert page behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const contact = {
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
    };
    const nextErrors = validate(contact);
    setErrors(nextErrors);
    // No endpoint yet: the contact details stay in the browser until the API exists.
    if (Object.keys(nextErrors).length === 0) markSent();
  }

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(640px,calc(100vw-40px))] overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-overlay backdrop:transition-opacity backdrop:duration-300 backdrop:ease-brand starting:open:backdrop:opacity-0"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {/* Re-keyed on every open so the panel replays its entry animation. */}
      <motion.div
        key={String(open)}
        className="max-h-[calc(100svh-40px)] overflow-y-auto bg-surface p-10 shadow-dialog hc:border hc:border-line max-sm:p-5"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.5, 0, 0.2, 1] }}
      >
        <div className="flex items-center justify-between gap-5">
          <h2 id={titleId} className="font-heading text-title text-primary">
            {sent ? "Zgłoszenie wysłane" : "Jak się z Tobą skontaktować?"}
          </h2>
          <button type="button" className="cursor-pointer border-0 bg-transparent p-0 text-title font-light text-ink" onClick={onClose} aria-label="Zamknij">
            ×
          </button>
        </div>

        {sent ? (
          <div className={bodyClass}>
            <p>
              Dziękujemy. Rozmowa i dane kontaktowe trafiły do systemu. Odezwiemy się, gdy zgłoszenie zostanie
              przejrzane.
            </p>
            <Link className={backClass} href="/">
              Wróć na stronę główną
            </Link>
          </div>
        ) : (
          <form className={bodyClass} noValidate onSubmit={handleSubmit}>
            <p id={formErrorId}>
              Podaj e-mail lub numer telefonu. Możesz podać oba.
              <br />
              Potrzebujemy przynajmniej jednego sposobu kontaktu.
            </p>
            {errors.form && (
              <p className={errorClass} role="alert">
                {errors.form}
              </p>
            )}

            <div className="flex flex-col gap-5 self-stretch">
              <label className="text-caption font-medium tracking-label-sm uppercase" htmlFor={`${titleId}-email`}>
                E-mail
              </label>
              <input
                id={`${titleId}-email`}
                className={inputClass}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="np. anna@example.com"
                aria-invalid={Boolean(errors.email || errors.form)}
                aria-describedby={errors.email ? emailErrorId : errors.form ? formErrorId : undefined}
              />
              {errors.email && (
                <p id={emailErrorId} className={errorClass}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-5 self-stretch">
              <label className="text-caption font-medium tracking-label-sm uppercase" htmlFor={`${titleId}-phone`}>
                Numer telefonu
              </label>
              <input
                id={`${titleId}-phone`}
                className={inputClass}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="np. 600 123 456"
                aria-invalid={Boolean(errors.phone || errors.form)}
                aria-describedby={errors.phone ? phoneErrorId : errors.form ? formErrorId : undefined}
              />
              {errors.phone && (
                <p id={phoneErrorId} className={errorClass}>
                  {errors.phone}
                </p>
              )}
            </div>

            <p className="text-caption">
              Wyślesz całą rozmowę oraz podane dane kontaktowe.
              <br />
              Zgłoszenie trafi do systemu do dalszej obsługi.
            </p>
            <div className="pt-2.5">
              <ArrowButton type="submit">Wyślij zgłoszenie</ArrowButton>
            </div>
            <button type="button" className={backClass} onClick={onClose}>
              Wróć do rozmowy
            </button>
          </form>
        )}
      </motion.div>
    </dialog>
  );
}
