"use client";

import { useLoadedSubmission } from "./submission-details-provider";

// Figma 16:1566.
export function ContactDetails() {
  const { submission } = useLoadedSubmission();
  const contact = submission.submitter;

  return (
    <section className="flex flex-col gap-5 border-y border-line py-5" aria-labelledby="contact-title">
      <h2 id="contact-title" className="text-subtitle font-light">
        Dane kontaktowe
      </h2>
      {contact ? (
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
        <p className="text-caption">
          Dane kontaktowe są zapisane w bazie, ale endpoint zgłoszeń jeszcze ich nie udostępnia.
        </p>
      )}
    </section>
  );
}
