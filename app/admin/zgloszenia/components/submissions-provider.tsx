"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import type { IdeaStage } from "@/shared/components/idea-stage";

// Row shape returned by GET /api/submissions.
export type Submission = {
  id: string;
  conversationId: string;
  type: "problem" | "idea";
  status: SubmissionStatus;
  title: string;
  summary: string;
  category: string | null;
  targetGroup: string | null;
  // Idea card fields, filled for ideas only.
  essence?: string | null;
  stage?: IdeaStage | null;
  // Filled innovation canvas fields (list only).
  canvasFilled?: number;
  location: string;
  peopleAffected: number | null;
  aiScore: number | null;
  priorityOverride: number | null;
  createdAt: string;
};


export type SubmissionStatus = "new" | "in_review" | "in_progress" | "resolved" | "rejected";

export const statusLabels: Record<SubmissionStatus, string> = {
  new: "Nowe",
  in_review: "Do weryfikacji",
  in_progress: "W trakcie",
  resolved: "Rozwiązane",
  rejected: "Odrzucone",
};

export const typeLabels: Record<Submission["type"], string> = {
  problem: "Zgłoś problem",
  idea: "Zaoferuj pomoc",
};

export const PAGE_SIZE = 5;
// The endpoint caps one page at 100 rows; for the demo the whole queue fits in one request,
// so search, filters, sorting and paging run in the browser.
const FETCH_LIMIT = 100;

export type Filters = {
  status: SubmissionStatus | "all";
  type: Submission["type"] | "all";
  category: string;
  location: string;
  days: number | null;
  // Cutoff timestamp for `days`, fixed when the period is picked.
  since: number | null;
};

type SubmissionsState = {
  status: "loading" | "ready" | "error";
  all: Submission[];
  results: Submission[];
  pageItems: Submission[];
  page: number;
  pageCount: number;
  setPage: (page: number) => void;
  query: string;
  setQuery: (query: string) => void;
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  sort: "score" | "date";
  toggleSort: () => void;
  categories: { category: string; count: number }[];
  locations: string[];
};

const SubmissionsContext = createContext<SubmissionsState | null>(null);

export function useSubmissions() {
  const state = use(SubmissionsContext);
  if (!state) throw new Error("useSubmissions must be used inside <SubmissionsProvider>");
  return state;
}

// Polish plural forms: 1 zgłoszenie, 2–4 zgłoszenia, 5+ zgłoszeń.
export function plural(count: number, one: string, few: string, many: string) {
  const lastTwo = count % 100;
  const last = count % 10;
  if (count === 1) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}

// "#ZG-8E6B05": a short, readable reference built from the submission id.
export function submissionNumber(id: string) {
  return `#ZG-${id.slice(0, 6).toUpperCase()}`;
}

const distinct = (values: (string | null)[]) =>
  [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b, "pl"));

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SubmissionsState["status"]>("loading");
  const [all, setAll] = useState<Submission[]>([]);
  const [query, setQueryState] = useState("");
  const [filters, setFilters] = useState<Filters>({ status: "all", type: "all", category: "", location: "", days: null, since: null });
  const [sort, setSort] = useState<SubmissionsState["sort"]>("score");
  const [page, setPage] = useState(1);
  const [groups, setGroups] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/submissions?limit=${FETCH_LIMIT}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Submissions request failed: ${response.status}`);
        return response.json() as Promise<{ data: Submission[] }>;
      })
      .then((body) => {
        setAll(body.data);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setStatus("error");
        }
      });
    // The fixed AI categories with counts; the filter falls back to categories in the data.
    fetch("/api/groups", { signal: controller.signal })
      .then((response) => (response.ok ? (response.json() as Promise<{ data: { category: string; count: number }[] }>) : null))
      .then((body) => body && setGroups(body.data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const results = useMemo(() => {
    const phrase = query.trim().toLocaleLowerCase("pl");
    const matching = all.filter(
      (item) =>
        (filters.status === "all" || item.status === filters.status) &&
        (filters.type === "all" || item.type === filters.type) &&
        (!filters.category || item.category === filters.category) &&
        (!filters.location || item.location === filters.location) &&
        (!filters.since || new Date(item.createdAt).getTime() >= filters.since) &&
        (!phrase ||
          `${item.title} ${item.summary} ${submissionNumber(item.id)}`.toLocaleLowerCase("pl").includes(phrase)),
    );
    const byDate = (a: Submission, b: Submission) => b.createdAt.localeCompare(a.createdAt);
    // A manual priority override wins over the AI score; unscored items go last.
    const score = (item: Submission) => item.priorityOverride ?? item.aiScore ?? -1;
    return matching.sort((a, b) => (sort === "score" ? score(b) - score(a) || byDate(a, b) : byDate(a, b)));
  }, [all, query, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);

  return (
    <SubmissionsContext
      value={{
        status,
        all,
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
        filters,
        setFilter: (key, value) => {
          setFilters((current) => ({ ...current, [key]: value }));
          setPage(1);
        },
        sort,
        toggleSort: () => setSort((current) => (current === "score" ? "date" : "score")),
        categories:
          groups.length > 0
            ? groups
            : distinct(all.map((item) => item.category)).map((category) => ({
                category,
                count: all.filter((item) => item.category === category).length,
              })),
        locations: distinct(all.map((item) => item.location)),
      }}
    >
      {children}
    </SubmissionsContext>
  );
}
