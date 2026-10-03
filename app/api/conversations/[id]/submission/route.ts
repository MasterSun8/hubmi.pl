import { getId, parseBody, route, type IdContext } from "@/server/http";
import { submitConversation } from "@/server/services/submissions";
import { submitBody } from "@/server/validation";

// Wysłanie zgłoszenia: wymaga lokalizacji i kontaktu (z jawnych pól formularza, nie z modelu).
export const POST = route(async (request, context: IdContext) => {
  const id = await getId(context);
  const body = await parseBody(request, submitBody);
  return Response.json(await submitConversation(id, body), { status: 201 });
});
