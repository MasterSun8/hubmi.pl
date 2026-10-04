"use client";

import { useState } from "react";
import { ArrowButton } from "@/shared/components/arrow-button";

export function PublicTesterForm({ solutionId }: { solutionId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    payload.solutionId = solutionId;

    try {
      const res = await fetch("/api/innovation-testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json());
      
      if (res.success) {
        setSuccess(true);
      } else {
        alert("Błąd: " + res.error);
      }
    } catch {
      alert("Wystąpił błąd sieci");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="flex flex-col gap-5 border-t border-line pt-7.5" role="status">
        <h2 className="font-light text-subtitle text-primary">Zgłoszenie wysłane</h2>
        <p>Dziękujemy! Zgłoszenie gotowości do pilotażu zostało wysłane. Pracownicy ROPS skontaktują się z Tobą.</p>
      </section>
    );
  }

  const fieldClass = "min-h-11 w-full rounded-input border border-field bg-surface px-5 py-2.5 text-ink";
  return (
    <section className="flex w-full flex-col gap-5 border-t border-line pt-7.5" aria-labelledby="tester-title">
      <h2 id="tester-title" className="font-light text-subtitle text-primary">Przetestuj innowację</h2>
      <p>Chcesz sprawdzić to rozwiązanie w swojej organizacji? Zgłoś zainteresowanie pilotażem.</p>
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-primary [&::-webkit-details-marker]:hidden">
          <span className="font-medium">Zgłoś się do pilotażu</span>
          <span aria-hidden="true" className="text-lead group-open:hidden">+</span>
          <span aria-hidden="true" className="hidden text-lead group-open:inline">−</span>
        </summary>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-5">
          <label className="flex flex-col gap-2.5"><span>Imię i nazwisko</span><input name="fullName" autoComplete="name" required className={fieldClass} /></label>
          <label className="flex flex-col gap-2.5"><span>Adres e-mail</span><input name="email" type="email" autoComplete="email" required className={fieldClass} /></label>
          <label className="flex flex-col gap-2.5"><span>Organizacja <span className="text-muted">(opcjonalnie)</span></span><input name="organization" autoComplete="organization" className={fieldClass} /></label>
          <label className="flex flex-col gap-2.5"><span>Dlaczego chcesz przetestować innowację? <span className="text-muted">(opcjonalnie)</span></span><textarea name="motivation" rows={3} className={`${fieldClass} resize-y`} /></label>
          <ArrowButton type="submit" disabled={loading}>{loading ? "Wysyłanie…" : "Wyślij zgłoszenie"}</ArrowButton>
        </form>
      </details>
    </section>
  );
}
