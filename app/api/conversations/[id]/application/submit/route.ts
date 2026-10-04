import { isConversationId } from "@/lib/server/chat/history";
import { submitApplication } from "@/lib/server/grants";
import { applicationErrorResponse, SectionsBody } from "../shared";

// POST /api/conversations/[id]/application/submit → saves the sections and submits the
// application in the open call; after that it is read-only.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });
  const parsed = SectionsBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid application" }, { status: 400 });

  try {
    return Response.json({ data: await submitApplication(id, parsed.data.sections) });
  } catch (err) {
    return applicationErrorResponse(err, "submit");
  }
}
