import { parseQuery, route } from "@/server/http";
import { searchSolutions } from "@/server/services/solutions";
import { solutionSearchQuery } from "@/server/validation";

export const GET = route(async (request) => {
  const query = parseQuery(request, solutionSearchQuery);
  const items = await searchSolutions({ ...query, status: "published" });
  return Response.json({ items, limit: query.limit, offset: query.offset });
});
