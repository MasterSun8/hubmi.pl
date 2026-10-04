import "server-only";
import { and, count, eq, inArray } from "drizzle-orm";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { loadHistory } from "@/lib/server/chat/history";
import { getDb } from "@/server/db/client";
import { conversations, messages } from "@/server/db/schema";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { IDEA_CARD_PROMPT, IDEA_STAGES } from "./prompts/idea-card";

const MAX_TRANSCRIPT_MESSAGES = 50;

const IdeaCard = z.object({
  title: z.string().nullable(),
  summary: z.string().nullable(),
  essence: z.string().nullable(),
  targetGroup: z.string().nullable(),
  stage: z.enum(IDEA_STAGES).nullable(),
});

export type IdeaCard = z.infer<typeof IdeaCard>;

// The idea card for the conversation as it is now; null while the user has not written anything.
// The card is stored on the conversation, so AI only runs again once new messages arrive
// (a page reload or the submission enrichment reuse the stored one).
export async function getIdeaCard(conversationId: string): Promise<IdeaCard | null> {
  const db = getDb();
  const [[conversation], [{ messageCount }]] = await Promise.all([
    db.select({ ideaCard: conversations.ideaCard }).from(conversations).where(eq(conversations.id, conversationId)),
    db
      .select({ messageCount: count() })
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId), inArray(messages.role, ["user", "assistant"]))),
  ]);

  const stored = conversation?.ideaCard;
  if (stored && stored.messageCount === messageCount) return IdeaCard.parse(stored.card);

  const card = await draftIdeaCard(conversationId);
  if (card) {
    await db
      .update(conversations)
      .set({ ideaCard: { messageCount, card } })
      .where(eq(conversations.id, conversationId));
  }
  return card;
}

async function draftIdeaCard(conversationId: string): Promise<IdeaCard | null> {
  const history = await loadHistory(conversationId, MAX_TRANSCRIPT_MESSAGES);
  if (!history.some((m) => m.role === "user")) return null;

  const transcript = history
    .map((m) => `${m.role === "user" ? "Użytkownik" : "Asystent"}: ${m.content}`)
    .join("\n\n");

  const response = await getOpenAI().responses.parse({
    model: getAiConfig().model,
    instructions: IDEA_CARD_PROMPT,
    input: `Rozmowa:\n${transcript}`,
    text: { format: zodTextFormat(IdeaCard, "idea_card") },
    store: false,
  });

  if (!response.output_parsed) throw new Error(`No parsed output (status: ${response.status})`);
  return response.output_parsed;
}
