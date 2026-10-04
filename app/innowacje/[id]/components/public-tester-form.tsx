"use client";

import { useState } from "react";

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
    } catch (err) {
      alert("Wystąpił błąd sieci");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-10 bg-success/10 text-success p-5 rounded-lg text-base font-medium max-w-3xl">
        Dziękujemy! Twoje zgłoszenie gotowości do pilotażu tej innowacji zostało wysłane. Pracownicy ROPS wkrótce się z Tobą skontaktują.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-4 mt-2 w-full">
      <h3 className="text-caption font-bold text-muted uppercase">Zostań testerem</h3>
      <p className="text-sm text-ink leading-relaxed">
        Chcesz przetestować tę innowację w swojej organizacji? Wyślij zgłoszenie!
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex min-h-10 items-center rounded-input border border-field px-4 transition-colors focus-within:border-primary">
          <input name="fullName" required placeholder="Imię i nazwisko" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none" />
        </label>
        
        <label className="flex min-h-10 items-center rounded-input border border-field px-4 transition-colors focus-within:border-primary">
          <input name="email" type="email" required placeholder="Adres e-mail" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none" />
        </label>
        
        <label className="flex min-h-10 items-center rounded-input border border-field px-4 transition-colors focus-within:border-primary">
          <input name="organization" placeholder="Organizacja (opcjonalnie)" className="min-w-0 flex-1 bg-transparent py-2 text-sm text-ink placeholder:text-muted focus:outline-none" />
        </label>
        
        <label className="flex items-start rounded-input border border-field px-4 py-2 transition-colors focus-within:border-primary">
          <textarea name="motivation" placeholder="Dlaczego? (opcjonalnie)" rows={2} className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none resize-none" />
        </label>

        <div className="flex justify-end mt-1">
          <button type="submit" disabled={loading} className="w-full rounded-button bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 cursor-pointer border-0">
            {loading ? "Wysyłanie..." : "Zgłoś się do pilotażu"}
          </button>
        </div>
      </form>
    </section>
  );
}
