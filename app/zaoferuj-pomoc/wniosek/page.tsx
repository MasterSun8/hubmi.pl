import type { Metadata } from "next";
import { BackLink } from "@/shared/components/back-link";
import { SiteHeader } from "@/shared/components/site-header";
import { ApplicationPrint } from "./components/application-print";
import { ApplicationProvider, WhenApplicationLoaded } from "./components/application-provider";
import { ApplicationSections } from "./components/application-sections";
import { ApplicationSubmit } from "./components/application-submit";
import { ApplicationToolbar } from "./components/application-toolbar";
import { CallSummary } from "./components/call-summary";

export const metadata: Metadata = {
  title: "Wniosek w naborze — Hubmi",
  description: "Przygotuj wniosek o dofinansowanie swojego pomysłu. Asystent napisze go na podstawie kanwy, a Ty go poprawisz.",
};

// Module III (generator wniosków): the grant application for the idea from this tab's
// "Zaoferuj pomoc" conversation, in the call open today. AI drafts the call's sections
// from the canvas, the author edits and submits.
export default function ApplicationPage() {
  return (
    <ApplicationProvider>
      <div className="flex min-h-svh flex-col gap-5 px-page py-10 max-sm:py-7.5 print:p-0">
        <div className="contents print:hidden">
          <SiteHeader>
            <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Zaoferuj pomoc</p>
          </SiteHeader>
          <BackLink href="/zaoferuj-pomoc/kanwa">Wróć do kanwy</BackLink>
        </div>

        <main id="main-content" className="flex flex-col gap-7.5 pt-5 print:gap-3 print:pt-0">
          <div className="flex flex-col gap-2.5">
            <p className="text-caption font-medium tracking-label-sm text-primary uppercase print:hidden">
              Kreator pomysłów
            </p>
            <h1 className="font-heading text-title text-primary print:text-lead print:text-ink">Wniosek o dofinansowanie</h1>
            <p className="max-w-[60ch] print:hidden">
              Asystent napisał wniosek na podstawie Twojej kanwy i rozmowy, dopasowany do sekcji i kryteriów tego naboru.
              Popraw każdą sekcję, uzupełnij brakujące dane i złóż wniosek.
            </p>
          </div>

          <WhenApplicationLoaded>
            <CallSummary />
            <ApplicationToolbar />
            <ApplicationSections />
            <ApplicationPrint />
            <ApplicationSubmit />
          </WhenApplicationLoaded>
        </main>
      </div>
    </ApplicationProvider>
  );
}
