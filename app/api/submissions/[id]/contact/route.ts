import { getSubmissionContact, isSubmissionId } from "@/lib/server/submissions";

// GET /api/submissions/[id]/contact → the author's name, email and phone, or null (admin panel).
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSubmissionId(id)) return Response.json({ error: "Submission not found" }, { status: 404 });

  try {
    return Response.json({ data: await getSubmissionContact(id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[submissions] contact read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
