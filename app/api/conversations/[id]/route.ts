import { getConversation, isConversationId, listMessages } from "@/lib/server/chat/history";
import type { ConversationResponse } from "@/types/chat";

// Without auth the conversation id works as the access key: anyone who has
// it can read the conversation.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    const conversation = await getConversation(id);
    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }

    const body: ConversationResponse = {
      id: conversation.id,
      status: conversation.status,
      messages: await listMessages(conversation.id),
    };
    return Response.json(body);
  } catch (err) {
    console.error("[conversations] read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
