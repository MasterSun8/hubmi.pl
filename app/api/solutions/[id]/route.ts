import {
  getSolution,
  isSolutionId,
  matchingSubmissions,
  updateSolutionStatus,
  updateSolutionStatusSchema,
} from "@/lib/server/solutions";

// GET /api/solutions/[id]: one innovation with the submissions it matches.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSolutionId(id)) return Response.json({ error: "Solution not found" }, { status: 404 });

  try {
    const solution = await getSolution(id);
    if (!solution) return Response.json({ error: "Solution not found" }, { status: 404 });
    const matches = await matchingSubmissions(id);
    return Response.json({ data: { ...solution, matchingSubmissions: matches } }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[solutions] read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

// PATCH /api/solutions/[id] { status }: publish, hide as draft or retire an innovation.
// Only published innovations are offered by the chat assistant.
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSolutionId(id)) return Response.json({ error: "Solution not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateSolutionStatusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const data = await updateSolutionStatus(id, parsed.data.status);
    if (!data) return Response.json({ error: "Solution not found" }, { status: 404 });
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[solutions] status update failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
