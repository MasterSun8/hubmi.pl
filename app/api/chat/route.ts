import { streamChat } from "@/lib/server/ai/chat";
import type { ChatEvent, ChatMessage, ChatRequest } from "@/types/chat";

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 8_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = parseMessages(body);
  if (!messages) {
    return Response.json({ error: "Invalid messages" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, event: ChatEvent) =>
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of streamChat(messages, request.signal)) {
          send(controller, event);
        }
      } catch (err) {
        // Client disconnected; nobody is listening for an error event.
        if (request.signal.aborted) return;
        console.error("[chat] request failed", err);
        send(controller, { type: "error", message: "Asystent jest chwilowo niedostępny." });
      } finally {
        if (!request.signal.aborted) controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// Returns null for anything that doesn't match ChatRequest, so the model
// never sees unvalidated roles (e.g. a client-injected "system" message).
function parseMessages(body: unknown): ChatMessage[] | null {
  const messages = (body as Partial<ChatRequest> | null)?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  if (messages.length > MAX_MESSAGES) return null;

  for (const m of messages) {
    if (m?.role !== "user" && m?.role !== "assistant") return null;
    if (typeof m.content !== "string" || m.content.trim() === "") return null;
    if (m.content.length > MAX_CONTENT_LENGTH) return null;
  }
  if (messages.at(-1)!.role !== "user") return null;

  return messages.map(({ role, content }) => ({ role, content }));
}
