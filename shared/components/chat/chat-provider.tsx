"use client";

import { createContext, use, useRef, useState, type ReactNode } from "react";
import { getAssistantReply, type ChatFlowId, type InitiativeSuggestion } from "@/lib/chat/mock-assistant";
import type { ChatMessage } from "@/types/chat";

export type ConversationMessage = ChatMessage & { id: number; suggestion?: InitiativeSuggestion };

type ChatState = {
  messages: ConversationMessage[];
  started: boolean;
  waiting: boolean;
  sent: boolean;
  dialogOpen: boolean;
  send: (text: string) => Promise<void>;
  openDialog: () => void;
  closeDialog: () => void;
  markSent: () => void;
};

const ChatContext = createContext<ChatState | null>(null);

export function useChat() {
  const chat = use(ChatContext);
  if (!chat) throw new Error("useChat must be used inside <ChatProvider>");
  return chat;
}

type ChatProviderProps = {
  flowId: ChatFlowId;
  // Shown as the assistant's first message once the conversation starts.
  firstQuestion: string;
  children: ReactNode;
};

export function ChatProvider({ flowId, firstQuestion, children }: ChatProviderProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const nextId = useRef(0);

  async function send(text: string) {
    const history: ConversationMessage[] = [
      ...(messages.length === 0
        ? [{ id: nextId.current++, role: "assistant" as const, content: firstQuestion }]
        : messages),
      { id: nextId.current++, role: "user", content: text },
    ];
    setMessages(history);
    setWaiting(true);
    const reply = await getAssistantReply(flowId, history.map(({ role, content }) => ({ role, content })));
    setMessages((current) => [...current, { id: nextId.current++, role: "assistant", ...reply }]);
    setWaiting(false);
  }

  return (
    <ChatContext
      value={{
        messages,
        started: messages.length > 0,
        waiting,
        sent,
        dialogOpen,
        send,
        openDialog: () => setDialogOpen(true),
        closeDialog: () => setDialogOpen(false),
        markSent: () => setSent(true),
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
