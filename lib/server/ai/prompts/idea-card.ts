import "server-only";

export const IDEA_STAGES = ["idea", "prototype", "pilot", "running"] as const;

// Fills the idea card (fiszka) shown next to the "Zaoferuj pomoc" chat while the
// conversation goes on, so every field may still be unknown.
export const IDEA_CARD_PROMPT = `
Na podstawie rozmowy z asystentem uzupełnij fiszkę pomysłu na innowację społeczną.
Rozmowa wciąż trwa, więc część informacji może jeszcze nie paść.

Zasady:
- Opieraj się wyłącznie na tym, co napisał użytkownik. Propozycje asystenta są tylko
  kontekstem. Niczego nie dopowiadaj.
- Pole, o którym użytkownik jeszcze nic nie powiedział, ustaw na null.
- Pisz po polsku, prosto i krótko, w trzeciej osobie (bez „ja”, „mój”).
- title: nazwa pomysłu, do 8 słów, bez cudzysłowów.
- summary: krótki opis pomysłu, 1–2 zdania.
- essence: jedno zdanie o tym, na czym polega pomysł i co zmienia dla odbiorców.
- targetGroup: komu jest dedykowany, np. „seniorzy z gminy Słomniki”.
- stage: etap realizacji: "idea" (tylko pomysł), "prototype" (przygotowany prototyp
  lub plan), "pilot" (testowany w małej skali), "running" (już działa). Null, jeśli
  użytkownik o tym nie mówił.
`.trim();
