"use client";

import { motion } from "motion/react";
import type { SolutionRef } from "@/types/chat";

const linkClass = "text-cta font-medium tracking-label text-primary uppercase no-underline";

// Figma 15:811 — a solution from the database (a RAG source) shown under the assistant's answer.
export function InitiativeCard({ solution, index = 0 }: { solution: SolutionRef; index?: number }) {
  return (
    <motion.article
      className="flex max-w-111 flex-col items-start gap-2.5 border border-line bg-surface p-5"
      aria-label={`Rozwiązanie z bazy: ${solution.title}`}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.5, 0, 0.2, 1], delay: 0.1 + index * 0.08 }}
    >
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Rozwiązanie z bazy</p>
      <h3 className="text-card-title font-light">{solution.title}</h3>
      {solution.url && (
        <a className={linkClass} href={solution.url} target="_blank" rel="noreferrer">
          Zobacz inicjatywę <span aria-hidden="true">→</span>
          <span className="sr-only"> (otwiera się w nowej karcie)</span>
        </a>
      )}
    </motion.article>
  );
}
