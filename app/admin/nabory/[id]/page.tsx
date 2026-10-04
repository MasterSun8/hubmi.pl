import type { Metadata } from "next";
import { BackLink } from "@/shared/components/back-link";
import { DeleteButton } from "@/shared/components/delete-button";
import { CallApplications } from "./components/call-applications";
import { CallDetailsProvider, WhenCallLoaded } from "./components/call-details-provider";
import { CallHeader } from "./components/call-header";

export const metadata: Metadata = {
  title: "Nabór — Panel instytucji Hubmi",
};

// One grant call (GET /api/grant-calls/[id]) with the applications submitted in it.
export default async function GrantCallPage({ params }: PageProps<"/admin/nabory/[id]">) {
  const { id } = await params;

  return (
    <CallDetailsProvider id={id}>
      <main id="main-content" className="flex flex-col gap-10 p-10 max-sm:gap-7.5 max-sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <BackLink href="/admin/nabory">Wróć do naborów</BackLink>

        </div>
        <WhenCallLoaded>
          <CallHeader />
          <CallApplications />
          <section aria-labelledby="manage-call-title" className="flex flex-col items-start gap-5 border-t border-line pt-7.5">
            <h2 id="manage-call-title" className="text-lead font-medium text-primary">Zarządzanie naborem</h2>
            <DeleteButton
              label="Usuń nabór"
              what="ten nabór razem ze wszystkimi złożonymi w nim wnioskami"
              endpoint={`/api/grant-calls/${id}`}
              redirectTo="/admin/nabory"
            />
          </section>
        </WhenCallLoaded>
      </main>
    </CallDetailsProvider>
  );
}
