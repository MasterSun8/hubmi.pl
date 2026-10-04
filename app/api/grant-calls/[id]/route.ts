import { deleteGrantCall, getGrantCall, listCallApplications } from "@/lib/server/grants";
import { isConversationId as isUuid } from "@/lib/server/chat/history";

// GET /api/grant-calls/[id] → the call with its submitted applications (admin panel).
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return Response.json({ error: "Grant call not found" }, { status: 404 });

  try {
    const call = await getGrantCall(id);
    if (!call) return Response.json({ error: "Grant call not found" }, { status: 404 });
    return Response.json(
      { data: { ...call, applications: await listCallApplications(id) } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[grant-calls] read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

// DELETE → removes the call with its applications for good (admin panel).
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isUuid(id)) return Response.json({ error: "Grant call not found" }, { status: 404 });

  try {
    const deleted = await deleteGrantCall(id);
    if (!deleted) return Response.json({ error: "Grant call not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[grant-calls] delete failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
