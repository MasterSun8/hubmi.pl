import type { ChatMessage, SolutionRef } from "@/types/chat";

// Scripted replies used until the UI is wired to POST /api/chat.
// Replace getAssistantReply with a call that reads the ChatEvent stream.

export type ChatFlowId = "problem" | "pomoc";

export type InitiativeSuggestion = SolutionRef & { description: string };

export type AssistantReply = {
  content: string;
  suggestion?: InitiativeSuggestion;
};

const exampleInitiative: InitiativeSuggestion = {
  id: "przyklad-posilek-z-dostawa",
  title: "Posiłek z dostawą do domu",
  description: "Dowóz gotowych obiadów dla osób, które mają trudność z samodzielnym przygotowaniem posiłków.",
};

const fallback: AssistantReply = {
  content:
    "Dziękuję, dopisałem to do rozmowy. Możesz napisać coś jeszcze albo przekazać zgłoszenie. Przed wysłaniem zapytamy o sposób kontaktu.",
};

const scripts: Record<ChatFlowId, AssistantReply[]> = {
  problem: [
    {
      content:
        "Dziękuję. Kogo dotyczy ta sytuacja i od kiedy trwa? Napisz też, czego teraz najbardziej brakuje.",
    },
    {
      content: "Rozumiem. Ta inicjatywa z bazy może pasować do Twojej sytuacji. Sprawdź szczegóły i dostępność pomocy.",
      suggestion: exampleInitiative,
    },
  ],
  pomoc: [
    { content: "Ile osób może zaangażować się w pomoc i jakie zasoby już macie do dyspozycji?" },
    {
      content:
        "Dziękuję. Zapisałem, czym możecie pomóc. Możesz dopisać szczegóły albo przekazać ofertę pomocy.",
    },
  ],
};

export async function getAssistantReply(flow: ChatFlowId, history: ChatMessage[]): Promise<AssistantReply> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const userTurns = history.filter((message) => message.role === "user").length;
  return scripts[flow][userTurns - 1] ?? fallback;
}
