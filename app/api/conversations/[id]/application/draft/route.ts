import { draftGrantApplication } from "@/lib/server/ai/grant-application";
import { isConversationId } from "@/lib/server/chat/history";
import { getApplicationState } from "@/lib/server/grants";
import { applicationErrorResponse } from "../shared";

// POST /api/conversations/[id]/application/draft → every section of the open call written by AI
// from the idea's canvas and conversation. Not saved: the page merges it into empty sections.
export async function POST(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });

  try {
    const state = await getApplicationState(id);
    if (state.status !== "ready") return Response.json({ error: "No open grant call for this idea" }, { status: 404 });
    if (state.application?.status === "submitted") {
      return Response.json({ error: "Application already submitted" }, { status: 409 });
    }
    return Response.json({ data: await draftGrantApplication(state.call, id) });
  } catch (err) {
    return applicationErrorResponse(err, "draft");
  }
}
