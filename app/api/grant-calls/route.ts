import { createGrantCall, createGrantCallSchema, listGrantCalls } from "@/lib/server/grants";

// GET  /api/grant-calls → every call (nabór), newest deadline first, with submitted application counts
// POST /api/grant-calls → creates a call (admin panel)
export async function GET() {
  try {
    return Response.json({ data: await listGrantCalls() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[grant-calls] list failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const parsed = createGrantCallSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid grant call", issues: parsed.error.issues }, { status: 400 });

  try {
    return Response.json({ data: await createGrantCall(parsed.data) }, { status: 201 });
  } catch (err) {
    console.error("[grant-calls] create failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}
