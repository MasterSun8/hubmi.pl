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
      <label className="text-caption font-medium tracking-label-sm uppercase max-lg:sr-only" htmlFor={fieldId}>
        Twoja wiadomość
      </label>
      <div className="flex items-center gap-5 max-lg:gap-2.5">
        <textarea
          id={fieldId}
          className="field-sizing-content max-h-65 min-h-22.5 flex-1 resize-none rounded-input border border-field bg-transparent p-5 text-ink max-lg:max-h-32 max-lg:min-h-12 max-lg:px-4 max-lg:py-2.5 transition-colors placeholder:text-muted focus:border-primary focus:outline-none"
          value={text}
          placeholder={placeholder}
          rows={2}
          autoFocus={autoFocus}
          aria-describedby={hintId}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="flex cursor-pointer flex-col items-start gap-2.5 border-0 bg-transparent p-0 text-caption font-medium tracking-label-sm text-primary uppercase disabled:opacity-50" disabled={!canSend}>
          <svg className="size-17.5 max-lg:size-12" viewBox="0 0 70 70" fill="none" aria-hidden="true" focusable="false">
            <path d="M35 69.5C54.0538 69.5 69.5 54.0538 69.5 35C69.5 15.9462 54.0538 0.5 35 0.5C15.9462 0.5 0.5 15.9462 0.5 35C0.5 54.0538 15.9462 69.5 35 69.5Z" stroke="currentColor" />
            <path d="M20 35H50M42 43L50 35L42 27" stroke="currentColor" />
          </svg>
          <span className="max-lg:sr-only">Wyślij</span>
        </button>
      </div>
      <p id={hintId} className="text-caption max-lg:sr-only">
        {sent ? "Rozmowa została przekazana." : hint}
      </p>
    </form>
  );
}
