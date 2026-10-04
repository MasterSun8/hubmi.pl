"use client";

import { ArrowButton } from "@/shared/components/arrow-button";
import { useChat } from "./chat-provider";
import { NewConversationButton } from "./new-conversation-button";

type HandoffPanelProps = {
  description: string;
  // Hands off on another page instead of the contact dialog ("Zaoferuj pomoc" continues on the canvas).
  next?: { href: string; label: string; steps: string[] };
};

const dialogSteps = ["Sprawdź podsumowanie.", "Uzupełnij lokalizację i kontakt.", "Zatwierdź wysłanie zgłoszenia."];

// The "Gotowe do przekazania?" column next to the conversation (Figma 11:587).
export function HandoffPanel({ description, next }: HandoffPanelProps) {
  const { sent, waiting, openDialog, startNew, newConversationLabel } = useChat();

  if (sent) {
    return (
      <>
        <h2 className="max-w-[7em] font-heading text-title text-primary">Zgłoszenie przekazane</h2>
        <p>Dziękujemy. Rozmowa trafiła do systemu do dalszej obsługi.</p>
        <p>Masz kolejną sprawę? Zacznij nową rozmowę.</p>
        <div className="pt-5">
          <ArrowButton onClick={startNew}>{newConversationLabel}</ArrowButton>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="max-w-[7em] font-heading text-title text-primary">Gotowe do przekazania?</h2>
      <p>{description}</p>
      <p className="text-caption font-medium tracking-label-sm uppercase">Następny krok</p>
      <p>
        {(next?.steps ?? dialogSteps).map((step, index) => (
          <span key={step}>
            {index > 0 && <br />}
            {step}
          </span>
        ))}
      </p>
      <div className="pt-5">
        {next ? (
          <ArrowButton href={next.href}>{next.label}</ArrowButton>
        ) : (
          <ArrowButton onClick={openDialog} disabled={waiting}>
            {"Przekaż\nzgłoszenie"}
          </ArrowButton>
        )}
      </div>
      <NewConversationButton />
    </>
  );
}
