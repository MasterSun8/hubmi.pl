"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { ConversationResponse } from "@/types/chat";
import type { Submission, SubmissionStatus } from "../../components/submissions-provider";

// GET /api/submissions/[id] does not return contact details yet; when it adds a
// `submitter` object the contact section picks it up without further changes.
export type SubmissionDetails = Submission & {
  submitter?: { fullName?: string | null; email?: string | null; phone?: string | null } | null;
};

type DetailsState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; submission: SubmissionDetails; conversation: ConversationResponse | null };

type DetailsContextValue = {
  state: DetailsState;
  // PATCH /api/submissions/[id]; resolves to an error message, or null on success.
  updateStatus: (status: SubmissionStatus) => Promise<string | null>;
};

const DetailsContext = createContext<DetailsContextValue | null>(null);

function useDetailsContext() {
  const value = use(DetailsContext);
  if (!value) throw new Error("useSubmissionDetails must be used inside <SubmissionDetailsProvider>");
  return value;
}

export function useSubmissionDetails() {
  return useDetailsContext().state;
}

export function useUpdateStatus() {
  return useDetailsContext().updateStatus;
}

export function SubmissionDetailsProvider({ id, children }: { id: string; children: ReactNode }) {
  const [state, setState] = useState<DetailsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      const response = await fetch(`/api/submissions/${id}`, { signal });
      if (response.status === 404) return setState({ status: "not-found" });
      if (!response.ok) throw new Error(`Submission request failed: ${response.status}`);
      const { data: submission } = (await response.json()) as { data: SubmissionDetails };

      // The conversation is extra context; the page still works without it.
      const conversationResponse = await fetch(`/api/conversations/${submission.conversationId}`, { signal });
      const conversation = conversationResponse.ok ? ((await conversationResponse.json()) as ConversationResponse) : null;
      setState({ status: "ready", submission, conversation });
    }

    load().catch((error: unknown) => {
      if (!signal.aborted) {
        console.error(error);
        setState({ status: "error" });
      }
    });
    return () => controller.abort();
  }, [id]);

  async function updateStatus(status: SubmissionStatus) {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return "Nie udało się zmienić statusu. Spróbuj ponownie.";
      setState((current) =>
        current.status === "ready" ? { ...current, submission: { ...current.submission, status } } : current,
      );
      return null;
    } catch {
      return "Nie udało się zmienić statusu. Sprawdź połączenie z internetem.";
    }
  }

  return <DetailsContext value={{ state, updateStatus }}>{children}</DetailsContext>;
}

// Renders children only once the submission has loaded; otherwise the loading or error message.
export function WhenLoaded({ children }: { children: ReactNode }) {
  const state = useSubmissionDetails();
  if (state.status === "loading") return <p aria-live="polite">Ładowanie zgłoszenia…</p>;
  if (state.status === "not-found") return <p role="alert">Nie znaleziono takiego zgłoszenia.</p>;
  if (state.status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać zgłoszenia. Spróbuj odświeżyć stronę.
      </p>
    );
  }
  return children;
}

// Narrowed access for components rendered inside <WhenLoaded>.
export function useLoadedSubmission() {
  const state = useSubmissionDetails();
  if (state.status !== "ready") throw new Error("useLoadedSubmission must be used inside <WhenLoaded>");
  return state;
}
