"use client";

import Link from "next/link";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import type { ApplicationState, GrantApplication, GrantCall } from "@/types/grants";

// Same sessionStorage key as the "Zaoferuj pomoc" chat (ChatProvider with flowId "pomoc").
const CONVERSATION_KEY = "hubmi-chat-pomoc";
const SAVE_DELAY_MS = 800;

type Sections = Record<string, string>;
type LoadState = "loading" | "no-conversation" | "idea-not-sent" | "no-open-call" | "error" | "ready";
export type SaveState = "idle" | "saving" | "saved" | "error";
export type DraftState = "idle" | "drafting" | "done" | "nothing-new" | "error";

type ApplicationContextValue = {
  status: LoadState;
  call: GrantCall | null;
  sections: Sections;
  submitted: GrantApplication | null;
  saveState: SaveState;
  draftState: DraftState;
  submitError: string | null;
  submitting: boolean;
  setSection: (key: string, value: string) => void;
  // Asks AI to fill the empty sections; never overwrites what the author wrote.
  fillWithAi: () => Promise<void>;
  submit: () => Promise<void>;
};

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function useApplication() {
  const value = use(ApplicationContext);
  if (!value) throw new Error("useApplication must be used inside <ApplicationProvider>");
  return value;
}

function readConversationId() {
  try {
    return sessionStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

const url = (conversationId: string, path = "") => `/api/conversations/${conversationId}/application${path}`;

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LoadState>("loading");
  const [call, setCall] = useState<GrantCall | null>(null);
  const [sections, setSections] = useState<Sections>({});
  const [submitted, setSubmitted] = useState<GrantApplication | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const conversationId = useRef<string | null>(null);
  const latest = useRef<Sections>({});
  const keys = useRef<string[]>([]);
  // Whether the application exists in the database; until it does, every visit would draft it again.
  const stored = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save() {
    if (!conversationId.current) return;
    setSaveState("saving");
    try {
      const response = await fetch(url(conversationId.current), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: latest.current }),
      });
      if (response.ok) stored.current = true;
      setSaveState(response.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  function update(next: Sections, { immediately = false } = {}) {
    latest.current = next;
    setSections(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (immediately) void save();
    else saveTimer.current = setTimeout(save, SAVE_DELAY_MS);
  }

  async function fillWithAi() {
    if (!conversationId.current) return;
    setDraftState("drafting");
    try {
      const response = await fetch(url(conversationId.current, "/draft"), { method: "POST" });
      if (!response.ok) throw new Error(`Application draft failed: ${response.status}`);
      const { data: draft } = (await response.json()) as { data: Sections };
      const current = latest.current;
      const filled = keys.current.filter((key) => !current[key]?.trim() && draft[key]?.trim());
      if (filled.length === 0) {
        if (!stored.current) update(current, { immediately: true });
        return setDraftState("nothing-new");
      }
      const next = { ...current };
      for (const key of filled) next[key] = draft[key].trim();
      update(next, { immediately: true });
      setDraftState("done");
    } catch (error) {
      console.error(error);
      setDraftState("error");
    }
  }

  async function submit() {
    if (!conversationId.current) return;
    if (keys.current.every((key) => !latest.current[key]?.trim())) {
      setSubmitError("Wniosek jest pusty. Uzupełnij przynajmniej jedną sekcję.");
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(url(conversationId.current, "/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: latest.current }),
      });
      if (!response.ok && response.status !== 409) throw new Error(`Submit failed: ${response.status}`);
      if (response.status === 409) return window.location.reload();
      const { data } = (await response.json()) as { data: GrantApplication };
      setSubmitted(data);
      window.scrollTo({ top: 0 });
    } catch (error) {
      console.error(error);
      setSubmitError("Nie udało się złożyć wniosku. Sprawdź połączenie i spróbuj ponownie. Twoje zmiany są zapisane.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const id = readConversationId();
      if (!id) return setStatus("no-conversation");
      conversationId.current = id;

      const response = await fetch(url(id));
      if (cancelled) return;
      if (response.status === 404) return setStatus("no-conversation");
      if (!response.ok) throw new Error(`Application request failed: ${response.status}`);
      const { data } = (await response.json()) as { data: ApplicationState };
      if (cancelled) return;
      if (data.status !== "ready") return setStatus(data.status);

      keys.current = data.call.sections.map((section) => section.key);
      const loaded = Object.fromEntries(keys.current.map((key) => [key, data.application?.sections[key] ?? ""]));
      stored.current = data.application !== null;
      latest.current = loaded;
      setCall(data.call);
      setSections(loaded);
      if (data.application?.status === "submitted") setSubmitted(data.application);
      setStatus("ready");
      // Only the first visit drafts the application; later visits read the saved one.
      if (!stored.current) void fillWithAi();
    }

    load().catch((error: unknown) => {
      if (cancelled) return;
      console.error(error);
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
    // fillWithAi only reads refs, so it is safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saves edits still waiting for the delay when the author leaves the page.
  useEffect(() => {
    return () => {
      if (saveTimer.current && conversationId.current) {
        clearTimeout(saveTimer.current);
        void fetch(url(conversationId.current), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sections: latest.current }),
          keepalive: true,
        });
      }
    };
  }, []);

  return (
    <ApplicationContext
      value={{
        status,
        call,
        sections,
        submitted,
        saveState,
        draftState,
        submitError,
        submitting,
        setSection: (key, value) => update({ ...latest.current, [key]: value }),
        fillWithAi,
        submit,
      }}
    >
      {children}
    </ApplicationContext>
  );
}

const linkClass = "text-primary";

// Renders children once the application can be written; otherwise explains why not.
export function WhenApplicationLoaded({ children }: { children: ReactNode }) {
  const { status } = useApplication();
  if (status === "loading") return <p aria-live="polite">Ładowanie wniosku…</p>;
  if (status === "no-conversation") {
    return (
      <p role="alert">
        Wniosek powstaje na podstawie Twojego pomysłu.{" "}
        <Link href="/zaoferuj-pomoc" className={linkClass}>
          Zacznij od opisania pomysłu
        </Link>
        .
      </p>
    );
  }
  if (status === "idea-not-sent") {
    return (
      <p role="alert">
        Najpierw przekaż pomysł do Hubu.{" "}
        <Link href="/zaoferuj-pomoc/kanwa" className={linkClass}>
          Wróć do kanwy
        </Link>{" "}
        i podaj kontakt na dole strony.
      </p>
    );
  }
  if (status === "no-open-call") {
    return (
      <p role="alert">
        Teraz nie trwa żaden nabór. Gdy ROPS ogłosi kolejny, przygotujesz tu wniosek na podstawie swojej kanwy.
      </p>
    );
  }
  if (status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się wczytać wniosku. Spróbuj odświeżyć stronę.
      </p>
    );
  }
  return children;
}
