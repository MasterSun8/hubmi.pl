import { after } from "next/server";
import { enrichSubmission } from "@/lib/server/ai/enrich-submission";
import {
  createSubmission,
  createSubmissionSchema,
  listSubmissions,
} from "@/lib/server/submissions";

const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = parseInteger(url.searchParams.get("limit"), 20);
  const offset = parseInteger(url.searchParams.get("offset"), 0);
  const status = url.searchParams.get("status") as
    | "new"
    | "in_review"
    | "in_progress"
    | "resolved"
    | "rejected"
    | null;
  const type = url.searchParams.get("type") as "problem" | "idea" | null;

  if (limit < 1 || limit > MAX_LIMIT || offset < 0) {
    return Response.json({ error: "Invalid pagination" }, { status: 400 });
  }
  if (status && !["new", "in_review", "in_progress", "resolved", "rejected"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }
  if (type && !["problem", "idea"].includes(type)) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  try {
    const data = await listSubmissions({ limit, offset, status: status ?? undefined, type: type ?? undefined });
    return Response.json({ data, limit, offset }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[submissions] list failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const submission = await createSubmission(parsed.data);
    if (!submission) return Response.json({ error: "Conversation not found" }, { status: 404 });
    if (submission === "already_submitted") {
      return Response.json({ error: "Conversation already submitted" }, { status: 409 });
    }

    // AI summary and embedding take a few seconds; the user shouldn't wait.
    after(() =>
      enrichSubmission(submission.id).catch((err) =>
        console.error(`[submissions] enrichment failed for ${submission.id}`, err),
      ),
    );

    return Response.json(
      { data: { id: submission.id, status: submission.status, createdAt: submission.createdAt } },
      { status: 201 },
    );
  } catch (err) {
    console.error("[submissions] create failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

function parseInteger(value: string | null, fallback: number) {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  return Number(value);
}
