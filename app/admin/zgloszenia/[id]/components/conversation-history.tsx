"use client";

import { Markdown } from "@/shared/components/markdown";
import { plural } from "../../components/submissions-provider";
import { useLoadedSubmission } from "./submission-details-provider";

const time = (iso: string) => new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
const date = (iso: string) => new Date(iso).toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });

// Figma 16:1561 — the full chat transcript behind the submission.
export function ConversationHistory() {
  const { submission, conversation } = useLoadedSubmission();

  if (!conversation || conversation.messages.length === 0) {
    return (
      <>
        <h2 className="text-subtitle font-light">Historia rozmowy</h2>
        <p className="text-caption">Brak zapisanej rozmowy. Opis z formularza:</p>
        <p className="max-w-[60ch] whitespace-pre-wrap">{submission.summary}</p>
      </>
    );
  }

  const { messages } = conversation;
  const ended = conversation.status === "submitted" ? " · rozmowa zakończona wysłaniem zgłoszenia" : "";

  return (
    <>
      <h2 className="text-subtitle font-light">Historia rozmowy</h2>
      <p className="text-caption">
        {messages.length} {plural(messages.length, "wiadomość", "wiadomości", "wiadomości")} · {date(messages[0].createdAt)}
        {ended}
      </p>
      <ol className="m-0 flex list-none flex-col gap-6.5 p-0">
        {messages.map((message) => (
          <li key={message.id}>
            <p
              className={`text-caption font-medium tracking-caption uppercase ${message.role === "assistant" ? "text-primary" : ""}`}
            >
              {message.role === "assistant" ? "Asystent Hubmi" : "Mieszkaniec"} · {time(message.createdAt)}
            </p>
            {message.role === "assistant" ? (
              <Markdown>{message.content}</Markdown>
            ) : (
              <p className="max-w-[60ch] whitespace-pre-wrap">{message.content}</p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
