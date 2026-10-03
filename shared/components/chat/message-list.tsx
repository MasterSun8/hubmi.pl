"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import { enter } from "@/shared/components/motion/enter";
import { useChat } from "./chat-provider";
import { InitiativeCard } from "./initiative-card";

const authorClass = "text-caption leading-(--text-body--line-height) font-medium tracking-label-sm uppercase";
const dotClass = "size-2 rounded-full bg-primary animate-typing motion-reduce:animate-typing-fade";

export function MessageList() {
  const { messages, waiting } = useChat();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, waiting]);

  return (
    <>
      <ol className="m-0 flex list-none flex-col gap-5 p-0" aria-live="polite">
        {messages.map((message) => (
          <motion.li key={message.id} className="flex flex-col items-start" {...enter()}>
            <p className={`${authorClass} ${message.role === "assistant" ? "text-primary" : ""}`}>
              {message.role === "assistant" ? "Asystent Hubmi" : "Ty"}
            </p>
            <p className="max-w-[60ch] whitespace-pre-wrap">{message.content}</p>
            {message.suggestion && <InitiativeCard suggestion={message.suggestion} />}
          </motion.li>
        ))}
        <AnimatePresence>
          {waiting && (
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
