import { streamChat } from "@/lib/server/ai/chat";
import {
  createConversation,
  getConversation,
  isConversationId,
  loadHistory,
  saveMessage,
} from "@/lib/server/chat/history";
import type { ChatEvent, ChatMessage, ChatRequest, SolutionRef } from "@/types/chat";

// How many stored messages the model sees; older ones are dropped.
const MAX_HISTORY_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 8_000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRequest(body);
  if (!parsed) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  let conversationId: string;
  let history: ChatMessage[];
  try {
    if (parsed.conversationId) {
      const conversation = await getConversation(parsed.conversationId);
      if (!conversation) {
        return Response.json({ error: "Conversation not found" }, { status: 404 });
      }
      // A submitted conversation is the basis of a submission; keep it frozen.
      if (conversation.status === "submitted") {
        return Response.json({ error: "Conversation already submitted" }, { status: 409 });
      }
      conversationId = conversation.id;
    } else {
      conversationId = (await createConversation()).id;
    }

    // Saved before the model runs, so the question survives a failed answer
    // and the next turn still sees it.
    await saveMessage(conversationId, "user", parsed.message);
    history = await loadHistory(conversationId, MAX_HISTORY_MESSAGES);
  } catch (err) {
    console.error("[chat] history storage failed", err);
    return Response.json({ error: "Storage unavailable" }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, event: ChatEvent) =>
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

  const stream = new ReadableStream({
    async start(controller) {
      send(controller, { type: "conversation", id: conversationId });

      let answer = "";
      const sources: SolutionRef[] = [];

      try {
        for await (const event of streamChat(history, request.signal)) {
          if (event.type === "delta") answer += event.text;
          if (event.type === "sources") sources.push(...event.items);
          // Persist before `done`, so a client that reloads right after it
          // gets the answer from GET /api/conversations/[id].
          if (event.type === "done") await saveAnswer(conversationId, answer, sources);
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

// The user already has the answer on screen, so a failed write is logged
// rather than turned into an error event.
async function saveAnswer(conversationId: string, answer: string, sources: SolutionRef[]) {
  try {
    await saveMessage(conversationId, "assistant", answer, sources.length > 0 ? { sources } : {});
  } catch (err) {
    console.error("[chat] failed to save assistant message", err);
  }
}

// Returns null for anything that doesn't match ChatRequest.
function parseRequest(body: unknown): ChatRequest | null {
  const { conversationId, message } = (body ?? {}) as Partial<ChatRequest>;

  if (typeof message !== "string" || message.trim() === "") return null;
  if (message.length > MAX_CONTENT_LENGTH) return null;
  if (conversationId !== undefined && !isConversationId(conversationId)) return null;

  return { conversationId, message };
}
