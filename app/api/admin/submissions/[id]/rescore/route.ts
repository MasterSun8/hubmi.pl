import { getId, route, type IdContext } from "@/server/http";
import { rescoreSubmission } from "@/server/services/submissions";

export const POST = route(async (request, context: IdContext) => {
  return Response.json(await rescoreSubmission(await getId(context)));
});
