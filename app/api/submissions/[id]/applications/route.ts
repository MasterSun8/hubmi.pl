import { listSubmissionApplications } from "@/lib/server/grants";
import { isSubmissionId } from "@/lib/server/submissions";

// GET /api/submissions/[id]/applications → grant applications submitted for this idea (admin panel).
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSubmissionId(id)) return Response.json({ error: "Submission not found" }, { status: 404 });

  try {
    return Response.json({ data: await listSubmissionApplications(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[applications] list failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
