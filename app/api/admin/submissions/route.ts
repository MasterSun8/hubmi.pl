import { parseQuery, requireAdmin, route } from "@/server/http";
import { listSubmissions } from "@/server/services/submissions";
import { adminSubmissionQuery } from "@/server/validation";

export const GET = route(async (request) => {
  requireAdmin(request);
  return Response.json(await listSubmissions(parseQuery(request, adminSubmissionQuery)));
});
