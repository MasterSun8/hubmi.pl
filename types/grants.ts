// Grant calls (nabory) and grant applications (wnioski), module III "generator wniosków".
// API contract shared by /api/grant-calls, /api/conversations/[id]/application and the pages.
// Keep this file free of runtime code other than constants.

export type GrantCallSection = { key: string; label: string; question: string };

export type GrantCall = {
  id: string;
  title: string;
  description: string;
  // ISO dates (YYYY-MM-DD); the call is open from startsOn to endsOn inclusive.
  startsOn: string;
  endsOn: string;
  maxAmount: number | null;
  sections: GrantCallSection[];
  criteria: string;
};

export type GrantCallListItem = GrantCall & { submittedApplications: number };

export type GrantApplicationStatus = "draft" | "submitted";

export type GrantApplication = {
  id: string;
  callId: string;
  submissionId: string;
  sections: Record<string, string>;
  status: GrantApplicationStatus;
  submittedAt: string | null;
};

// GET /api/conversations/[id]/application: what the author of an idea can do right now.
export type ApplicationState =
  // The idea has not been handed off yet; an application needs the submission.
  | { status: "idea-not-sent" }
  // No call is open today.
  | { status: "no-open-call" }
  | { status: "ready"; call: GrantCall; submissionId: string; application: GrantApplication | null };

// Submitted application as the admin sees it, with the idea it was written for.
export type GrantApplicationListItem = GrantApplication & {
  submissionTitle: string;
  submissionLocation: string;
  submissionStage: string | null;
  callTitle: string;
};

export const GRANT_SECTION_MAX = 5000;

// Sections a new call starts with in the admin form; ROPS edits them per call.
export const DEFAULT_GRANT_SECTIONS: GrantCallSection[] = [
  { key: "problem", label: "Opis problemu", question: "Jaki problem społeczny rozwiązuje projekt i skąd wiadomo, że istnieje?" },
  { key: "audience", label: "Grupa docelowa", question: "Kto skorzysta z projektu i ile to osób?" },
  { key: "activities", label: "Działania", question: "Co konkretnie zostanie zrobione, gdzie i przez kogo?" },
  { key: "budget", label: "Budżet", question: "Na co pójdą pieniądze? Podaj główne pozycje i kwoty." },
  { key: "schedule", label: "Harmonogram", question: "Kiedy odbędą się kolejne działania?" },
  { key: "results", label: "Rezultaty", question: "Co się zmieni po projekcie i jak to zmierzycie?" },
];
