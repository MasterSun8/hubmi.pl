import { isConversationId } from "@/lib/server/chat/history";
import { getApplicationState, saveApplicationDraft } from "@/lib/server/grants";
import { applicationErrorResponse, SectionsBody } from "./shared";

// The grant application of a "Zaoferuj pomoc" idea in the call open today. Like the
// conversation, the id works as the access key.
//   GET → whether an application is possible now, the call and the saved application
//   PUT → saves the author's edits as a draft

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });

  try {
    return Response.json({ data: await getApplicationState(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return applicationErrorResponse(err, "read");
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!isConversationId(id)) return Response.json({ error: "Conversation not found" }, { status: 404 });
  const parsed = SectionsBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid application" }, { status: 400 });

  try {
    return Response.json({ data: await saveApplicationDraft(id, parsed.data.sections) });
  } catch (err) {
    return applicationErrorResponse(err, "save");
  }
}
