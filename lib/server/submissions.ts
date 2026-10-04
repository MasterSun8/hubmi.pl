import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { conversations, grantApplications, submissions, submitters } from "@/server/db/schema";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const nullableString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const createSubmissionSchema = z
  .object({
    conversationId: z.string().regex(UUID_RE),
    type: z.enum(["problem", "idea"]),
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().min(1).max(20_000),
    location: z.string().trim().min(1).max(200),
    category: nullableString,
    targetGroup: nullableString,
    peopleAffected: z.number().int().nonnegative().optional(),
    reporterType: z.enum(["individual", "ngo", "municipality", "company", "other"]).optional(),
    submitter: z
      .object({
        fullName: nullableString,
        email: z.string().trim().email().optional(),
        phone: nullableString,
        age: z.number().int().min(0).max(150).optional(),
        socialGroup: nullableString,
      })
      .refine((value) => Boolean(value.email || value.phone), {
        message: "Email or phone is required",
        path: ["email"],
      }),
  })
  .strict();

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export function isSubmissionId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export async function createSubmission(input: CreateSubmissionInput) {
  return getDb().transaction(async (tx) => {
    const [conversation] = await tx
      .select({ id: conversations.id, status: conversations.status })
      .from(conversations)
      .where(eq(conversations.id, input.conversationId))
      .limit(1);

    if (!conversation) return null;
    if (conversation.status === "submitted") return "already_submitted" as const;

    const [submission] = await tx
      .insert(submissions)
      .values({
        conversationId: input.conversationId,
        type: input.type,
        title: input.title,
        summary: input.summary,
        location: input.location,
        category: input.category,
        targetGroup: input.targetGroup,
        peopleAffected: input.peopleAffected,
        reporterType: input.reporterType,
      })
      .returning();

    await tx.insert(submitters).values({
      submissionId: submission.id,
      fullName: input.submitter.fullName,
      email: input.submitter.email,
      phone: input.submitter.phone,
      age: input.submitter.age,
      socialGroup: input.submitter.socialGroup,
    });

    await tx
      .update(conversations)
      .set({ status: "submitted", updatedAt: new Date() })
      .where(eq(conversations.id, input.conversationId));

    return submission;
  });
}

export const updateSubmissionStatusSchema = z
  .object({
    status: z.enum(["new", "in_review", "in_progress", "resolved", "rejected"]),
  })
  .strict();

export type UpdateSubmissionStatusInput = z.infer<typeof updateSubmissionStatusSchema>;

// Returns the updated row, or null when no submission has this id.
export async function updateSubmissionStatus(id: string, { status }: UpdateSubmissionStatusInput) {
  const [submission] = await getDb()
    .update(submissions)
    .set({ status, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning({ id: submissions.id, status: submissions.status, updatedAt: submissions.updatedAt });
  return submission ?? null;
}

export async function getSubmission(id: string) {
  const [submission] = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  return submission ?? null;
}

export async function listSubmissions(filters: {
  status?: (typeof submissions.$inferSelect)["status"];
  type?: (typeof submissions.$inferSelect)["type"];
  category?: string;
  limit: number;
  offset: number;
}) {
  const conditions = [
    filters.status ? eq(submissions.status, filters.status) : undefined,
    filters.type ? eq(submissions.type, filters.type) : undefined,
    filters.category ? eq(submissions.category, filters.category) : undefined,
  ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));

  return getDb()
    .select({
      id: submissions.id,
      conversationId: submissions.conversationId,
      type: submissions.type,
      status: submissions.status,
      title: submissions.title,
      summary: submissions.summary,
      category: submissions.category,
      targetGroup: submissions.targetGroup,
      essence: submissions.essence,
      stage: submissions.stage,
      // How many innovation canvas fields the author filled in (0 when there is no canvas).
      canvasFilled: sql<number>`(
        select count(*)::int from jsonb_each_text(coalesce(${conversations.canvas}, '{}'::jsonb))
        where length(trim(value)) > 0
      )`,
      // Grant applications submitted for this idea (module III, generator wniosków).
      submittedApplications: sql<number>`(
        select count(*)::int from ${grantApplications}
        where ${grantApplications.submissionId} = ${submissions.id} and ${grantApplications.status} = 'submitted'
      )`,
      location: submissions.location,
      peopleAffected: submissions.peopleAffected,
      reporterType: submissions.reporterType,
      aiScore: submissions.aiScore,
      priorityOverride: submissions.priorityOverride,
      riskLevel: submissions.riskLevel,
      clusterId: submissions.clusterId,
      createdAt: submissions.createdAt,
      updatedAt: submissions.updatedAt,
    })
    .from(submissions)
    .leftJoin(conversations, eq(conversations.id, submissions.conversationId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(submissions.createdAt))
    .limit(filters.limit)
    .offset(filters.offset);
}

// Removes the submission with everything about it: contact data, matches and grant
// applications (FK cascade), then its conversation with the messages.
export async function deleteSubmission(id: string) {
  return getDb().transaction(async (tx) => {
    const [row] = await tx
      .delete(submissions)
      .where(eq(submissions.id, id))
      .returning({ id: submissions.id, conversationId: submissions.conversationId });
    if (!row) return null;
    await tx.delete(conversations).where(eq(conversations.id, row.conversationId));
    return { id: row.id };
  });
}
