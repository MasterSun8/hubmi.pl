"use client";

import { useEffect, useState } from "react";
import { ArrowButton } from "@/shared/components/arrow-button";
import { useChat } from "@/shared/components/chat/chat-provider";
import { formatAmount, formatCallDeadline } from "@/lib/grants/format";
import type { ApplicationState } from "@/types/grants";

// After the idea is handed off: if a grant call (nabór) is open today, invites the author
// to prepare an application from the canvas. Nothing shows when no call is open.
export function GrantCallBanner() {
  const { conversationId } = useChat();
  const [state, setState] = useState<ApplicationState | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    const controller = new AbortController();
    fetch(`/api/conversations/${conversationId}/application`, { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<{ data: ApplicationState }>) : null))
      .then((body) => body && setState(body.data))
      .catch(() => {});
    return () => controller.abort();
  }, [conversationId]);

  if (state?.status !== "ready") return null;
  const { call, application } = state;
  const submitted = application?.status === "submitted";

  return (
    <section
      className="flex flex-col items-start gap-2.5 border border-primary bg-surface p-7.5 max-sm:p-5 print:hidden"
      aria-labelledby="grant-call-title"
    >
      <p className="text-caption font-medium tracking-label-sm text-primary uppercase">
        Trwa nabór · do {formatCallDeadline(call.endsOn)}
        {call.maxAmount ? ` · do ${formatAmount(call.maxAmount)}` : ""}
      </p>
      <h2 id="grant-call-title" className="text-card-title font-light">
        {call.title}
      </h2>
      <p className="max-w-[60ch]">
        {submitted
          ? "Twój wniosek w tym naborze został złożony. Możesz go przejrzeć."
          : "Możesz zdobyć pieniądze na swój pomysł. Asystent przygotuje wniosek na podstawie kanwy, a Ty go poprawisz i złożysz."}
      </p>
      <div className="pt-2.5">
        <ArrowButton href="/zaoferuj-pomoc/wniosek">
          {submitted ? "Zobacz\nwniosek" : application ? "Wróć do\nwniosku" : "Przygotuj\nwniosek"}
        </ArrowButton>
      </div>
    </section>
  );
}
