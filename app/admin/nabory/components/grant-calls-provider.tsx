"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { GrantCall, GrantCallListItem } from "@/types/grants";

export type NewGrantCall = Omit<GrantCall, "id">;

type GrantCallsState = {
  status: "loading" | "ready" | "error";
  calls: GrantCallListItem[];
  // POST /api/grant-calls; resolves to an error message, or null on success.
  createCall: (call: NewGrantCall) => Promise<string | null>;
};

const GrantCallsContext = createContext<GrantCallsState | null>(null);

export function useGrantCalls() {
  const state = use(GrantCallsContext);
  if (!state) throw new Error("useGrantCalls must be used inside <GrantCallsProvider>");
  return state;
}

export function GrantCallsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GrantCallsState["status"]>("loading");
  const [calls, setCalls] = useState<GrantCallListItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/grant-calls", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Grant calls request failed: ${response.status}`);
        return response.json() as Promise<{ data: GrantCallListItem[] }>;
      })
      .then((body) => {
        setCalls(body.data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  async function createCall(call: NewGrantCall) {
    try {
      const response = await fetch("/api/grant-calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(call),
      });
      if (response.status === 400) return "Sprawdź pola formularza: nazwa, daty i przynajmniej jedna sekcja są wymagane.";
      if (!response.ok) return "Nie udało się zapisać naboru. Spróbuj ponownie.";
      const { data } = (await response.json()) as { data: GrantCall };
      setCalls((current) => [{ ...data, submittedApplications: 0 }, ...current]);
      return null;
    } catch {
      return "Nie udało się zapisać naboru. Sprawdź połączenie z internetem.";
    }
  }

  return <GrantCallsContext value={{ status, calls, createCall }}>{children}</GrantCallsContext>;
}

export function WhenCallsLoaded({ children }: { children: ReactNode }) {
  const { status } = useGrantCalls();
  if (status === "loading") return <p aria-live="polite">Ładowanie naborów…</p>;
  if (status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać naborów. Spróbuj odświeżyć stronę.
      </p>
    );
  }
  return children;
}
