import { parseQuery, route } from "@/server/http";
import { submissionStats } from "@/server/services/submissions";
import { statsQuery } from "@/server/validation";

// Dane do mapy problemów i trendów.
export const GET = route(async (request) => {
  return Response.json(await submissionStats(parseQuery(request, statsQuery)));
});
