import "server-only";
import type { ChatEvent, ChatMessage } from "@/types/chat";
import { getOpenAI } from "./client";
import { getAiConfig } from "./config";
import { SYSTEM_PROMPT } from "./prompts/system";

// Runs one assistant turn via the Responses API and translates the OpenAI
// stream into our ChatEvent protocol. Tool calls (save_submission, RAG) will
// plug in here as extra rounds; the route handler stays unaware of them.
export async function* streamChat(
  messages: ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<ChatEvent> {
  const { model } = getAiConfig();

  const stream = await getOpenAI().responses.create(
    {
      model,
      instructions: SYSTEM_PROMPT,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      // Stateless: the client resends history, nothing is kept at OpenAI.
      store: false,
    },
    { signal },
  );

  for await (const event of stream) {
    switch (event.type) {
      case "response.output_text.delta":
        yield { type: "delta", text: event.delta };
        break;
      case "response.completed":
        yield { type: "done" };
        return;
      case "response.incomplete":
      case "response.failed":
      case "error":
        console.error("[chat] OpenAI stream ended abnormally", event);
        yield { type: "error", message: "Asystent nie dokończył odpowiedzi." };
        return;
    }
  }

  // Stream closed without a terminal event.
  yield { type: "error", message: "Połączenie z asystentem zostało przerwane." };
}
