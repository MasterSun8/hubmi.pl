import { matchingSolutions } from "@/lib/server/solutions";
import { isSubmissionId } from "@/lib/server/submissions";

// GET /api/submissions/[id]/matches: the published innovations closest to a submission.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSubmissionId(id)) return Response.json({ error: "Submission not found" }, { status: 404 });

  try {
    const data = await matchingSolutions(id);
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[submissions] matches failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
