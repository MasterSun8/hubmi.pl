import { getEnv } from "../env";
import { MockAiProvider } from "./mock";
import { OpenAiProvider } from "./openai";
import { AiNotImplementedError, type AiProvider } from "./types";

export * from "./types";

let provider: AiProvider | undefined;

export function getAi(): AiProvider {
  if (!provider) {
    const env = getEnv();
    provider = env.AI_PROVIDER === "openai" ? new OpenAiProvider(env) : new MockAiProvider();
  }
  return provider;
}

// Embedding jest opcjonalny: brak implementacji = null (zapis bez wektora, wyszukiwanie full-text).
export async function tryEmbed(texts: string[]): Promise<number[][] | null> {
  const ai = getAi();
  if (!ai.embeddingModel || texts.length === 0) return null;
  try {
    return await ai.embed(texts);
  } catch (error) {
    if (error instanceof AiNotImplementedError) return null;
    throw error;
  }
}
