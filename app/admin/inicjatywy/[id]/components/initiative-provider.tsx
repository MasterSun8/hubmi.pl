"use client";

import { createContext, use, useEffect, useState, type ReactNode } from "react";
import type { SolutionStatus } from "../../components/initiatives-provider";

// GET /api/solutions/[id].
export type InitiativeDetails = {
  id: string;
  title: string;
  description: string;
  problem: string | null;
  categories: string[];
  targetGroups: string[];
  implementers: string | null;
  effectiveness: string | null;
  authors: string[];
  authorName: string | null;
  organization: string | null;
  contactUrl: string | null;
  materialsUrls: string[];
  videoUrls: string[];
  termsOfUseUrl: string | null;
  programName: string | null;
  requiredResources: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  status: SolutionStatus;
  matchingSubmissions: {
    id: string;
    title: string;
    type: "problem" | "idea";
    status: string;
    location: string;
    category: string | null;
    createdAt: string;
    distance: number;
  }[];
};

type State = { status: "loading" } | { status: "not-found" } | { status: "error" } | { status: "ready"; initiative: InitiativeDetails };

type ContextValue = {
  state: State;
  // PATCH /api/solutions/[id]; resolves to an error message, or null on success.
  updateStatus: (status: SolutionStatus) => Promise<string | null>;
};

const InitiativeContext = createContext<ContextValue | null>(null);

function useContextValue() {
  const value = use(InitiativeContext);
  if (!value) throw new Error("Initiative hooks must be used inside <InitiativeProvider>");
  return value;
}

export function useLoadedInitiative() {
  const { state } = useContextValue();
  if (state.status !== "ready") throw new Error("useLoadedInitiative must be used inside <WhenInitiativeLoaded>");
  return state.initiative;
}

export function useUpdateInitiativeStatus() {
  return useContextValue().updateStatus;
}

export function InitiativeProvider({ id, children }: { id: string; children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/solutions/${id}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) return setState({ status: "not-found" });
        if (!response.ok) throw new Error(`Solution request failed: ${response.status}`);
        const { data } = (await response.json()) as { data: InitiativeDetails };
        setState({ status: "ready", initiative: data });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setState({ status: "error" });
        }
      });
    return () => controller.abort();
  }, [id]);

  async function updateStatus(status: SolutionStatus) {
    try {
      const response = await fetch(`/api/solutions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) return "Nie udało się zmienić statusu. Spróbuj ponownie.";
      setState((current) => (current.status === "ready" ? { ...current, initiative: { ...current.initiative, status } } : current));
      return null;
    } catch {
      return "Nie udało się zmienić statusu. Sprawdź połączenie z internetem.";
    }
  }

  return <InitiativeContext value={{ state, updateStatus }}>{children}</InitiativeContext>;
}

export function WhenInitiativeLoaded({ children }: { children: ReactNode }) {
  const { state } = useContextValue();
  if (state.status === "loading") return <p aria-live="polite">Ładowanie innowacji…</p>;
  if (state.status === "not-found") return <p role="alert">Nie znaleziono takiej innowacji.</p>;
  if (state.status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się pobrać innowacji. Spróbuj odświeżyć stronę.
      </p>
    );
  }
  return children;
}
