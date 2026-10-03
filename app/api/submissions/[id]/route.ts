import {
  getSubmission,
  isSubmissionId,
  updateSubmissionStatus,
  updateSubmissionStatusSchema,
} from "@/lib/server/submissions";

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

// Changes the status of a submission, e.g. to "resolved" from the admin panel.
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSubmissionId(id)) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateSubmissionStatusSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const data = await updateSubmissionStatus(id, parsed.data);
    if (!data) return Response.json({ error: "Submission not found" }, { status: 404 });
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[submissions] status update failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
