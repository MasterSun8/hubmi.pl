import { getId, route, type IdContext } from "@/server/http";
import { getSolution } from "@/server/services/solutions";

// Karta rozwiązania (moduł 4).
export const GET = route(async (_request, context: IdContext) => {
  return Response.json(await getSolution(await getId(context), { publishedOnly: true }));
});
