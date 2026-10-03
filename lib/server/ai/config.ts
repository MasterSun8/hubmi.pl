import "server-only";

export type AiConfig = {
  apiKey: string;
  model: string;
  timeoutMs: number;
};

let cached: AiConfig | undefined;

// Read lazily, not at import time: `next build` imports route modules
// without runtime env, so a top-level throw would break the build.
export function getAiConfig(): AiConfig {
  if (cached) return cached;

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;

  if (!apiKey) throw new Error("Missing OPENAI_API_KEY (see .env.example)");
  if (!model) throw new Error("Missing OPENAI_MODEL (see .env.example)");

  cached = {
    apiKey,
    model,
    timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS) || 30_000,
  };
  return cached;
}
