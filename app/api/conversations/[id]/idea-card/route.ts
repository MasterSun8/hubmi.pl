import { getIdeaCard } from "@/lib/server/ai/idea-card";
import { getConversation, isConversationId } from "@/lib/server/chat/history";

// GET /api/conversations/[id]/idea-card: the idea card (fiszka) drafted by AI from the
// conversation so far, read from the database unless new messages arrived since. Only for
// "Zaoferuj pomoc" conversations; like the conversation itself, the id works as the access key.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });

  try {
    const conversation = await getConversation(id);
    if (!conversation || conversation.flow !== "idea") {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }
    const card = await getIdeaCard(id);
    return Response.json({ data: card }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[idea-card] draft failed", err);
    return Response.json({ error: "Idea card unavailable" }, { status: 503 });
  }
}
