import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import type { ChatMessage, ChatRole, SolutionRef, StoredChatMessage } from "@/types/chat";
import { getDb } from "@/server/db/client";
import { conversations, messages } from "@/server/db/schema";

export type Conversation = typeof conversations.$inferSelect;
export type MessageRole = (typeof messages.$inferInsert)["role"];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Check ids from clients before querying: Postgres rejects a malformed uuid
// with an error instead of returning no rows.
export function isConversationId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export async function createConversation(): Promise<Conversation> {
  const [row] = await getDb().insert(conversations).values({}).returning();
  return row;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const [row] = await getDb().select().from(conversations).where(eq(conversations.id, id)).limit(1);
  return row ?? null;
}

export async function saveMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await getDb().insert(messages).values({ conversationId, role, content, metadata });
}

// System messages are internal: the model gets its instructions from
// SYSTEM_PROMPT and the user never sees them.
const chatMessagesOf = (conversationId: string) =>
  and(eq(messages.conversationId, conversationId), inArray(messages.role, ["user", "assistant"]));

// Returns the last `limit` messages in chronological order.
export async function loadHistory(conversationId: string, limit: number): Promise<ChatMessage[]> {
  const rows = await getDb()
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(chatMessagesOf(conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return rows.reverse().map((r) => ({ role: r.role as ChatRole, content: r.content }));
}

export async function listMessages(conversationId: string): Promise<StoredChatMessage[]> {
  const rows = await getDb()
    .select()
    .from(messages)
    .where(chatMessagesOf(conversationId))
    .orderBy(messages.createdAt);

  return rows.map((r) => {
    const sources = r.metadata.sources as SolutionRef[] | undefined;
    return {
      id: r.id,
      role: r.role as ChatRole,
      content: r.content,
      ...(sources && { sources }),
      createdAt: r.createdAt.toISOString(),
    };
  });
}
