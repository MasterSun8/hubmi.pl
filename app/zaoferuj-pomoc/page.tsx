import type { Metadata } from "next";
import * as motion from "motion/react-client";
import { BackLink } from "@/shared/components/chat/back-link";
import { ChatProvider, ChatStage } from "@/shared/components/chat/chat-provider";
import { HandoffPanel } from "@/shared/components/chat/handoff-panel";
import { MessageComposer } from "@/shared/components/chat/message-composer";
import { MessageList } from "@/shared/components/chat/message-list";
import { enter } from "@/shared/components/motion/enter";
import { SiteHeader } from "@/shared/components/site-header";
import { IdeaCardPanel } from "./components/idea-card-panel";

export const metadata: Metadata = {
  title: "Zaoferuj pomoc — Hubmi",
  description: "Opisz, jak możesz pomóc. Asystent Hubmi pomoże połączyć Twoją ofertę ze zgłoszonymi potrzebami.",
};

const placeholder = "Napisz, jak możesz pomóc…";

// Figma 11:603 (conversation); the start screen follows 11:544. The idea is handed off on the
// canvas page (/zaoferuj-pomoc/kanwa), which holds the contact fields instead of a modal.
export default function OfferHelpPage() {
  return (
    <ChatProvider flowId="pomoc" firstQuestion="Jak chcesz pomóc i komu chcesz zaoferować wsparcie?" newConversationLabel="Nowa oferta pomocy">
      <div className="flex min-h-svh flex-col gap-5 px-page py-10 max-sm:py-7.5">
        <SiteHeader>
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Zaoferuj pomoc</p>
        </SiteHeader>
        <BackLink />

        <ChatStage stage="intro">
          <main id="main-content" className="flex flex-1 flex-col gap-10 px-45 max-lg:px-0">
            <div className="flex flex-1 flex-col justify-center gap-7.5 py-15 max-sm:py-10">
              <motion.p className="text-caption font-medium tracking-label-sm text-primary uppercase" {...enter(0)}>
                Asystent Hubmi
              </motion.p>
              <motion.h1
                className="max-w-[11em] font-heading text-display text-balance text-primary"
                {...enter(1, { y: 20 })}
              >
                Jak chcesz pomóc?
              </motion.h1>
              <motion.p className="max-w-115" {...enter(2)}>
                Opisz pomysł, doświadczenie albo zasoby, którymi możesz się podzielić. Zadam kilka pytań, żeby lepiej
                zrozumieć Twoją ofertę, i pomogę połączyć ją ze zgłoszonymi potrzebami.
              </motion.p>
            </div>
            <motion.div {...enter(3)}>
              <MessageComposer
                placeholder={placeholder}
                hint="Możesz zacząć od jednego zdania. Asystent pomoże doprecyzować resztę."
              />
            </motion.div>
          </main>
        </ChatStage>

        <ChatStage stage="conversation">
          <main
            id="main-content"
            className="grid flex-1 grid-cols-[minmax(0,1fr)_380px] grid-rows-[1fr_auto] gap-x-15 gap-y-5 pt-5 max-lg:grid-cols-1 max-lg:grid-rows-none"
          >
            <section className="flex flex-col gap-5" aria-labelledby="conversation-title">
              <h1 id="conversation-title" className="font-heading text-title text-primary">
                Twoja rozmowa
              </h1>
              <MessageList />
            </section>
            <motion.aside
              className="row-span-2 flex flex-col items-start gap-5 self-start border-t border-line py-7.5 max-lg:row-span-1 max-lg:row-start-3"
              aria-label="Przekazanie oferty pomocy"
              {...enter(2, { y: 0, x: 24 })}
            >
              <IdeaCardPanel />
              <HandoffPanel
                description="Przekaż pomysł i pełną historię rozmowy do Hubu, aby można było połączyć go ze zgłoszonymi potrzebami."
                next={{
                  href: "/zaoferuj-pomoc/kanwa",
                  label: "Przejdź\ndo kanwy",
                  steps: ["Sprawdź kanwę pomysłu.", "Uzupełnij lokalizację i kontakt.", "Przekaż pomysł."],
                }}
              />
            </motion.aside>
            {/* The input sticks to the bottom, so it stays in reach however tall the idea card column grows. */}
            <motion.div
              className="sticky bottom-0 z-10 col-start-1 bg-background py-5 max-lg:row-start-2 max-lg:-mx-page max-lg:border-t max-lg:border-line max-lg:px-page max-lg:py-2.5"
              {...enter(1)}
            >
              <MessageComposer
                placeholder={placeholder}
                hint="Rozmowa nie została jeszcze przekazana. Możesz dalej pisać lub przygotować zgłoszenie."
                autoFocus
              />
            </motion.div>
          </main>
        </ChatStage>

      </div>
    </ChatProvider>
  );
}
