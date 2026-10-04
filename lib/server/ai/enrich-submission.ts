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
import { assessRisk } from "./risk";
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
// category (which is also the submission's group), embeds the result and,
// assesses the risk level (for ideas: whether the idea or the chat signals harm to people).
// Each step degrades on its own: without the summary we embed the raw text,
// without the embedding or the risk level the row waits for a backfill.
export async function enrichSubmission(id: string): Promise<void> {
  const [submission] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!submission) return;

  // The embedding is computed from the summary, so a row that has one was
  // already summarized (or the summary failed and we settled for raw text).
  const needsSummary = !submission.embedding;
  // A separate check lets the backfill assess rows summarized before risk levels existed.
  const needsRisk = submission.riskLevel === null;
  if (!needsSummary && !needsRisk) return;

  const input = await buildInput(submission);
  const [summary, risk] = await Promise.all([
    needsSummary
      ? summarize(input).catch((err) => {
          console.error(`[submissions] AI summary failed for ${id}, embedding the raw text`, err);
          return null;
        })
      : null,
    needsRisk
      ? assessRisk(input).catch((err) => {
          console.error(`[submissions] risk assessment failed for ${id}`, err);
          return null;
        })
      : null,
  ]);

  const [embedding, ideaCard] = needsSummary
    ? await Promise.all([
        embed(summary ?? submission).catch((err) => {
          console.error(`[submissions] embedding failed for ${id}`, err);
          return null;
        }),
        submission.type === "idea" ? ideaCardFields(submission) : null,
      ])
    : [null, null];

  if (!summary && !embedding && !ideaCard && !risk) return;
  await getDb()
    .update(submissions)
    .set({ ...summary, ...embedding, ...ideaCard, ...risk })
    .where(eq(submissions.id, id));
}

// The chat transcript both prompts read; falls back to the raw text the client sent.
async function buildInput(submission: Submission): Promise<string> {
  const history = await loadHistory(submission.conversationId, MAX_TRANSCRIPT_MESSAGES);
  const transcript = history
    .map((m) => `${m.role === "user" ? "Mieszkaniec" : "Asystent"}: ${m.content}`)
    .join("\n\n");

  return (
    `Typ zgłoszenia: ${submission.type === "problem" ? "problem" : "pomysł"}\n` +
    `Lokalizacja: ${submission.location}\n\n` +
    `Rozmowa:\n${transcript || `Mieszkaniec: ${submission.summary}`}`
  );
}

async function summarize(input: string): Promise<SummaryFields> {
  const response = await getOpenAI().responses.parse({
    model: getAiConfig().model,
    instructions: SUBMISSION_SUMMARY_PROMPT,
    input,
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

// Assesses the risk level again from the conversation (the backfill's --risk run, after the
// rules in risk.ts change). Leaves the summary and embedding alone.
export async function reassessRisk(id: string): Promise<void> {
  const [submission] = await getDb().select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!submission) return;
  const risk = await assessRisk(await buildInput(submission));
  await getDb().update(submissions).set(risk).where(eq(submissions.id, id));
}
