"use client";

import { useLoadedSubmission } from "./submission-details-provider";

// Figma 16:1566.
export function ContactDetails() {
  const { contact } = useLoadedSubmission();

  return (
    <section className="flex flex-col gap-5 border border-line bg-surface p-7.5 max-sm:p-5" aria-labelledby="contact-title">
      <h2 id="contact-title" className="text-subtitle font-light text-primary">
        Dane kontaktowe
      </h2>
      {contact === "unavailable" ? (
        <p role="alert" className="text-error">
          Nie udało się pobrać danych kontaktowych. Spróbuj odświeżyć stronę.
        </p>
      ) : contact ? (
        <>
          {contact.fullName && <p>{contact.fullName}</p>}
          <p>
            Telefon (opcjonalnie)
            <br />
            {contact.phone ? <a className="text-ink" href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> : "Nie podano"}
          </p>
          <p>
            E-mail (opcjonalnie)
            <br />
            {contact.email ? <a className="text-ink" href={`mailto:${contact.email}`}>{contact.email}</a> : "Nie podano"}
          </p>
          <p className="text-caption">Kontakt podany w formularzu zgłoszenia.</p>
        </>
      ) : (
        <p className="text-caption">Do tego zgłoszenia nie zapisano danych kontaktowych.</p>
      )}
    </section>
  );
}
