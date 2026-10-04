"use client";

import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { fetchConversation, sendChatMessage } from "@/lib/chat/chat-client";
import type { ChatFlow, ChatMessage, SolutionRef } from "@/types/chat";

export type ChatFlowId = "problem" | "pomoc";

// The page path maps to the conversation flow stored in the database.
const apiFlow: Record<ChatFlowId, ChatFlow> = { problem: "help", pomoc: "idea" };

export type ConversationMessage = ChatMessage & {
  id: string;
  sources?: SolutionRef[];
  // Set on an assistant turn that failed; the text is the error shown to the user.
  error?: boolean;
};

type ChatState = {
  messages: ConversationMessage[];
  // Database id of the conversation, known after the first answer starts.
  conversationId: string | null;
  started: boolean;
  // True from sending until the answer has finished streaming.
  waiting: boolean;
  // True until the first token of the answer arrives (shows the typing dots).
  thinking: boolean;
  sent: boolean;
  dialogOpen: boolean;
  send: (text: string) => Promise<void>;
  // Fields for POST /api/submissions that come from the conversation itself.
  submissionDraft: () => SubmissionDraft | null;
  openDialog: () => void;
  closeDialog: () => void;
  markSent: () => void;
  // Clears the chat and returns to the start screen, so another submission can be made.
  startNew: () => void;
  // Button text for startNew, e.g. "Nowy problem".
  newConversationLabel: string;
};

export type SubmissionDraft = {
  conversationId: string;
  type: "problem" | "idea";
  title: string;
  summary: string;
};

const ChatContext = createContext<ChatState | null>(null);

const TITLE_MAX = 120;

// The first sentence of the user's first message, shortened to fit a title.
function titleFrom(text: string) {
  const firstSentence = text.trim().split(/(?<=[.!?])\s/)[0];
  return firstSentence.length > TITLE_MAX ? `${firstSentence.slice(0, TITLE_MAX - 1).trimEnd()}…` : firstSentence;
}

export function useChat() {
  const chat = use(ChatContext);
  if (!chat) throw new Error("useChat must be used inside <ChatProvider>");
  return chat;
}

type ChatProviderProps = {
  flowId: ChatFlowId;
  // Shown as the assistant's first message; it is UI copy, not part of the stored conversation.
  firstQuestion: string;
  newConversationLabel: string;
  children: ReactNode;
};

// The conversation id is kept per tab and path, so a reload restores the chat.
const storageKey = (flowId: ChatFlowId) => `hubmi-chat-${flowId}`;

function readStoredId(flowId: ChatFlowId) {
  try {
    return sessionStorage.getItem(storageKey(flowId));
  } catch {
    return null;
  }
}

function storeId(flowId: ChatFlowId, id: string | null) {
  try {
    if (id) sessionStorage.setItem(storageKey(flowId), id);
    else sessionStorage.removeItem(storageKey(flowId));
  } catch {}
}

export function ChatProvider({ flowId, firstQuestion, newConversationLabel, children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const conversationId = useRef<string | null>(null);
  // Mirror of the ref for rendering (the ref is read in send() without waiting for a render).
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const setConversationId = (id: string | null) => {
    conversationId.current = id;
    setCurrentConversationId(id);
  };
  const localId = useRef(0);
  const nextLocalId = () => `local-${localId.current++}`;
  const greeting = (): ConversationMessage => ({ id: "greeting", role: "assistant", content: firstQuestion });

  useEffect(() => {
    const storedId = readStoredId(flowId);
    if (!storedId) return;
    let cancelled = false;
    fetchConversation(storedId)
      .then((conversation) => {
        if (cancelled) return;
        if (!conversation || conversation.messages.length === 0) {
          storeId(flowId, null);
          return;
        }
        setConversationId(conversation.id);
        setMessages([greeting(), ...conversation.messages]);
        setSent(conversation.status === "submitted");
      })
      .catch(() => storeId(flowId, null));
    return () => {
      cancelled = true;
    };
    // Restore once on mount; the greeting text is static for the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowId]);

  async function send(text: string) {
    const answerId = nextLocalId();
    setMessages((current) => [
      ...(current.length === 0 ? [greeting()] : current),
      { id: nextLocalId(), role: "user", content: text },
    ]);
    setWaiting(true);
    setThinking(true);

    const updateAnswer = (patch: (answer: ConversationMessage) => ConversationMessage) =>
      setMessages((current) => {
        const exists = current.some((message) => message.id === answerId);
        const base: ConversationMessage = { id: answerId, role: "assistant", content: "" };
        return exists
          ? current.map((message) => (message.id === answerId ? patch(message) : message))
          : [...current, patch(base)];
      });

    try {
      for await (const event of sendChatMessage({
        conversationId: conversationId.current ?? undefined,
        message: text,
        flow: apiFlow[flowId],
      })) {
        if (event.type === "conversation") {
          setConversationId(event.id);
          storeId(flowId, event.id);
        } else if (event.type === "delta") {
          setThinking(false);
          updateAnswer((answer) => ({ ...answer, content: answer.content + event.text }));
        } else if (event.type === "sources") {
          updateAnswer((answer) => ({ ...answer, sources: [...(answer.sources ?? []), ...event.items] }));
        } else if (event.type === "error") {
          updateAnswer((answer) => ({ ...answer, content: event.message, error: true }));
        }
      }
    } catch {
      updateAnswer((answer) => ({
        ...answer,
        content: "Asystent jest chwilowo niedostępny. Spróbuj ponownie za chwilę.",
        error: true,
      }));
    } finally {
      setThinking(false);
      setWaiting(false);
    }
  }

  function submissionDraft(): SubmissionDraft | null {
    const userMessages = messages.filter((message) => message.role === "user").map((message) => message.content);
    if (!conversationId.current || userMessages.length === 0) return null;
    return {
      conversationId: conversationId.current,
      type: flowId === "problem" ? "problem" : "idea",
      title: titleFrom(userMessages[0]),
      // What the user wrote; the full conversation stays linked by conversationId.
      summary: userMessages.join("\n\n").slice(0, 20_000),
    };
  }

  return (
    <ChatContext
      value={{
        messages,
        conversationId: currentConversationId,
        started: messages.length > 0,
        waiting,
        thinking,
        sent,
        dialogOpen,
        send,
        submissionDraft,
        openDialog: () => setDialogOpen(true),
        closeDialog: () => setDialogOpen(false),
        markSent: () => setSent(true),
        startNew: () => {
          setConversationId(null);
          storeId(flowId, null);
          setMessages([]);
          setSent(false);
          setDialogOpen(false);
          window.scrollTo({ top: 0 });
        },
        newConversationLabel,
      }}
    >
      {children}
    </ChatContext>
  );
}

// Renders its children only before (intro) or after (conversation) the first message.
export function ChatStage({ stage, children }: { stage: "intro" | "conversation"; children: ReactNode }) {
  const { started } = useChat();
  return started === (stage === "conversation") ? children : null;
}
