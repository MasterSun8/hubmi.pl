import type { Metadata } from "next";
import Link from "next/link";
import { ChatProvider } from "@/shared/components/chat/chat-provider";
import { SiteHeader } from "@/shared/components/site-header";
import { CanvasBoard } from "./components/canvas-board";
import { CanvasHandoff } from "./components/canvas-handoff";
import { CanvasPrint } from "./components/canvas-print";
import { CanvasProvider, WhenCanvasLoaded } from "./components/canvas-provider";
import { CanvasToolbar } from "./components/canvas-toolbar";

export const metadata: Metadata = {
  title: "Kanwa innowacji — Hubmi",
  description: "Rozpisz swój pomysł na kanwie innowacji społecznej. Asystent wypełni ją na podstawie rozmowy, a Ty ją poprawisz.",
};

// Module III (Kreator pomysłów): the innovation canvas for the idea from the "Zaoferuj pomoc"
// conversation in this tab. AI pre-fills it, the user edits every field, it saves itself.
// ChatProvider restores that conversation, so the idea can be submitted from here too.
export default function CanvasPage() {
  return (
    <ChatProvider flowId="pomoc" firstQuestion="" newConversationLabel="Nowa oferta pomocy">
      <CanvasProvider>
        <div className="flex min-h-svh flex-col gap-5 px-page py-10 max-sm:py-7.5 print:p-0">
          <div className="contents print:hidden">
            <SiteHeader>
              <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Zaoferuj pomoc</p>
            </SiteHeader>
            <Link
              className="self-start text-caption font-medium tracking-label-sm text-ink uppercase no-underline"
              href="/zaoferuj-pomoc"
            >
              <span aria-hidden="true">←</span> Wróć do rozmowy
            </Link>
          </div>

          <main id="main-content" className="flex flex-col gap-7.5 pt-5 print:gap-3 print:pt-0">
            <div className="flex flex-col gap-2.5">
              <p className="text-caption font-medium tracking-label-sm text-primary uppercase print:hidden">
                Kreator pomysłów
              </p>
              <h1 className="font-heading text-title text-primary print:text-lead print:text-ink">
                Kanwa innowacji społecznej
              </h1>
              <p className="max-w-[60ch] print:hidden">
                Rozpisz pomysł na dziewięć części. Asystent wypełnia je tym, co już padło w rozmowie. Każde pole możesz
                poprawić albo napisać od nowa, a puste uzupełnić samodzielnie. Na końcu podaj kontakt i przekaż pomysł.
              </p>
            </div>

            <WhenCanvasLoaded>
              <CanvasToolbar />
              <CanvasBoard />
              <CanvasPrint />
              <CanvasHandoff />
            </WhenCanvasLoaded>
          </main>
        </div>
      </CanvasProvider>
    </ChatProvider>
  );
}
