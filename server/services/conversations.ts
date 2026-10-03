import { asc, eq } from "drizzle-orm";
import { getAi, type ChatTurn, type ConversationFlow } from "../ai";
import { getDb } from "../db/client";
import { conversations, messages } from "../db/schema";
import { getEnv } from "../env";
import { HttpError, notFound } from "../http";
import { retrieveKnowledge } from "./knowledge";
import { retrieveSolutions } from "./solutions";

export type AssistantMetadata = {
  citedSolutionIds: string[];
  retrievedSolutionIds: string[];
  knowledgeDocumentIds: string[];
  missingInfo: string[];
  readyToSubmit: boolean;
};

export async function createConversation(flow: ConversationFlow) {
  const [conversation] = await getDb().insert(conversations).values({ flow }).returning();
  return conversation;
}

export async function getConversation(id: string) {
  const db = getDb();
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
  if (!conversation) throw notFound("Conversation");
  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt));
  return { ...conversation, messages: history };
}

export async function getOpenConversation(id: string) {
  const conversation = await getConversation(id);
  if (conversation.status !== "open") throw new HttpError(409, "Conversation is already closed");
  return conversation;
}

export function toChatTurns(rows: { role: string; content: string }[]): ChatTurn[] {
  return rows
    .filter((m): m is ChatTurn => m.role === "user" || m.role === "assistant")
    .map(({ role, content }) => ({ role, content }));
}

// Zapytanie do RAG: ostatnie wypowiedzi użytkownika (opis potrzeby bywa rozłożony na kilka wiadomości).
export function retrievalQuery(history: ChatTurn[], lastN = 3): string {
  return history
    .filter((m) => m.role === "user")
    .slice(-lastN)
    .map((m) => m.content)
    .join("\n");
}

// Ids rozwiązań, które asystent pokazał w tej rozmowie.
export function citedSolutionIds(rows: { role: string; metadata: Record<string, unknown> }[]): string[] {
  const ids = rows.flatMap((m) =>
    m.role === "assistant" ? ((m.metadata as Partial<AssistantMetadata>).citedSolutionIds ?? []) : [],
  );
  return [...new Set(ids)];
}

export async function postUserMessage(conversationId: string, content: string) {
  const db = getDb();
  const conversation = await getOpenConversation(conversationId);

  const [userMessage] = await db.insert(messages).values({ conversationId, role: "user", content }).returning();
  const history = toChatTurns([...conversation.messages, userMessage]);
  const query = retrievalQuery(history);

  // Przepływ „Mam pomysł” nie szuka gotowych rozwiązań, ale może korzystać z wiedzy ROPS.
  const [solutions, knowledge] = await Promise.all([
    conversation.flow === "idea" ? Promise.resolve([]) : retrieveSolutions(query),
    retrieveKnowledge(query),
  ]);

  const env = getEnv();
  const output = await getAi().chat({
    flow: conversation.flow,
    history,
    solutions,
    knowledge,
    ropsContact: { phone: env.ROPS_PHONE ?? null, dutyHours: env.ROPS_DUTY_HOURS ?? null },
  });

  // Model może cytować wyłącznie to, co faktycznie znaleziono w bazie.
  const retrievedIds = new Set(solutions.map((s) => s.id));
  const cited = output.citedSolutionIds.filter((id) => retrievedIds.has(id));

  const metadata: AssistantMetadata = {
    citedSolutionIds: cited,
    retrievedSolutionIds: [...retrievedIds],
    knowledgeDocumentIds: [...new Set(knowledge.map((k) => k.documentId))],
    missingInfo: output.missingInfo,
    readyToSubmit: output.readyToSubmit,
  };

  const [assistantMessage] = await db.transaction(async (tx) => {
    if (output.flow !== conversation.flow) {
      await tx.update(conversations).set({ flow: output.flow }).where(eq(conversations.id, conversationId));
    } else {
      await tx.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));
    }
    return tx
      .insert(messages)
      .values({ conversationId, role: "assistant", content: output.reply, metadata })
      .returning();
  });

  return {
    flow: output.flow,
    userMessage,
    assistantMessage,
    solutions: solutions.filter((s) => cited.includes(s.id)),
    knowledgeSources: knowledge.map(({ documentId, title, sourceUrl }) => ({ documentId, title, sourceUrl })),
    missingInfo: output.missingInfo,
    readyToSubmit: output.readyToSubmit,
  };
}
