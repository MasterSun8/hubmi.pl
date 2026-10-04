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
  title: "Zgłoś problem — Hubmi",
  description: "Opisz, z czym potrzebujesz pomocy. Asystent Hubmi dopyta o szczegóły i pomoże znaleźć rozwiązanie.",
};

const placeholder = "Napisz, z czym potrzebujesz pomocy…";

// Figma 11:544 (start), 11:566 (conversation), 15:777 (initiative suggestion), 11:662 (contact modal).
export default function ReportProblemPage() {
  return (
    <ChatProvider flowId="problem" firstQuestion="Z jakim problemem potrzebujesz pomocy?" newConversationLabel="Nowy problem">
      <div className="flex min-h-svh flex-col gap-5 px-page py-10 max-sm:py-7.5">
        <SiteHeader>
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Zgłoś problem</p>
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
                Z jakim problemem potrzebujesz pomocy?
              </motion.h1>
              <motion.p className="max-w-115" {...enter(2)}>
                Opisz, co się dzieje — u Ciebie lub w Twojej społeczności. Zadam kilka pytań, żeby lepiej zrozumieć
                sytuację, i pomogę znaleźć rozwiązania oraz ustalić kolejne kroki.
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
            className="grid flex-1 grid-cols-[minmax(0,1fr)_380px] grid-rows-[1fr_auto] gap-x-15 gap-y-7.5 pt-7.5 max-lg:grid-cols-1 max-lg:grid-rows-none"
          >
            <section className="flex min-w-0 flex-col gap-7.5 pb-5" aria-labelledby="conversation-title">
              <h1 id="conversation-title" className="font-heading text-title text-primary">
                Twoja rozmowa
              </h1>
              <MessageList />
            </section>
            <motion.aside
              className="sticky top-5 row-span-2 flex max-h-[calc(100svh-40px)] flex-col items-start gap-7.5 self-start overflow-y-auto overscroll-contain border-t border-line py-7.5 [&>*]:shrink-0 max-lg:static max-lg:row-span-1 max-lg:row-start-3 max-lg:max-h-none max-lg:overflow-visible"
              aria-label="Przekazanie zgłoszenia"
              {...enter(2, { y: 0, x: 24 })}
            >
              <HandoffPanel description="Przekaż opis potrzeby i pełną historię rozmowy do systemu, aby zgłoszenie mogło trafić do dalszej obsługi." />
            </motion.aside>
            {/* Keep the composer available while reading the conversation. */}
            <motion.div
              className="sticky bottom-0 z-10 col-start-1 border-t border-line bg-background py-5 max-lg:row-start-2 max-lg:-mx-page max-lg:px-page max-lg:py-2.5"
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

        <ContactDialog />
      </div>
    </ChatProvider>
  );
}
