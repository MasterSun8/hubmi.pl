import type { Metadata } from "next";
import { BackLink } from "@/shared/components/back-link";
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
  title: "Szczegóły zgłoszenia — Panel Administratora Hubmi",
};

// Figma 16:1545 — one submission from GET /api/submissions/[id] with its conversation.
export default async function SubmissionDetailsPage({ params }: PageProps<"/admin/zgloszenia/[id]">) {
  const { id } = await params;

  return (
    <SubmissionDetailsProvider id={id}>
      <main id="main-content" className="flex flex-col gap-10 p-10 max-sm:gap-7.5 max-sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <BackLink href="/admin/zgloszenia">Wróć do zgłoszeń</BackLink>
        </div>

        <WhenLoaded>
          <SubmissionHeader />
          <div className="grid grid-cols-1 items-start gap-7.5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="flex min-w-0 flex-col gap-7.5">
              <SubmissionSummary />
              <InnovationCanvas />
              <GrantApplications />
              <MatchingSolutions />
              <section className="flex flex-col gap-5 border border-line bg-surface p-7.5 max-sm:p-5" aria-label="Historia rozmowy">
                <ConversationHistory />
              </section>
            </div>
            <div className="flex min-w-0 flex-col gap-7.5">
              <ContactDetails />
              <LocationMap />
              <section aria-labelledby="manage-submission-title" className="flex flex-col items-start gap-5 border border-line bg-surface p-7.5 max-sm:p-5">
                <h2 id="manage-submission-title" className="text-lead font-medium text-primary">Zarządzanie zgłoszeniem</h2>
                <p className="text-caption text-muted">Trwale usuń zgłoszenie wraz z powiązanymi danymi.</p>
                <DeleteButton
                  label="Usuń zgłoszenie"
                  what="to zgłoszenie razem z rozmową, danymi kontaktowymi, kanwą i wnioskami w naborach"
                  endpoint={`/api/submissions/${id}`}
                  redirectTo="/admin/zgloszenia"
                />
              </section>
            </div>
          </div>
        </WhenLoaded>
      </main>
    </SubmissionDetailsProvider>
  );
}
