import "server-only";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { loadHistory } from "@/lib/server/chat/history";
import { getDb } from "@/server/db/client";
import { submissions } from "@/server/db/schema";
import { getEnv } from "@/server/env";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { SUBMISSION_CATEGORIES, SUBMISSION_SUMMARY_PROMPT } from "./prompts/submission-summary";

const MAX_TRANSCRIPT_MESSAGES = 50;

const SubmissionSummary = z.object({
  title: z.string(),
  summary: z.string(),
  category: z.enum(SUBMISSION_CATEGORIES),
  targetGroup: z.string().nullable(),
});

type SummaryFields = z.infer<typeof SubmissionSummary>;
type Submission = typeof submissions.$inferSelect;
type EmbeddingFields = Pick<Submission, "embedding" | "embeddingModel" | "embeddingUpdatedAt" | "contentHash">;

// Runs after POST /api/submissions has answered (see `after` in the route).
// Rewrites the raw text the client sent into a clean summary and embeds it.
// Each step degrades on its own: without the summary we embed the raw text,
// without the embedding the row keeps embedding = NULL for a later backfill.
export async function enrichSubmission(id: string): Promise<void> {
  const [submission] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!submission) return;

  const summary = await summarize(submission).catch((err) => {
    console.error(`[submissions] AI summary failed for ${id}, embedding the raw text`, err);
    return null;
  });

  const embedding = await embed(summary ?? submission).catch((err) => {
    console.error(`[submissions] embedding failed for ${id}`, err);
    return null;
  });

  if (!summary && !embedding) return;
  await getDb()
    .update(submissions)
    .set({ ...summary, ...embedding })
    .where(eq(submissions.id, id));
}

async function summarize(submission: Submission): Promise<SummaryFields> {
  const history = await loadHistory(submission.conversationId, MAX_TRANSCRIPT_MESSAGES);
  const transcript = history
    .map((m) => `${m.role === "user" ? "Mieszkaniec" : "Asystent"}: ${m.content}`)
    .join("\n\n");

  const response = await getOpenAI().responses.parse({
    model: getAiConfig().model,
    instructions: SUBMISSION_SUMMARY_PROMPT,
    input:
      `Typ zgłoszenia: ${submission.type === "problem" ? "problem" : "pomysł"}\n` +
      `Lokalizacja: ${submission.location}\n\n` +
      `Rozmowa:\n${transcript || `Mieszkaniec: ${submission.summary}`}`,
    text: { format: zodTextFormat(SubmissionSummary, "submission_summary") },
    store: false,
  });

  if (!response.output_parsed) throw new Error(`No parsed output (status: ${response.status})`);
  return response.output_parsed;
}

// Same hash scheme as scripts/embed-solutions.mts: the model and dimensions
// are part of the hash, so changing either forces a re-embed.
async function embed(fields: {
  title: string;
  summary: string;
  category: string | null;
  targetGroup: string | null;
}): Promise<EmbeddingFields> {
  const { OPENAI_EMBEDDING_MODEL: model, OPENAI_EMBEDDING_DIMENSIONS: dimensions } = getEnv();
  if (!model) throw new Error("Missing OPENAI_EMBEDDING_MODEL (see .env.example)");

  // Location is left out on purpose: grouping is by need, region is a filter.
  const text = [
    fields.title,
    fields.summary,
    fields.category && `Obszar: ${fields.category}`,
    fields.targetGroup && `Kogo dotyczy: ${fields.targetGroup}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data } = await getOpenAI().embeddings.create({ model, input: text, dimensions });
  return {
    embedding: data[0].embedding,
    embeddingModel: model,
    embeddingUpdatedAt: new Date(),
    contentHash: createHash("sha256").update(`${model}\n${dimensions}\n${text}`).digest("hex"),
  };
}
