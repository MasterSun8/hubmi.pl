"use client";

import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowButton } from "@/shared/components/arrow-button";
import { useChat } from "./chat-provider";

const textButtonClass =
  "cursor-pointer border-0 bg-transparent p-0 text-caption font-medium tracking-label-sm text-ink uppercase disabled:opacity-50";

// Drops the current conversation without sending it, after the user confirms in a modal.
export function NewConversationButton() {
  const { waiting, startNew } = useChat();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // The native dialog gives focus trapping, Esc to close and an inert page behind it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      {/* Disabled while an answer streams, so it cannot land in the fresh conversation. */}
      <button type="button" className={textButtonClass} onClick={() => setOpen(true)} disabled={waiting}>
        Zacznij nową rozmowę
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto w-[min(560px,calc(100vw-40px))] overflow-visible border-0 bg-transparent p-0 text-ink backdrop:bg-overlay backdrop:transition-opacity backdrop:duration-300 backdrop:ease-brand starting:open:backdrop:opacity-0"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
      >
        <motion.div
          key={String(open)}
          className="flex flex-col items-start gap-5 bg-surface p-10 shadow-dialog hc:border hc:border-line max-sm:p-5"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.5, 0, 0.2, 1] }}
        >
          <h2 id={titleId} className="font-heading text-title text-primary">
            Czy na pewno zacząć od nowa?
          </h2>
          <p id={descriptionId}>
            Obecna rozmowa nie zostanie przekazana i zniknie z tego ekranu. Tej operacji nie można cofnąć.
          </p>
          <div className="pt-2.5">
            <ArrowButton
              onClick={() => {
                setOpen(false);
                startNew();
              }}
            >
              {"Tak, zacznij\nod nowa"}
            </ArrowButton>
          </div>
          <button type="button" className={textButtonClass} onClick={() => setOpen(false)} autoFocus>
            Wróć do rozmowy
          </button>
        </motion.div>
      </dialog>
    </>
  );
}
