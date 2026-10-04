import {
  deleteSubmission,
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
          essence: data.essence,
          stage: data.stage,
          location: data.location,
          peopleAffected: data.peopleAffected,
          reporterType: data.reporterType,
          aiScore: data.aiScore,
          priorityOverride: data.priorityOverride,
          riskLevel: data.riskLevel,
          riskReasoning: data.riskReasoning,
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

// DELETE → removes the submission with its conversation for good (admin panel).
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!isSubmissionId(id)) return Response.json({ error: "Submission not found" }, { status: 404 });

  try {
    const deleted = await deleteSubmission(id);
    if (!deleted) return Response.json({ error: "Submission not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[submissions] delete failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
