import { getId, route, type IdContext } from "@/server/http";
import { previewSubmission } from "@/server/services/submissions";

// Podsumowanie rozmowy do weryfikacji przez użytkownika przed wysłaniem.
export const POST = route(async (_request, context: IdContext) => {
  return Response.json(await previewSubmission(await getId(context)));
});
