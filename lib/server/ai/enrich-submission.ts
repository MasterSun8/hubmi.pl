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
import { getIdeaCard } from "./idea-card";
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

// Runs after POST /api/submissions has answered (see `after` in the route),
// and from scripts/enrich-submissions.mts for rows that missed it.
// Rewrites the raw text the client sent into a clean summary, picks the
// category (which is also the submission's group) and embeds the result.
// Each step degrades on its own: without the summary we embed the raw text,
// without the embedding the row waits for a backfill.
export async function enrichSubmission(id: string): Promise<void> {
  const [submission] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  // The embedding is computed from the summary, so a row that has one was
  // already processed (or the summary failed and we settled for raw text).
  if (!submission || submission.embedding) return;

  const summary = await summarize(submission).catch((err) => {
    console.error(`[submissions] AI summary failed for ${id}, embedding the raw text`, err);
    return null;
  });

  const [embedding, ideaCard] = await Promise.all([
    embed(summary ?? submission).catch((err) => {
      console.error(`[submissions] embedding failed for ${id}`, err);
      return null;
    }),
    submission.type === "idea" ? ideaCardFields(submission) : null,
  ]);

  if (!summary && !embedding && !ideaCard) return;
  await getDb()
    .update(submissions)
    .set({ ...summary, ...embedding, ...ideaCard })
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

// The idea card (fiszka) the user watched fill in next to the chat: essence and stage are
// stored for the admin panel; title, summary and target group come from the summary above.
async function ideaCardFields(submission: Submission): Promise<Pick<Submission, "essence" | "stage"> | null> {
  try {
    const card = await getIdeaCard(submission.conversationId);
    return card && { essence: card.essence, stage: card.stage };
  } catch (err) {
    console.error(`[submissions] idea card failed for ${submission.id}`, err);
    return null;
  }
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
