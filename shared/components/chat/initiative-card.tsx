"use client";

import { motion } from "motion/react";
import type { InitiativeSuggestion } from "@/lib/chat/mock-assistant";

const linkClass = "text-cta font-medium tracking-label text-primary uppercase no-underline";

// Figma 15:811 — an initiative from the database suggested inside an assistant message.
export function InitiativeCard({ suggestion }: { suggestion: InitiativeSuggestion }) {
  return (
    <motion.article
      className="mt-2.5 flex max-w-111 flex-col items-start gap-2.5 border border-line bg-surface p-5"
      aria-label={`Sugestia z bazy: ${suggestion.title}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.5, 0, 0.2, 1], delay: 0.35 }}
    >
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Sugestia z bazy · przykład</p>
      <h3 className="text-card-title font-light">{suggestion.title}</h3>
      <p>{suggestion.description}</p>
      {suggestion.url ? (
        <a className={linkClass} href={suggestion.url}>
          Zobacz inicjatywę <span aria-hidden="true">→</span>
        </a>
      ) : (
        <span className={linkClass} aria-disabled="true">
          Zobacz inicjatywę <span aria-hidden="true">→</span>
        </span>
      )}
    </motion.article>
  );
}
