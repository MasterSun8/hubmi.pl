// Kontrakt między backendem a warstwą AI.
// Backend odpowiada za bazę, wyszukiwanie i zapis; provider AI tylko za generowanie treści i embeddingi.
// Implementacja OpenAI: server/ai/openai.ts.

import type { AiScoreBreakdown, RecommendationStep } from "../db/schema";

export type ConversationFlow = "unknown" | "help" | "idea";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type RetrievedSolution = {
  id: string;
  title: string;
  description: string;
  problem: string | null;
  categories: string[];
  targetGroups: string[];
  sourceUrl: string | null;
  // 0..1, im wyżej tym lepiej dopasowane
  similarity: number;
};

export type RetrievedKnowledge = {
  documentId: string;
  title: string;
  content: string;
  sourceUrl: string | null;
  similarity: number;
};

export type ChatInput = {
  flow: ConversationFlow;
  history: ChatTurn[];
  solutions: RetrievedSolution[];
  knowledge: RetrievedKnowledge[];
  ropsContact: { phone: string | null; dutyHours: string | null };
};

export type ChatOutput = {
  reply: string;
  // Rozpoznany przepływ: „Potrzebuję pomocy” (help) albo „Mam pomysł” (idea).
  flow: ConversationFlow;
  // Tylko identyfikatory z ChatInput.solutions – model nie może wymyślać rozwiązań.
  citedSolutionIds: string[];
  // Czego brakuje, by wysłać zgłoszenie (np. „skala problemu”).
  missingInfo: string[];
  readyToSubmit: boolean;
};

export type SubmissionDraft = {
  type: "problem" | "idea";
  title: string;
  summary: string;
  category: string | null;
  targetGroup: string | null;
  peopleAffected: number | null;
  reporterType: "individual" | "ngo" | "municipality" | "company" | "other" | null;
  // Lokalizacja wspomniana w rozmowie – tylko podpowiedź; wiążąca jest ta z formularza.
  locationHint: string | null;
};

export type ScoreInput = {
  draft: SubmissionDraft;
  location: string;
  history: ChatTurn[];
  matchedSolutions: RetrievedSolution[];
  // Liczba niezależnych zgłoszeń w tej samej grupie problemów (bez bieżącego).
  similarSubmissionsCount: number;
  similarReporterTypes: string[];
};

export type ScoreOutput = {
  // 0..100
  score: number;
  // Każde kryterium 0..5
  breakdown: AiScoreBreakdown;
  rationale: string;
  missingData: string[];
};

export type RecommendationInput = {
  history: ChatTurn[];
  solutions: (RetrievedSolution & {
    // Ze źródła: kto może wdrożyć i czy test innowacji potwierdził skuteczność.
    implementers: string | null;
    effectiveness: string | null;
    authors: string[];
    materialsUrls: string[];
    implementationNotes: string | null;
    requiredResources: string | null;
  })[];
  context: {
    teamSize?: number;
    peopleAffected?: number;
    resources?: string;
    location?: string;
    partners?: string;
    notes?: string;
  };
};

export type RecommendationOutput = {
  steps: RecommendationStep[];
  pilot: string | null;
  sourcedFacts: string[];
  assumptions: string[];
  missingInfo: string[];
};

export interface AiProvider {
  readonly name: string;
  // null = provider nie liczy embeddingów; wyszukiwanie spada wtedy na full-text search.
  readonly embeddingModel: string | null;
  embed(texts: string[]): Promise<number[][]>;
  chat(input: ChatInput): Promise<ChatOutput>;
  extractSubmission(history: ChatTurn[]): Promise<SubmissionDraft>;
  scoreSubmission(input: ScoreInput): Promise<ScoreOutput>;
  recommendImplementation(input: RecommendationInput): Promise<RecommendationOutput>;
}

export class AiNotImplementedError extends Error {
  constructor(operation: string) {
    super(`AI operation not implemented: ${operation}`);
    this.name = "AiNotImplementedError";
  }
}
