"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { GrantApplicationListItem, GrantCall } from "@/types/grants";

export type CallDetails = GrantCall & { applications: GrantApplicationListItem[] };

type DetailsState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; call: CallDetails };

const CallDetailsContext = createContext<DetailsState | null>(null);

function useCallDetails() {
  const state = use(CallDetailsContext);
  if (!state) throw new Error("useCallDetails must be used inside <CallDetailsProvider>");
  return state;
}

export function CallDetailsProvider({ id, children }: { id: string; children: ReactNode }) {
  const [state, setState] = useState<DetailsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/grant-calls/${id}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) return setState({ status: "not-found" });
        if (!response.ok) throw new Error(`Grant call request failed: ${response.status}`);
        const { data } = (await response.json()) as { data: CallDetails };
        setState({ status: "ready", call: data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, [id]);

  return <CallDetailsContext value={state}>{children}</CallDetailsContext>;
}

export function WhenCallLoaded({ children }: { children: ReactNode }) {
  const state = useCallDetails();
  if (state.status === "loading") return <p aria-live="polite">Ładowanie naboru…</p>;
  if (state.status === "not-found") return <p role="alert">Nie znaleziono takiego naboru.</p>;
  if (state.status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać naboru. Spróbuj odświeżyć stronę.
      </p>
    );
  }
  return children;
}

// Narrowed access for components rendered inside <WhenCallLoaded>.
export function useLoadedCall() {
  const state = useCallDetails();
  if (state.status !== "ready") throw new Error("useLoadedCall must be used inside <WhenCallLoaded>");
  return state.call;
}
