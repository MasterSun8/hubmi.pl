import { parseBody, parseQuery, route } from "@/server/http";
import { createSolution, searchSolutions } from "@/server/services/solutions";
import { adminSolutionQuery, solutionInput } from "@/server/validation";

export const GET = route(async (request) => {
  const query = parseQuery(request, adminSolutionQuery);
  return Response.json({ items: await searchSolutions(query), limit: query.limit, offset: query.offset });
});

export const POST = route(async (request) => {
  return Response.json(await createSolution(await parseBody(request, solutionInput)), { status: 201 });
});
