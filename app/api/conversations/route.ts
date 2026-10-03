import { HttpError, route } from "@/server/http";
import { createConversation } from "@/server/services/conversations";
import { createConversationBody } from "@/server/validation";

// Body opcjonalne: { flow?: "unknown" | "help" | "idea" }.
export const POST = route(async (request) => {
  const text = await request.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
  const { flow } = createConversationBody.parse(json);
  return Response.json(await createConversation(flow), { status: 201 });
});
