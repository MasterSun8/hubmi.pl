import { getId, route, type IdContext } from "@/server/http";
import { getConversation } from "@/server/services/conversations";

// PoC: identyfikator rozmowy (UUID) działa jak klucz dostępu. Docelowo sesja użytkownika.
export const GET = route(async (_request, context: IdContext) => {
  return Response.json(await getConversation(await getId(context)));
});
