import type { ChatEvent, ChatRequest, ConversationResponse } from "@/types/chat";

// Client for POST /api/chat: sends one user message and yields the ChatEvent
// stream (Server-Sent Events, one JSON event per `data:` line).
export async function* sendChatMessage(request: ChatRequest, signal?: AbortSignal): AsyncGenerator<ChatEvent> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok || !response.body) {
    yield { type: "error", message: errorMessageFor(response.status) };
    return;
  }

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    // Events are separated by a blank line; the last chunk may be incomplete.
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const event of events) {
      const data = event
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trim())
        .join("");
      if (data) yield JSON.parse(data) as ChatEvent;
    }
  }
}

// GET /api/conversations/[id]: restores a chat after a page reload.
export async function fetchConversation(id: string): Promise<ConversationResponse | null> {
  const response = await fetch(`/api/conversations/${id}`);
  return response.ok ? ((await response.json()) as ConversationResponse) : null;
}

function errorMessageFor(status: number) {
  if (status === 409) return "Ta rozmowa została już przekazana. Zacznij nową, aby kontynuować.";
  if (status === 404) return "Nie znaleziono rozmowy. Odśwież stronę, aby zacząć nową.";
  return "Asystent jest chwilowo niedostępny. Spróbuj ponownie za chwilę.";
}

export type SubmissionRequest = {
  conversationId: string;
  type: "problem" | "idea";
  title: string;
  summary: string;
  location: string;
  submitter: { email?: string; phone?: string };
};

// POST /api/submissions: hands the conversation over with the contact details.
// Returns null on success, otherwise a message to show in the form.
export async function createSubmission(body: SubmissionRequest): Promise<string | null> {
  try {
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok || response.status === 409) return null; // 409: this conversation was already submitted.
    if (response.status === 400) return "Sprawdź wpisane dane i spróbuj ponownie.";
    if (response.status === 404) return "Nie znaleziono rozmowy. Odśwież stronę i spróbuj ponownie.";
    return "Nie udało się wysłać zgłoszenia. Spróbuj ponownie za chwilę.";
  } catch {
    return "Nie udało się wysłać zgłoszenia. Sprawdź połączenie z internetem.";
  }
}
