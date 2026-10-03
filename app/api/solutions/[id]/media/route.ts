import { getSolution, isSolutionId } from "@/lib/server/solutions";

// GET /api/solutions/[id]/media: films and downloads of a published innovation for the chat card.
// Public counterpart of GET /api/solutions/[id], without the matched (residents') submissions.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSolutionId(id)) return Response.json({ error: "Solution not found" }, { status: 404 });

  try {
    const solution = await getSolution(id);
    if (!solution || solution.status !== "published") {
      return Response.json({ error: "Solution not found" }, { status: 404 });
    }
    const { videoUrls, materialsUrls } = solution;
    return Response.json({ data: { videoUrls, materialsUrls } });
  } catch (err) {
    console.error("[solutions] media read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
