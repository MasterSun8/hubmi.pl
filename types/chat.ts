// API contract for POST /api/chat and GET /api/conversations/[id], shared by
// backend and frontend.
// Keep this file free of runtime code and server-only imports.

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

// Which path the user picked: "help" = Zgłoś problem, "idea" = Zaoferuj pomoc.
export type ChatFlow = "help" | "idea";

// History lives on the server: the client sends only the new user message.
export type ChatRequest = {
  // Omit to start a new conversation; its id arrives in the `conversation` event.
  conversationId?: string;
  message: string;
  // Stored on the conversation when it is created; ignored for an existing one.
  flow?: ChatFlow;
};

export type SolutionRef = {
  id: string;
  title: string;
  url?: string;
};

// The response is a Server-Sent Events stream; each `data:` line is one
// JSON-encoded ChatEvent. The stream starts with `conversation` and always
// ends with `done` or `error`.
export type ChatEvent =
  | { type: "conversation"; id: string }
  | { type: "delta"; text: string }
  | { type: "sources"; items: SolutionRef[] }
  | { type: "done" }
  | { type: "error"; message: string };

export type StoredChatMessage = ChatMessage & {
  id: string;
  // Present on assistant messages that cited solutions.
  sources?: SolutionRef[];
  // ISO 8601.
  createdAt: string;
};

// Response of GET /api/conversations/[id], used to restore a chat after reload.
export type ConversationResponse = {
  id: string;
  status: "open" | "submitted" | "abandoned";
  messages: StoredChatMessage[];
};
