import { z } from "zod";
import { ApplicationError } from "@/lib/server/grants";
import { GRANT_SECTION_MAX } from "@/types/grants";

// Shared by the application route handlers (route files may only export handlers).

export const SectionsBody = z.object({ sections: z.record(z.string(), z.string().max(GRANT_SECTION_MAX)) });

export function applicationErrorResponse(err: unknown, action: string) {
  if (err instanceof ApplicationError) {
    if (err.code === "already-submitted") return Response.json({ error: "Application already submitted" }, { status: 409 });
    if (err.code === "invalid-sections") return Response.json({ error: "Application is empty" }, { status: 400 });
    return Response.json({ error: "No open grant call for this idea" }, { status: 404 });
  }
  console.error(`[application] ${action} failed`, err);
  return Response.json({ error: "Storage unavailable" }, { status: 503 });
}
