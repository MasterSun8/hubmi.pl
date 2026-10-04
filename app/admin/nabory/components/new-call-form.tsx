"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { DEFAULT_GRANT_SECTIONS, type GrantCallSection } from "@/types/grants";
import { useGrantCalls } from "./grant-calls-provider";

const inputClass =
  "min-h-10 rounded-input border border-field bg-transparent px-5 py-1.75 text-ink transition-colors placeholder:text-muted focus:border-primary focus:outline-none aria-invalid:border-error";
const labelClass = "text-caption font-medium tracking-label-sm uppercase";
const actionClass =
  "cursor-pointer border border-primary bg-transparent px-5 py-2.5 text-caption font-medium tracking-label-sm text-primary uppercase disabled:opacity-50";
const linkButtonClass = "cursor-pointer border-0 bg-transparent p-0 text-caption font-medium text-primary";

const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(new Date());

// "Nowy nabór": name, dates, amount, the application's sections and the evaluation criteria.
// The sections start from a typical set; ROPS adapts them to the call.
export function NewCallForm() {
  const { createCall } = useGrantCalls();
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<GrantCallSection[]>(DEFAULT_GRANT_SECTIONS);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<string | null>(null);
  const nextKey = useRef(1);
  const formId = useId();

  function updateSection(index: number, patch: Partial<GrantCallSection>) {
    setSections((current) => current.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const startsOn = String(data.get("startsOn") ?? "");
    const endsOn = String(data.get("endsOn") ?? "");
    const amount = Number(String(data.get("maxAmount") ?? "").replace(/\s/g, ""));
    const filledSections = sections.filter((section) => section.label.trim());

    if (!title || !startsOn || !endsOn) return setError("Podaj nazwę naboru oraz daty rozpoczęcia i zakończenia.");
    if (endsOn < startsOn) return setError("Data zakończenia nie może być wcześniejsza niż data rozpoczęcia.");
    if (filledSections.length === 0) return setError("Wniosek musi mieć przynajmniej jedną sekcję.");

    setSaving(true);
    const failure = await createCall({
      title,
      description: String(data.get("description") ?? "").trim(),
      startsOn,
      endsOn,
      maxAmount: Number.isInteger(amount) && amount > 0 ? amount : null,
      sections: filledSections.map((section) => ({ ...section, label: section.label.trim(), question: section.question.trim() })),
      criteria: String(data.get("criteria") ?? "").trim(),
    });
    setSaving(false);
    if (failure) return setError(failure);
    setError(null);
    setCreated(title);
    setOpen(false);
    setSections(DEFAULT_GRANT_SECTIONS);
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-5">
        <button type="button" className={actionClass} onClick={() => setOpen(true)}>
          Nowy nabór
        </button>
        {created && (
          <p className="text-caption" role="status">
            Dodano nabór „{created}”. Gdy trwa, autorzy pomysłów zobaczą go na kanwie.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5 border border-line bg-surface p-7.5 max-sm:p-5"
      aria-labelledby={`${formId}-title`}
      noValidate
      onSubmit={handleSubmit}
    >
      <h2 id={`${formId}-title`} className="text-subtitle font-light">
        Nowy nabór
      </h2>

      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <label className="col-span-2 flex flex-col gap-2.5 max-lg:col-span-1">
          <span className={labelClass}>Nazwa naboru</span>
          <input name="title" className={inputClass} placeholder="np. Małopolskie Mikrogranty 2027" required />
        </label>
        <label className="col-span-2 flex flex-col gap-2.5 max-lg:col-span-1">
          <span className={labelClass}>Krótki opis</span>
          <textarea name="description" rows={2} className={`${inputClass} resize-y`} placeholder="Na co i dla kogo jest nabór" />
        </label>
        <label className="flex flex-col gap-2.5">
          <span className={labelClass}>Od</span>
          <input name="startsOn" type="date" defaultValue={today()} className={inputClass} required />
        </label>
        <label className="flex flex-col gap-2.5">
          <span className={labelClass}>Do</span>
          <input name="endsOn" type="date" className={inputClass} required />
        </label>
        <label className="flex flex-col gap-2.5">
          <span className={labelClass}>Maksymalna kwota (zł)</span>
          <input name="maxAmount" inputMode="numeric" className={inputClass} placeholder="np. 10000" />
        </label>
      </div>

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className={`${labelClass} pb-1`}>Sekcje wniosku</legend>
        <p className="text-caption text-muted">
          Z tych sekcji asystent napisze wniosek na podstawie kanwy pomysłu. Pytanie pomocnicze widzi autor i AI.
        </p>
        <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
          {sections.map((section, index) => (
            <li key={section.key} className="grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2.5 max-lg:grid-cols-[2rem_minmax(0,1fr)_auto]">
              <span className="text-caption text-muted" aria-hidden="true">
                {index + 1}.
              </span>
              <input
                aria-label={`Sekcja ${index + 1}: nazwa`}
                value={section.label}
                onChange={(event) => updateSection(index, { label: event.target.value })}
                className={inputClass}
                placeholder="Nazwa sekcji"
              />
              <input
                aria-label={`Sekcja ${index + 1}: pytanie pomocnicze`}
                value={section.question}
                onChange={(event) => updateSection(index, { question: event.target.value })}
                className={`${inputClass} max-lg:col-start-2`}
                placeholder="Pytanie pomocnicze"
              />
              <button
                type="button"
                className={`${linkButtonClass} max-lg:col-start-3 max-lg:row-start-1`}
                onClick={() => setSections((current) => current.filter((_, i) => i !== index))}
                aria-label={`Usuń sekcję ${index + 1}${section.label ? `: ${section.label}` : ""}`}
              >
                Usuń
              </button>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className={`${linkButtonClass} self-start`}
          onClick={() => setSections((current) => [...current, { key: `section-${nextKey.current++}`, label: "", question: "" }])}
        >
          + Dodaj sekcję
        </button>
      </fieldset>

      <label className="flex flex-col gap-2.5">
        <span className={labelClass}>Kryteria oceny</span>
        <textarea
          name="criteria"
          rows={4}
          className={`${inputClass} resize-y`}
          placeholder={"np. 1. Odpowiedź na lokalną potrzebę (0–30 pkt)\n2. Realny budżet (0–25 pkt)"}
        />
        <span className="text-caption text-muted">Asystent pisze wniosek tak, żeby spełniał te kryteria.</span>
      </label>

      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className={actionClass} disabled={saving}>
          {saving ? "Zapisuję…" : "Zapisz nabór"}
        </button>
        <button type="button" className={linkButtonClass} onClick={() => setOpen(false)}>
          Anuluj
        </button>
      </div>
    </form>
  );
}
