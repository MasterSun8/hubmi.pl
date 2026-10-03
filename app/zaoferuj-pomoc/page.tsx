import type { Metadata } from "next";
import * as motion from "motion/react-client";
import { BackLink } from "@/shared/components/chat/back-link";
import { ChatProvider, ChatStage } from "@/shared/components/chat/chat-provider";
import { ContactDialog } from "@/shared/components/chat/contact-dialog";
import { HandoffPanel } from "@/shared/components/chat/handoff-panel";
import { MessageComposer } from "@/shared/components/chat/message-composer";
import { MessageList } from "@/shared/components/chat/message-list";
import { enter } from "@/shared/components/motion/enter";
import { SiteHeader } from "@/shared/components/site-header";

export const metadata: Metadata = {
  title: "Zaoferuj pomoc — Hubmi",
  description: "Opisz, jak możesz pomóc. Asystent Hubmi pomoże połączyć Twoją ofertę ze zgłoszonymi potrzebami.",
};

const placeholder = "Napisz, jak możesz pomóc…";

// Figma 11:603 (conversation) and 14:756 (contact modal); the start screen follows 11:544.
export default function OfferHelpPage() {
  return (
    <ChatProvider flowId="pomoc" firstQuestion="Jak chcesz pomóc i komu chcesz zaoferować wsparcie?">
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
              className="flex flex-col items-start gap-5 self-start border-t border-line py-7.5 max-lg:row-start-3"
              aria-label="Przekazanie oferty pomocy"
              {...enter(2, { y: 0, x: 24 })}
            >
              <HandoffPanel description="Przekaż ofertę pomocy i pełną historię rozmowy do systemu, aby można było połączyć ją ze zgłoszonymi potrzebami." />
            </motion.aside>
            <motion.div className="col-start-1 max-lg:row-start-2" {...enter(1)}>
              <MessageComposer
                placeholder={placeholder}
                hint="Rozmowa nie została jeszcze przekazana. Możesz dalej pisać lub przygotować zgłoszenie."
                autoFocus
              />
            </motion.div>
          </main>
        </ChatStage>

        <ContactDialog />
      </div>
    </ChatProvider>
  );
}
