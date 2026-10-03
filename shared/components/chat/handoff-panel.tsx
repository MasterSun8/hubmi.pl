"use client";

import { ArrowButton } from "@/shared/components/arrow-button";
import { useChat } from "./chat-provider";

// The "Gotowe do przekazania?" column next to the conversation (Figma 11:587).
export function HandoffPanel({ description }: { description: string }) {
  const { sent, waiting, openDialog } = useChat();

  if (sent) {
    return (
      <>
        <h2 className="max-w-[7em] font-heading text-title text-primary">Zgłoszenie przekazane</h2>
        <p>Dziękujemy. Rozmowa trafiła do systemu do dalszej obsługi.</p>
      </>
    );
  }

  return (
    <>
      <h2 className="max-w-[7em] font-heading text-title text-primary">Gotowe do przekazania?</h2>
      <p>{description}</p>
      <p className="text-caption font-medium tracking-label-sm uppercase">Następny krok</p>
      <p>
        Sprawdź podsumowanie.
        <br />
        Uzupełnij lokalizację i kontakt.
        <br />
        Zatwierdź wysłanie zgłoszenia.
      </p>
      <div className="pt-5">
        <ArrowButton onClick={openDialog} disabled={waiting}>
          {"Przekaż\nzgłoszenie"}
        </ArrowButton>
      </div>
    </>
  );
}
