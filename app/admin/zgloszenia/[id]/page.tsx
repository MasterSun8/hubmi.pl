import type { Metadata } from "next";
import Link from "next/link";
import { ContactDetails } from "./components/contact-details";
import { ConversationHistory } from "./components/conversation-history";
import { LocationMap } from "./components/location-map";
import { SubmissionDetailsProvider, WhenLoaded } from "./components/submission-details-provider";
import { SubmissionHeader } from "./components/submission-header";

export const metadata: Metadata = {
  title: "Szczegóły zgłoszenia — Panel instytucji Hubmi",
};

// Figma 16:1545 — one submission from GET /api/submissions/[id] with its conversation.
export default async function SubmissionDetailsPage({ params }: PageProps<"/admin/zgloszenia/[id]">) {
  const { id } = await params;

  return (
    <SubmissionDetailsProvider id={id}>
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <Link href="/admin/zgloszenia" className="self-start text-primary no-underline">
          <span aria-hidden="true">←</span> Wróć do zgłoszeń
        </Link>

        <WhenLoaded>
          <SubmissionHeader />
          <div className="grid grid-cols-[minmax(0,1fr)_430px] items-start gap-7.5 max-xl:grid-cols-1">
            <section className="flex flex-col gap-5" aria-label="Historia rozmowy">
              <ConversationHistory />
            </section>
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
