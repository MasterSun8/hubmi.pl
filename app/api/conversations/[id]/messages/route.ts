import { getId, parseBody, route, type IdContext } from "@/server/http";
import { postUserMessage } from "@/server/services/conversations";
import { postMessageBody } from "@/server/validation";

// Wiadomość użytkownika → RAG → odpowiedź asystenta. TODO: streaming (SSE) po wdrożeniu OpenAI.
export const POST = route(async (request, context: IdContext) => {
  const id = await getId(context);
  const { content } = await parseBody(request, postMessageBody);
  return Response.json(await postUserMessage(id, content), { status: 201 });
});
