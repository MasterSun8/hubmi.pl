"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useChat } from "@/shared/components/chat/chat-provider";
import { IdeaStageBar, ideaStageLabels, type IdeaStage } from "@/shared/components/idea-stage";

type IdeaCard = {
  title: string | null;
  summary: string | null;
  essence: string | null;
  targetGroup: string | null;
  stage: IdeaStage | null;
};

const labelClass = "text-caption font-medium tracking-label-sm uppercase";

// A value fades in whenever the AI fills or rewrites it.
function Value({ text }: { text: string | null }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.dd
        key={text ?? "empty"}
        className={text ? "m-0" : "m-0 text-muted"}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.5, 0, 0.2, 1] }}
      >
        {text ?? "Uzupełni się w trakcie rozmowy"}
      </motion.dd>
    </AnimatePresence>
  );
}

function StageMeter({ stage }: { stage: IdeaStage | null }) {
  return (
    <dd className="m-0 flex flex-col gap-2">
      <span className={stage ? "" : "text-muted"}>{stage ? ideaStageLabels[stage] : "Uzupełni się w trakcie rozmowy"}</span>
      <IdeaStageBar stage={stage} />
    </dd>
  );
}

// Live idea card (fiszka) next to the "Zaoferuj pomoc" conversation: after every finished
// answer the AI redrafts it from the whole conversation (GET /api/conversations/[id]/idea-card).
export function IdeaCardPanel() {
  const { conversationId, messages, waiting } = useChat();
  const [card, setCard] = useState<{ conversationId: string; data: IdeaCard } | null>(null);
  // Which state of the conversation the card was last drafted for.
  const [draftedFor, setDraftedFor] = useState<string | null>(null);
  const lastMessage = messages.at(-1);
  const answered = !waiting && lastMessage?.role === "assistant" && !lastMessage.error && messages.length > 1;
  const draftKey = answered && conversationId ? `${conversationId}:${messages.length}` : null;
  const updating = draftKey !== null && draftKey !== draftedFor;

  useEffect(() => {
    if (!draftKey || !conversationId) return;
    const controller = new AbortController();
    fetch(`/api/conversations/${conversationId}/idea-card`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<{ data: IdeaCard | null }>) : null))
      .then((body) => {
        if (body?.data) setCard({ conversationId, data: body.data });
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setDraftedFor(draftKey);
      });
    return () => controller.abort();
  }, [draftKey, conversationId]);

  // A new conversation starts with an empty card.
  const visibleCard = card && card.conversationId === conversationId ? card.data : null;

  return (
    <section
      className="flex w-full flex-col gap-5 border border-primary bg-surface p-5"
      aria-labelledby="idea-card-title"
      aria-busy={updating}
    >
      <div className="flex items-center justify-between gap-2.5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Twoja fiszka</p>
        {updating && (
          <p className="flex items-center gap-1.5 text-caption text-muted">
            <span className="size-1.5 animate-typing-fade rounded-full bg-primary" aria-hidden="true" />
            Aktualizuję
          </p>
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.h2
          key={visibleCard?.title ?? "empty"}
          id="idea-card-title"
          className={`text-card-title font-light ${visibleCard?.title ? "" : "text-muted"}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.5, 0, 0.2, 1] }}
        >
          {visibleCard?.title ?? "Nazwa Twojego pomysłu"}
        </motion.h2>
      </AnimatePresence>
      <dl className="m-0 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <dt className={labelClass}>Krótki opis</dt>
          <Value text={visibleCard?.summary ?? null} />
        </div>
        <div className="flex flex-col gap-1">
          <dt className={labelClass}>Istota pomysłu</dt>
          <Value text={visibleCard?.essence ?? null} />
        </div>
        <div className="flex flex-col gap-1">
          <dt className={labelClass}>Dla kogo</dt>
          <Value text={visibleCard?.targetGroup ?? null} />
        </div>
        <div className="flex flex-col gap-1">
          <dt className={labelClass}>Etap realizacji</dt>
          <StageMeter stage={visibleCard?.stage ?? null} />
        </div>
      </dl>
      {conversationId && (
        <div className="flex flex-col gap-1 border-t border-line pt-4">
          <Link href="/zaoferuj-pomoc/kanwa" className="font-medium text-primary">
            Rozpisz pomysł na kanwie <span aria-hidden="true">→</span>
          </Link>
          <p className="text-caption text-muted">Asystent wypełni ją z rozmowy, a Ty poprawisz każde pole.</p>
        </div>
      )}
    </section>
  );
}
