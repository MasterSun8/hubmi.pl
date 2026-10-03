import { getId, parseBody, route, type IdContext } from "@/server/http";
import { getSolution, retireSolution, updateSolution } from "@/server/services/solutions";
import { solutionPatch } from "@/server/validation";

export const GET = route(async (request, context: IdContext) => {
  return Response.json(await getSolution(await getId(context), { publishedOnly: false }));
});

// Zmiana treści automatycznie przelicza embedding.
export const PATCH = route(async (request, context: IdContext) => {
  const id = await getId(context);
  return Response.json(await updateSolution(id, await parseBody(request, solutionPatch)));
});

// Wycofanie (status = retired), nie fizyczne usunięcie.
export const DELETE = route(async (request, context: IdContext) => {
  return Response.json(await retireSolution(await getId(context)));
});
