import "server-only";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { grantApplications, grantCalls, submissions } from "@/server/db/schema";
import {
  GRANT_SECTION_MAX,
  type ApplicationState,
  type GrantApplication,
  type GrantApplicationListItem,
  type GrantCall,
  type GrantCallListItem,
} from "@/types/grants";

type CallRow = typeof grantCalls.$inferSelect;
type ApplicationRow = typeof grantApplications.$inferSelect;

const toCall = (row: CallRow): GrantCall => ({
  id: row.id,
  title: row.title,
  description: row.description,
  startsOn: row.startsOn,
  endsOn: row.endsOn,
  maxAmount: row.maxAmount,
  sections: row.sections,
  criteria: row.criteria,
});

const toApplication = (row: ApplicationRow): GrantApplication => ({
  id: row.id,
  callId: row.callId,
  submissionId: row.submissionId,
  sections: row.sections,
  status: row.status,
  submittedAt: row.submittedAt?.toISOString() ?? null,
});

// Calls run on calendar days in Poland, whatever the server's time zone.
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Warsaw" }).format(new Date());

export const createGrantCallSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).default(""),
    startsOn: z.iso.date(),
    endsOn: z.iso.date(),
    maxAmount: z.number().int().positive().nullable().default(null),
    sections: z
      .array(
        z.object({
          key: z.string().trim().min(1).max(60),
          label: z.string().trim().min(1).max(120),
          question: z.string().trim().max(300).default(""),
        }),
      )
      .min(1)
      .max(15)
      .refine((sections) => new Set(sections.map((s) => s.key)).size === sections.length, "Duplicate section keys"),
    criteria: z.string().trim().max(4000).default(""),
  })
  .refine((call) => call.endsOn >= call.startsOn, { path: ["endsOn"], message: "endsOn before startsOn" });

export async function createGrantCall(input: z.infer<typeof createGrantCallSchema>): Promise<GrantCall> {
  const [row] = await getDb().insert(grantCalls).values(input).returning();
  return toCall(row);
}

export async function listGrantCalls(): Promise<GrantCallListItem[]> {
  const rows = await getDb()
    .select({
      call: grantCalls,
      // Drizzle leaves columns of a single-table query unqualified, so the outer table is named explicitly.
      submittedApplications: sql<number>`(
        select count(*)::int from grant_applications a
        where a.call_id = ${sql.identifier("grant_calls")}.id and a.status = 'submitted'
      )`,
    })
    .from(grantCalls)
    .orderBy(desc(grantCalls.endsOn));
  return rows.map((row) => ({ ...toCall(row.call), submittedApplications: row.submittedApplications }));
}

export async function getGrantCall(id: string): Promise<GrantCall | null> {
  const [row] = await getDb().select().from(grantCalls).where(eq(grantCalls.id, id)).limit(1);
  return row ? toCall(row) : null;
}

// The open call closing soonest; one at a time is enough for the author's screens.
export async function getOpenGrantCall(): Promise<GrantCall | null> {
  const day = today();
  const [row] = await getDb()
    .select()
    .from(grantCalls)
    .where(and(lte(grantCalls.startsOn, day), gte(grantCalls.endsOn, day)))
    .orderBy(asc(grantCalls.endsOn))
    .limit(1);
  return row ? toCall(row) : null;
}

const applicationListColumns = {
  application: grantApplications,
  submissionTitle: submissions.title,
  submissionLocation: submissions.location,
  submissionStage: submissions.stage,
  callTitle: grantCalls.title,
};

function toListItem(row: {
  application: ApplicationRow;
  submissionTitle: string;
  submissionLocation: string;
  submissionStage: string | null;
  callTitle: string;
}): GrantApplicationListItem {
  return {
    ...toApplication(row.application),
    submissionTitle: row.submissionTitle,
    submissionLocation: row.submissionLocation,
    submissionStage: row.submissionStage,
    callTitle: row.callTitle,
  };
}

// Submitted applications of a call (drafts stay private to their author).
export async function listCallApplications(callId: string): Promise<GrantApplicationListItem[]> {
  const rows = await getDb()
    .select(applicationListColumns)
    .from(grantApplications)
    .innerJoin(submissions, eq(submissions.id, grantApplications.submissionId))
    .innerJoin(grantCalls, eq(grantCalls.id, grantApplications.callId))
    .where(and(eq(grantApplications.callId, callId), eq(grantApplications.status, "submitted")))
    .orderBy(desc(grantApplications.submittedAt));
  return rows.map(toListItem);
}

export async function listSubmissionApplications(submissionId: string): Promise<GrantApplicationListItem[]> {
  const rows = await getDb()
    .select(applicationListColumns)
    .from(grantApplications)
    .innerJoin(submissions, eq(submissions.id, grantApplications.submissionId))
    .innerJoin(grantCalls, eq(grantCalls.id, grantApplications.callId))
    .where(and(eq(grantApplications.submissionId, submissionId), eq(grantApplications.status, "submitted")))
    .orderBy(desc(grantApplications.submittedAt));
  return rows.map(toListItem);
}

// ---------- The author's side: keyed by the conversation, like the canvas ----------

async function ideaSubmissionOf(conversationId: string) {
  const [row] = await getDb()
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.conversationId, conversationId), eq(submissions.type, "idea")))
    .limit(1);
  return row ?? null;
}

async function findApplication(callId: string, submissionId: string) {
  const [row] = await getDb()
    .select()
    .from(grantApplications)
    .where(and(eq(grantApplications.callId, callId), eq(grantApplications.submissionId, submissionId)))
    .limit(1);
  return row ?? null;
}

export async function getApplicationState(conversationId: string): Promise<ApplicationState> {
  const submission = await ideaSubmissionOf(conversationId);
  if (!submission) return { status: "idea-not-sent" };
  const call = await getOpenGrantCall();
  if (!call) return { status: "no-open-call" };
  const row = await findApplication(call.id, submission.id);
  return { status: "ready", call, submissionId: submission.id, application: row ? toApplication(row) : null };
}

export class ApplicationError extends Error {
  constructor(readonly code: "not-available" | "already-submitted" | "invalid-sections") {
    super(code);
  }
}

// Keeps only the call's own sections, trimmed to the limit.
function cleanSections(call: GrantCall, sections: Record<string, string>) {
  return Object.fromEntries(
    call.sections.map((section) => [section.key, (sections[section.key] ?? "").slice(0, GRANT_SECTION_MAX)]),
  );
}

async function openApplicationContext(conversationId: string) {
  const state = await getApplicationState(conversationId);
  if (state.status !== "ready") throw new ApplicationError("not-available");
  if (state.application?.status === "submitted") throw new ApplicationError("already-submitted");
  return state;
}

export async function saveApplicationDraft(conversationId: string, sections: Record<string, string>) {
  const { call, submissionId } = await openApplicationContext(conversationId);
  const values = cleanSections(call, sections);
  const [row] = await getDb()
    .insert(grantApplications)
    .values({ callId: call.id, submissionId, sections: values })
    .onConflictDoUpdate({
      target: [grantApplications.callId, grantApplications.submissionId],
      set: { sections: values },
    })
    .returning();
  return toApplication(row);
}

export async function submitApplication(conversationId: string, sections: Record<string, string>) {
  const { call } = await openApplicationContext(conversationId);
  const values = cleanSections(call, sections);
  if (Object.values(values).every((text) => !text.trim())) throw new ApplicationError("invalid-sections");
  const draft = await saveApplicationDraft(conversationId, values);
  const [row] = await getDb()
    .update(grantApplications)
    .set({ status: "submitted", submittedAt: new Date() })
    .where(eq(grantApplications.id, draft.id))
    .returning();
  return toApplication(row);
}

// Removes the call with its applications (FK cascade).
export async function deleteGrantCall(id: string) {
  const [row] = await getDb().delete(grantCalls).where(eq(grantCalls.id, id)).returning({ id: grantCalls.id });
  return row ?? null;
}
