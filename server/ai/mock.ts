// Provider bez zewnętrznego API – pozwala rozwijać i testować backend oraz frontend
// zanim powstanie implementacja OpenAI. Nie liczy embeddingów (wyszukiwanie = full-text search).

import {
  AiNotImplementedError,
  type AiProvider,
  type ChatInput,
  type ChatOutput,
  type ChatTurn,
  type ConversationFlow,
  type RecommendationInput,
  type RecommendationOutput,
  type ScoreInput,
  type ScoreOutput,
  type SubmissionDraft,
} from "./types";

const IDEA_HINTS = ["pomysł", "pomysl", "inicjatyw", "chciał", "chcial", "zorganizować", "projekt"];

function detectFlow(history: ChatTurn[]): ConversationFlow {
  const text = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  if (!text) return "unknown";
  return IDEA_HINTS.some((h) => text.includes(h)) ? "idea" : "help";
}

function firstUserMessage(history: ChatTurn[]): string {
  return history.find((m) => m.role === "user")?.content ?? "";
}

function extractNumber(text: string): number | null {
  const match = text.match(/\b(\d{1,6})\s*(os[oó]b|senior|ludzi|dzieci|rodzin)/i);
  return match ? Number(match[1]) : null;
}

const clamp = (n: number) => Math.max(0, Math.min(5, n));

export class MockAiProvider implements AiProvider {
  readonly name = "mock";
  readonly embeddingModel = null;

  async embed(): Promise<number[][]> {
    throw new AiNotImplementedError("mock.embed");
  }

  async chat(input: ChatInput): Promise<ChatOutput> {
    const flow = input.flow === "unknown" ? detectFlow(input.history) : input.flow;
    const userTurns = input.history.filter((m) => m.role === "user").length;
    const missingInfo: string[] = [];
    const allText = input.history.map((m) => m.content).join(" ");
    if (extractNumber(allText) === null) missingInfo.push("skala problemu (liczba osób)");

    let reply: string;
    if (flow === "idea") {
      reply =
        "[MOCK] Dziękuję za pomysł. Opisz proszę, do kogo jest skierowany, jak miałby działać i jakich zasobów wymaga.";
    } else if (input.solutions.length === 0) {
      reply =
        "[MOCK] Nie znalazłem w bazie rozwiązania pasującego do tej sytuacji. Mogę zapisać tę potrzebę jako zgłoszenie.";
    } else {
      const list = input.solutions
        .slice(0, 3)
        .map((s, i) => `${i + 1}. ${s.title}`)
        .join("\n");
      reply = `[MOCK] Znalazłem rozwiązania, które mogą pasować:\n${list}`;
    }
    if (input.ropsContact.phone) {
      reply += `\n\nMożesz też zadzwonić do ROPS: ${input.ropsContact.phone}${
        input.ropsContact.dutyHours ? ` (${input.ropsContact.dutyHours})` : ""
      }.`;
    }

    return {
      reply,
      flow,
      citedSolutionIds: flow === "help" ? input.solutions.slice(0, 3).map((s) => s.id) : [],
      missingInfo,
      readyToSubmit: userTurns >= 2,
    };
  }

  async extractSubmission(history: ChatTurn[]): Promise<SubmissionDraft> {
    const first = firstUserMessage(history);
    const allUser = history
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");
    return {
      type: detectFlow(history) === "idea" ? "idea" : "problem",
      title: first.slice(0, 80) || "Zgłoszenie bez tytułu",
      summary: allUser.slice(0, 1000),
      category: null,
      targetGroup: null,
      peopleAffected: extractNumber(allUser),
      reporterType: null,
      locationHint: null,
    };
  }

  async scoreSubmission(input: ScoreInput): Promise<ScoreOutput> {
    const people = input.draft.peopleAffected ?? 0;
    const breakdown = {
      urgency: 2,
      scale: clamp(people >= 100 ? 5 : people >= 30 ? 4 : people >= 10 ? 3 : people > 0 ? 2 : 1),
      supportGap: input.matchedSolutions.length === 0 ? 4 : 2,
      recurrence: clamp(input.similarSubmissionsCount),
    };
    const sum = breakdown.urgency + breakdown.scale + breakdown.supportGap + breakdown.recurrence;
    return {
      score: Math.round((sum / 20) * 100),
      breakdown,
      rationale: "[MOCK] Wynik heurystyczny: skala z deklarowanej liczby osób, luka z braku rozwiązań, powtarzalność z grupy problemów.",
      missingData: input.draft.peopleAffected === null ? ["liczba osób dotkniętych problemem"] : [],
    };
  }

  async recommendImplementation(input: RecommendationInput): Promise<RecommendationOutput> {
    const names = input.solutions.map((s) => s.title).join(", ") || "wybrane rozwiązanie";
    return {
      steps: [
        { title: "Kontakt z autorem", description: `Ustal warunki wdrożenia: ${names}.` },
        { title: "Pilotaż", description: "Uruchom działanie w małej skali i zbierz informacje zwrotne.", roles: ["koordynator"] },
        { title: "Ocena", description: "Po pilotażu zdecyduj o skalowaniu." },
      ],
      pilot: "[MOCK] Pilotaż na małej grupie odbiorców przez 4–8 tygodni.",
      sourcedFacts: input.solutions.flatMap((s) => (s.requiredResources ? [`${s.title}: ${s.requiredResources}`] : [])),
      assumptions: ["[MOCK] Założono dostępność jednego koordynatora."],
      missingInfo: ["koszty wdrożenia", "dostępność partnerów"],
    };
  }
}
