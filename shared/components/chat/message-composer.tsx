"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { useChat } from "./chat-provider";

type MessageComposerProps = {
  placeholder: string;
  hint: string;
  autoFocus?: boolean;
};

export function MessageComposer({ placeholder, hint, autoFocus }: MessageComposerProps) {
  const { send, waiting, sent } = useChat();
  const [text, setText] = useState("");
  const disabled = waiting || sent;
  const fieldId = useId();
  const hintId = useId();
  const canSend = !disabled && text.trim().length > 0;

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend) return;
    void send(text.trim());
    setText("");
  }

  // Enter sends, Shift+Enter adds a new line, as in other chat tools.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <form className="flex flex-col gap-2.5" onSubmit={submit}>
      <label className="text-caption font-medium tracking-label-sm text-primary uppercase" htmlFor={fieldId}>
        Twoja wiadomość
      </label>
      <div className="flex flex-col gap-2.5">
        <textarea
          id={fieldId}
          className="field-sizing-content max-h-40 min-h-20 w-full resize-none rounded-input border border-field bg-surface p-5 text-ink max-lg:max-h-32 max-lg:min-h-12 max-lg:px-4 max-lg:py-2.5 transition-colors placeholder:text-muted focus:border-primary focus:outline-none"
          value={text}
          placeholder={placeholder}
          rows={2}
          disabled={sent}
          autoFocus={autoFocus}
          aria-describedby={hintId}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="submit"
            className="ml-auto inline-flex min-h-11 items-center justify-center gap-2.5 rounded-input border-0 bg-primary px-5 py-2.5 text-body font-medium text-on-primary hover:opacity-100! disabled:bg-muted disabled:opacity-60"
            disabled={!canSend}
          >
            {sent ? "Rozmowa przekazana" : waiting ? "Asystent odpowiada…" : "Wyślij wiadomość"}
            <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <p id={hintId} className="text-caption max-lg:sr-only">
        {sent ? "Rozmowa została przekazana." : hint}
      </p>
    </form>
  );
}
