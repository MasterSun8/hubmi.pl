import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/shared/components/delete-button";
import { ContactDetails } from "./components/contact-details";
import { ConversationHistory } from "./components/conversation-history";
import { GrantApplications } from "./components/grant-applications";
import { InnovationCanvas } from "./components/innovation-canvas";
import { LocationMap } from "./components/location-map";
import { MatchingSolutions } from "./components/matching-solutions";
import { SubmissionDetailsProvider, WhenLoaded } from "./components/submission-details-provider";
import { SubmissionHeader } from "./components/submission-header";
import { SubmissionSummary } from "./components/submission-summary";

export const metadata: Metadata = {
  title: "Szczegóły zgłoszenia — Panel instytucji Hubmi",
};

// Figma 16:1545 — one submission from GET /api/submissions/[id] with its conversation.
export default async function SubmissionDetailsPage({ params }: PageProps<"/admin/zgloszenia/[id]">) {
  const { id } = await params;

  return (
    <SubmissionDetailsProvider id={id}>
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Link href="/admin/zgloszenia" className="text-primary no-underline">
            <span aria-hidden="true">←</span> Wróć do zgłoszeń
          </Link>
          <DeleteButton
            label="Usuń zgłoszenie"
            what="to zgłoszenie razem z rozmową, danymi kontaktowymi, kanwą i wnioskami w naborach"
            endpoint={`/api/submissions/${id}`}
            redirectTo="/admin/zgloszenia"
          />
        </div>

        <WhenLoaded>
          <SubmissionHeader />
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_430px] items-start gap-x-15 gap-y-10 max-xl:grid-cols-1">
            <div className="flex flex-col gap-7.5">
              <SubmissionSummary />
              <InnovationCanvas />
              <GrantApplications />
              <MatchingSolutions />
              <section className="flex flex-col gap-5" aria-label="Historia rozmowy">
                <ConversationHistory />
              </section>
            </div>
            <div className="flex flex-col gap-7.5">
              <ContactDetails />
              <LocationMap />
            </div>
          </div>
        </WhenLoaded>
      </main>
    </SubmissionDetailsProvider>
  );
}
