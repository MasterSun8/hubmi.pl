import { z } from "zod";

// Puste wartości z .env traktujemy jak brak wartości.
const optional = z.preprocess((v) => (v === "" ? undefined : v), z.string().optional());

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  OPENAI_API_KEY: optional,
  OPENAI_CHAT_MODEL: optional,
  OPENAI_EMBEDDING_MODEL: optional,
  OPENAI_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1536),
  ROPS_PHONE: optional,
  ROPS_DUTY_HOURS: optional,
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

// Leniwe parsowanie: build Next.js nie wymaga kompletnego .env.
export function getEnv(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
