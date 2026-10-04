import "server-only";
import { CANVAS_FIELDS } from "@/types/canvas";

// Pre-fills the innovation canvas from a "Zaoferuj pomoc" conversation; the user edits it afterwards.
export const CANVAS_PROMPT = `
Na podstawie rozmowy z asystentem wstępnie wypełnij kanwę innowacji społecznej.
Użytkownik będzie mógł potem każde pole poprawić, więc pisz konkretnie i zwięźle.

Pola kanwy:
${CANVAS_FIELDS.map((field) => `- ${field.key} (${field.label}): ${field.question}`).join("\n")}

Zasady:
- Opieraj się na tym, co napisał użytkownik. Propozycje asystenta, które użytkownik
  przyjął, też możesz wykorzystać.
- Pole, o którym w rozmowie nic nie padło, zostaw jako pusty tekst "". Nie zgaduj
  liczb, kwot ani nazw partnerów.
- Pisz po polsku, prosto, w trzeciej osobie (bez „ja”, „mój”), 1–3 zdania na pole.
`.trim();
