"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Markdown } from "@/shared/components/markdown";
import { enter } from "@/shared/components/motion/enter";
import { useChat } from "./chat-provider";
import { InitiativeCard } from "./initiative-card";

const authorClass = "text-caption leading-(--text-body--line-height) font-medium tracking-label-sm uppercase";
const dotClass = "size-2 rounded-full bg-primary animate-typing motion-reduce:animate-typing-fade";

export function MessageList() {
  const { messages, thinking, waiting } = useChat();
  const endRef = useRef<HTMLDivElement>(null);
  const lastLength = messages.at(-1)?.content.length;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, lastLength, thinking]);

  return (
    <>
      {/* Screen readers hear finished turns only, not every streamed token. */}
      <ol className="m-0 flex list-none flex-col gap-5 p-0" aria-live="polite" aria-busy={waiting}>
        {messages.map((message) => (
          <motion.li key={message.id} className="flex flex-col items-start" {...enter()}>
            <p className={`${authorClass} ${message.role === "assistant" ? "text-primary" : ""}`}>
              {message.role === "assistant" ? "Asystent Hubmi" : "Ty"}
            </p>
            {message.role === "assistant" && !message.error ? (
              <Markdown>{message.content}</Markdown>
            ) : (
              <p className={`max-w-[60ch] whitespace-pre-wrap ${message.error ? "text-error" : ""}`} role={message.error ? "alert" : undefined}>
                {message.content}
              </p>
            )}
            {message.sources && message.sources.length > 0 && (
              <ul className="m-0 mt-2.5 flex list-none flex-col gap-2.5 p-0" aria-label="Rozwiązania z bazy">
                {message.sources.map((solution, index) => (
                  <li key={solution.id}>
                    <InitiativeCard solution={solution} index={index} />
                  </li>
                ))}
              </ul>
            )}
          </motion.li>
        ))}
        <AnimatePresence>
          {thinking && (
            <motion.li
              key="typing"
              className="flex flex-col items-start"
              {...enter(1, { y: 8 })}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <p className={`${authorClass} text-primary`}>Asystent Hubmi</p>
              <p className="flex h-(--text-body--line-height) items-center gap-1.5">
                <span className="sr-only">Asystent pisze…</span>
                <span className={dotClass} aria-hidden="true" />
                <span className={`${dotClass} [animation-delay:0.15s]`} aria-hidden="true" />
                <span className={`${dotClass} [animation-delay:0.3s]`} aria-hidden="true" />
              </p>
            </motion.li>
          )}
        </AnimatePresence>
      </ol>
      <div ref={endRef} />
    </>
  );
}
