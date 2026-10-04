"use client";

import Link from "next/link";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { CANVAS_FIELDS, emptyCanvas, type Canvas, type CanvasField } from "@/types/canvas";

// Same sessionStorage key as the "Zaoferuj pomoc" chat (ChatProvider with flowId "pomoc").
const CONVERSATION_KEY = "hubmi-chat-pomoc";
const SAVE_DELAY_MS = 800;

type LoadState = "loading" | "no-conversation" | "error" | "ready";
export type SaveState = "idle" | "saving" | "saved" | "error";
export type DraftState = "idle" | "drafting" | "done" | "nothing-new" | "error";

type CanvasContextValue = {
  status: LoadState;
  canvas: Canvas;
  saveState: SaveState;
  draftState: DraftState;
  setField: (key: CanvasField, value: string) => void;
  // Asks AI to fill the empty fields from the conversation; never overwrites what the user wrote.
  fillFromConversation: () => Promise<void>;
};

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvas() {
  const value = use(CanvasContext);
  if (!value) throw new Error("useCanvas must be used inside <CanvasProvider>");
  return value;
}

function readConversationId() {
  try {
    return sessionStorage.getItem(CONVERSATION_KEY);
  } catch {
    return null;
  }
}

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LoadState>("loading");
  const [canvas, setCanvas] = useState<Canvas>(emptyCanvas);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [draftState, setDraftState] = useState<DraftState>("idle");
  const conversationId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The canvas as it will be after pending edits, read by the delayed save.
  const latest = useRef<Canvas>(canvas);
  // Whether the canvas exists in the database; until it does, every visit would draft it again.
  const stored = useRef(false);

  async function save() {
    if (!conversationId.current) return;
    setSaveState("saving");
    try {
      const response = await fetch(`/api/conversations/${conversationId.current}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(latest.current),
      });
      if (response.ok) stored.current = true;
      setSaveState(response.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }

  function update(next: Canvas, { immediately = false } = {}) {
    latest.current = next;
    setCanvas(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (immediately) void save();
    else saveTimer.current = setTimeout(save, SAVE_DELAY_MS);
  }

  async function fillFromConversation() {
    if (!conversationId.current) return;
    setDraftState("drafting");
    try {
      const response = await fetch(`/api/conversations/${conversationId.current}/canvas`, { method: "POST" });
      if (!response.ok) throw new Error(`Canvas draft failed: ${response.status}`);
      const { data: draft } = (await response.json()) as { data: Canvas | null };
      const current = latest.current;
      const filled = CANVAS_FIELDS.filter((field) => !current[field.key].trim() && draft?.[field.key]?.trim());
      if (filled.length === 0) {
        // Store even an empty first draft, so a reload reads the canvas instead of asking AI again.
        if (!stored.current) update(current, { immediately: true });
        return setDraftState("nothing-new");
      }
      const next = { ...current };
      for (const field of filled) next[field.key] = draft![field.key].trim();
      update(next, { immediately: true });
      setDraftState("done");
    } catch (error) {
      console.error(error);
      setDraftState("error");
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const id = readConversationId();
      if (!id) return setStatus("no-conversation");
      conversationId.current = id;

      const response = await fetch(`/api/conversations/${id}/canvas`);
      if (cancelled) return;
      if (response.status === 404) return setStatus("no-conversation");
      if (!response.ok) throw new Error(`Canvas request failed: ${response.status}`);
      const { data } = (await response.json()) as { data: Canvas | null };
      if (cancelled) return;
      stored.current = data !== null;
      const loaded = data ?? emptyCanvas();
      latest.current = loaded;
      setCanvas(loaded);
      setStatus("ready");
      // Only the first visit drafts the canvas from what the user already told the assistant;
      // later visits read the saved one and AI runs again only on the button.
      if (!stored.current) void fillFromConversation();
    }

    load().catch((error: unknown) => {
      if (cancelled) return;
      console.error(error);
      setStatus("error");
    });

    return () => {
      cancelled = true;
    };
    // fillFromConversation only reads refs, so it is safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Saves edits still waiting for the delay when the user leaves the page.
  useEffect(() => {
    return () => {
      if (saveTimer.current && conversationId.current) {
        clearTimeout(saveTimer.current);
        void fetch(`/api/conversations/${conversationId.current}/canvas`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(latest.current),
          keepalive: true,
        });
      }
    };
  }, []);

  return (
    <CanvasContext
      value={{
        status,
        canvas,
        saveState,
        draftState,
        setField: (key, value) => update({ ...latest.current, [key]: value }),
        fillFromConversation,
      }}
    >
      {children}
    </CanvasContext>
  );
}

// Renders children once the canvas has loaded; otherwise the loading or error message.
export function WhenCanvasLoaded({ children }: { children: ReactNode }) {
  const { status } = useCanvas();
  if (status === "loading") return <p aria-live="polite">Ładowanie kanwy…</p>;
  if (status === "no-conversation") {
    return (
      <p role="alert">
        Kanwa powstaje na podstawie rozmowy z asystentem.{" "}
        <Link href="/zaoferuj-pomoc" className="text-primary">
          Zacznij od opisania swojego pomysłu
        </Link>
        .
      </p>
    );
  }
  if (status === "error") {
    return (
      <p role="alert" className="text-error">
        Nie udało się wczytać kanwy. Spróbuj odświeżyć stronę.
      </p>
    );
  }
  return children;
}
