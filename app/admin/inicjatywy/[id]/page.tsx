import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/shared/components/delete-button";
import { InitiativeDescription } from "./components/initiative-description";
import { InitiativeHeader } from "./components/initiative-header";
import { InitiativeMaterials } from "./components/initiative-materials";
import { InitiativeProvider, WhenInitiativeLoaded } from "./components/initiative-provider";
import { MatchingSubmissions } from "./components/matching-submissions";

export const metadata: Metadata = {
  title: "Szczegóły innowacji — Panel instytucji Hubmi",
};

// One innovation from GET /api/solutions/[id] with the submissions it matches.
export default async function InitiativeDetailsPage({ params }: PageProps<"/admin/inicjatywy/[id]">) {
  const { id } = await params;

  return (
    <InitiativeProvider id={id}>
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <Link href="/admin/inicjatywy" className="text-primary no-underline">
            <span aria-hidden="true">←</span> Wróć do inicjatyw
          </Link>
          <DeleteButton
            label="Usuń inicjatywę"
            what="tę inicjatywę z biblioteki razem z jej dopasowaniami do zgłoszeń"
            endpoint={`/api/solutions/${id}`}
            redirectTo="/admin/inicjatywy"
          />
        </div>

        <WhenInitiativeLoaded>
          <InitiativeHeader />
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_430px] items-start gap-x-15 gap-y-10 max-xl:grid-cols-1">
            <InitiativeDescription />
            <div className="flex flex-col gap-7.5">
              <MatchingSubmissions />
              <InitiativeMaterials />
            </div>
          </div>
        </WhenInitiativeLoaded>
      </main>
    </InitiativeProvider>
  );
}
