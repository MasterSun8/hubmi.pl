// API contract for POST /api/chat, shared by backend and frontend.
// Keep this file free of runtime code and server-only imports.

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  // Stateless for now: the client sends the whole history on every request.
  messages: ChatMessage[];
  // Reserved for server-side history storage; ignored until then.
  conversationId?: string;
};

export type SolutionRef = {
  id: string;
  title: string;
  url?: string;
};

// The response is a Server-Sent Events stream; each `data:` line is one
// JSON-encoded ChatEvent. The stream always ends with `done` or `error`.
export type ChatEvent =
  | { type: "delta"; text: string }
  | { type: "sources"; items: SolutionRef[] }
  | { type: "done" }
  | { type: "error"; message: string };
