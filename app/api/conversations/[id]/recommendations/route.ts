import { getId, parseBody, route, type IdContext } from "@/server/http";
import { createRecommendation } from "@/server/services/recommendations";
import { recommendationBody } from "@/server/validation";

// Moduł 7: rekomendacja wdrożenia wybranych rozwiązań.
export const POST = route(async (request, context: IdContext) => {
  const id = await getId(context);
  const body = await parseBody(request, recommendationBody);
  return Response.json(await createRecommendation(id, body), { status: 201 });
});
