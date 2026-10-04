import type { Metadata } from "next";
import Link from "next/link";
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
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Link href="/admin/nabory" className="text-primary no-underline">
            <span aria-hidden="true">←</span> Wróć do naborów
          </Link>
          <DeleteButton
            label="Usuń nabór"
            what="ten nabór razem ze wszystkimi złożonymi w nim wnioskami"
            endpoint={`/api/grant-calls/${id}`}
            redirectTo="/admin/nabory"
          />
        </div>
        <WhenCallLoaded>
          <CallHeader />
          <CallApplications />
        </WhenCallLoaded>
      </main>
    </CallDetailsProvider>
  );
}
