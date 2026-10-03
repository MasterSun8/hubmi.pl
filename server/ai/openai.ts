// TODO(AI): implementacja providera OpenAI.
//
// Konfiguracja (.env): OPENAI_API_KEY, OPENAI_CHAT_MODEL, OPENAI_EMBEDDING_MODEL, OPENAI_EMBEDDING_DIMENSIONS.
// Kontrakt i opis pól: server/ai/types.ts. Wzorcowe zachowanie: server/ai/mock.ts.
//
// Wymagania z README:
// - chat: dopytuje o braki, cytuje wyłącznie rozwiązania z input.solutions, przy braku wyników mówi to wprost,
//   nie zgaduje danych kontaktowych, numer ROPS tylko z input.ropsContact;
// - extractSubmission / scoreSubmission: wynik ustrukturyzowany (structured outputs / JSON schema);
// - recommendImplementation: oddziela sourcedFacts od assumptions;
// - embed: wektory o wymiarze EMBEDDING_DIMENSIONS z server/db/schema.ts.

import type { Env } from "../env";
import {
  AiNotImplementedError,
  type AiProvider,
  type ChatInput,
  type ChatOutput,
  type ChatTurn,
  type RecommendationInput,
  type RecommendationOutput,
  type ScoreInput,
  type ScoreOutput,
  type SubmissionDraft,
} from "./types";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  readonly embeddingModel: string | null;

  constructor(private readonly env: Env) {
    this.embeddingModel = env.OPENAI_EMBEDDING_MODEL ?? null;
  }

  async embed(texts: string[]): Promise<number[][]> {
    void texts;
    throw new AiNotImplementedError("openai.embed");
  }

  async chat(input: ChatInput): Promise<ChatOutput> {
    void input;
    throw new AiNotImplementedError("openai.chat");
  }

  async extractSubmission(history: ChatTurn[]): Promise<SubmissionDraft> {
    void history;
    throw new AiNotImplementedError("openai.extractSubmission");
  }

  async scoreSubmission(input: ScoreInput): Promise<ScoreOutput> {
    void input;
    throw new AiNotImplementedError("openai.scoreSubmission");
  }

  async recommendImplementation(input: RecommendationInput): Promise<RecommendationOutput> {
    void input;
    throw new AiNotImplementedError("openai.recommendImplementation");
  }
}
