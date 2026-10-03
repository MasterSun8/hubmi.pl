"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Submission } from "../../zgloszenia/components/submissions-provider";

// Row shape returned by GET /api/solutions.
export type Solution = {
  id: string;
  title: string;
  description: string;
  targetGroups: string[];
  organization: string | null;
  authorName: string | null;
  status: SolutionStatus;
  sourceUrl: string | null;
  matchedSubmissions: number;
};

export type SolutionStatus = "published" | "draft" | "retired";

export const solutionStatusLabels: Record<SolutionStatus, string> = {
  published: "Opublikowana",
  draft: "Szkic",
  retired: "Wycofana",
};

export const PAGE_SIZE = 10;

type InitiativesState = {
  status: "loading" | "ready" | "error";
  tab: "library" | "ideas";
  setTab: (tab: "library" | "ideas") => void;
  solutions: Solution[];
  ideas: Submission[];
  results: Solution[];
  pageItems: Solution[];
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  query: string;
  setQuery: (query: string) => void;
  statusFilter: SolutionStatus | "all";
  setStatusFilter: (status: SolutionStatus | "all") => void;
  sort: "matches" | "title";
  toggleSort: () => void;
};

const InitiativesContext = createContext<InitiativesState | null>(null);

export function useInitiatives() {
  const state = use(InitiativesContext);
  if (!state) throw new Error("useInitiatives must be used inside <InitiativesProvider>");
  return state;
}

export function InitiativesProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<InitiativesState["status"]>("loading");
  const [tab, setTab] = useState<InitiativesState["tab"]>("library");
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [ideas, setIdeas] = useState<Submission[]>([]);
  const [query, setQueryState] = useState("");
  const [statusFilter, setStatusFilterState] = useState<SolutionStatus | "all">("all");
  const [sort, setSort] = useState<InitiativesState["sort"]>("matches");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    Promise.all([
      fetch("/api/solutions", { signal }).then((response) => {
        if (!response.ok) throw new Error(`Solutions request failed: ${response.status}`);
        return response.json() as Promise<{ data: Solution[] }>;
      }),
      // Residents' ideas come from the "Zaoferuj pomoc" chat as submissions of type "idea".
      fetch("/api/submissions?type=idea&limit=100", { signal }).then((response) =>
        response.ok ? (response.json() as Promise<{ data: Submission[] }>) : { data: [] },
      ),
    ])
      .then(([solutionsBody, ideasBody]) => {
        setSolutions(solutionsBody.data);
        setIdeas(ideasBody.data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!signal.aborted) {
          console.error(error);
          setStatus("error");
        }
      });
    return () => controller.abort();
  }, []);

  const results = useMemo(() => {
    const phrase = query.trim().toLocaleLowerCase("pl");
    const matching = solutions.filter(
      (item) =>
        (statusFilter === "all" || item.status === statusFilter) &&
        (!phrase ||
          `${item.title} ${item.description} ${item.targetGroups.join(" ")} ${item.organization ?? ""}`
            .toLocaleLowerCase("pl")
            .includes(phrase)),
    );
    const byTitle = (a: Solution, b: Solution) => a.title.localeCompare(b.title, "pl");
    return matching.sort((a, b) =>
      sort === "matches" ? b.matchedSubmissions - a.matchedSubmissions || byTitle(a, b) : byTitle(a, b),
    );
  }, [solutions, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  return (
    <InitiativesContext
      value={{
        status,
        tab,
        setTab,
        solutions,
        ideas,
        results,
        pageItems: results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        page: currentPage,
        pageCount,
        setPage,
        query,
        setQuery: (value) => {
          setQueryState(value);
          setPage(1);
        },
        statusFilter,
        setStatusFilter: (value) => {
          setStatusFilterState(value);
          setPage(1);
        },
        sort,
        toggleSort: () => setSort((current) => (current === "matches" ? "title" : "matches")),
      }}
    >
      {children}
    </InitiativesContext>
  );
}
