"use client";

import Link from "next/link";
import { useChat } from "./chat-provider";

export function BackLink() {
  const { started } = useChat();
  return (
    <Link className="self-start text-caption font-medium tracking-label-sm text-ink uppercase no-underline" href="/">
      <span aria-hidden="true">←</span> {started ? "Wróć do wyboru ścieżki" : "Zmień ścieżkę"}
    </Link>
  );
}
