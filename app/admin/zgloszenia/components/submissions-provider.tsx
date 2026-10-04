"use client";

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from "react";
import { countyNames, UNASSIGNED_COUNTY, type CountyFilter } from "@/lib/geo/county-names";
import { countyOfLocation } from "@/lib/geo/county-of-location";
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
  // Grant applications submitted for the idea (list only).
  submittedApplications?: number;
  location: string;
  peopleAffected: number | null;
  // 1–4 from the AI risk assessment; null for ideas and not yet assessed problems.
  riskLevel: number | null;
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

// The county filter lives in the URL too, so the reports map can link to a filtered queue.
const COUNTY_PARAM = "powiat";

// The page ignores a value that is not a county or UNASSIGNED_COUNTY.
export function submissionsHref(county: string) {
  return `/admin/zgloszenia?${COUNTY_PARAM}=${encodeURIComponent(county)}`;
}

// The same mapping the reports map uses, so counts on both pages agree.
const countyOf = (item: Submission): CountyFilter => countyOfLocation(item.location) ?? UNASSIGNED_COUNTY;

export type Filters = {
  status: SubmissionStatus | "all";
  category: string;
  county: CountyFilter | "";
  risk: number | null;
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
  sort: "risk" | "date";
  toggleSort: () => void;
  categories: { category: string; count: number }[];
  // Every county plus the unassigned bucket, with the number of submissions in each.
  counties: { county: CountyFilter; count: number }[];
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

export function SubmissionsProvider({
  initialCounty = "",
  children,
}: {
  // From ?powiat= (validated by the page), e.g. a link from the reports map.
  initialCounty?: Filters["county"];
  children: ReactNode;
}) {
  const [status, setStatus] = useState<SubmissionsState["status"]>("loading");
  const [all, setAll] = useState<Submission[]>([]);
  const [query, setQueryState] = useState("");
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    category: "",
    county: initialCounty,
    risk: null,
    days: null,
    since: null,
  });
  const [sort, setSort] = useState<SubmissionsState["sort"]>("risk");
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
        (!filters.category || item.category === filters.category) &&
        (!filters.county || countyOf(item) === filters.county) &&
        (!filters.risk || item.riskLevel === filters.risk) &&
        (!filters.since || new Date(item.createdAt).getTime() >= filters.since) &&
        (!phrase ||
          `${item.title} ${item.summary} ${submissionNumber(item.id)}`.toLocaleLowerCase("pl").includes(phrase)),
    );
    const byDate = (a: Submission, b: Submission) => b.createdAt.localeCompare(a.createdAt);
    // Ideas and unassessed problems go last.
    const risk = (item: Submission) => item.riskLevel ?? 0;
    return matching.sort((a, b) => (sort === "risk" ? risk(b) - risk(a) || byDate(a, b) : byDate(a, b)));
  }, [all, query, filters, sort]);

  const counties = useMemo(() => {
    const counts = new Map<CountyFilter, number>();
    for (const item of all) {
      const county = countyOf(item);
      counts.set(county, (counts.get(county) ?? 0) + 1);
    }
    const options: CountyFilter[] = [...countyNames, UNASSIGNED_COUNTY];
    return options.map((county) => ({ county, count: counts.get(county) ?? 0 }));
  }, [all]);

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
          if (key === "county") {
            const url = new URL(window.location.href);
            if (value) url.searchParams.set(COUNTY_PARAM, String(value));
            else url.searchParams.delete(COUNTY_PARAM);
            window.history.replaceState(null, "", url);
          }
        },
        sort,
        toggleSort: () => setSort((current) => (current === "risk" ? "date" : "risk")),
        categories:
          groups.length > 0
            ? groups
            : distinct(all.map((item) => item.category)).map((category) => ({
                category,
                count: all.filter((item) => item.category === category).length,
              })),
        counties,
      }}
    >
      {children}
    </SubmissionsContext>
  );
}
