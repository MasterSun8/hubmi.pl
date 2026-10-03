import { listGroups } from "@/lib/server/groups";

const TYPES = ["problem", "idea"] as const;
const STATUSES = ["new", "in_review", "in_progress", "resolved", "rejected"] as const;

// GET /api/groups?location=&type=&status=
// The fixed submission groups with counts. A group's submissions come from
// GET /api/submissions?category=<category>.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const location = url.searchParams.get("location")?.trim() || undefined;
  const type = oneOf(TYPES, url.searchParams.get("type"));
  const status = oneOf(STATUSES, url.searchParams.get("status"));

  if (type === null) return Response.json({ error: "Invalid type" }, { status: 400 });
  if (status === null) return Response.json({ error: "Invalid status" }, { status: 400 });

  try {
    const data = await listGroups({ location, type, status });
    return Response.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[groups] list failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }
}

// undefined when the param is absent, null when it is not an allowed value.
function oneOf<T extends string>(allowed: readonly T[], value: string | null): T | undefined | null {
  if (!value) return undefined;
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}
