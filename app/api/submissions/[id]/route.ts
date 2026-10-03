import { getSubmission, isSubmissionId } from "@/lib/server/submissions";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSubmissionId(id)) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  try {
    const data = await getSubmission(id);
    if (!data) return Response.json({ error: "Submission not found" }, { status: 404 });

    return Response.json(
      {
        data: {
          id: data.id,
          conversationId: data.conversationId,
          type: data.type,
          status: data.status,
          title: data.title,
          summary: data.summary,
          category: data.category,
          targetGroup: data.targetGroup,
          location: data.location,
          peopleAffected: data.peopleAffected,
          reporterType: data.reporterType,
          aiScore: data.aiScore,
          priorityOverride: data.priorityOverride,
          clusterId: data.clusterId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[submissions] read failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
