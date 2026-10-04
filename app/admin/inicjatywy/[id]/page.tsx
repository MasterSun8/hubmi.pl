import type { Metadata } from "next";
import { BackLink } from "@/shared/components/back-link";
import { DeleteButton } from "@/shared/components/delete-button";
import { InitiativeDescription } from "./components/initiative-description";
import { InitiativeHeader } from "./components/initiative-header";
import { InitiativeMaterials } from "./components/initiative-materials";
import { InitiativeProvider, WhenInitiativeLoaded } from "./components/initiative-provider";
import { MatchingSubmissions } from "./components/matching-submissions";
import { InitiativeTesters } from "./components/initiative-testers";

export const metadata: Metadata = {
  title: "Szczegóły innowacji — Panel Administratora Hubmi",
};

// One innovation from GET /api/solutions/[id] with the submissions it matches.
export default async function InitiativeDetailsPage({ params }: PageProps<"/admin/inicjatywy/[id]">) {
  const { id } = await params;

  return (
    <InitiativeProvider id={id}>
      <main id="main-content" className="flex flex-col gap-10 p-10 max-sm:gap-7.5 max-sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <BackLink href="/admin/inicjatywy">Wróć do biblioteki innowacji</BackLink>

        </div>

        <WhenInitiativeLoaded>
          <InitiativeHeader />
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_430px] items-start gap-x-15 gap-y-10 max-xl:grid-cols-1">
            <InitiativeDescription />
            <div className="flex flex-col gap-7.5">
              <InitiativeTesters solutionId={id} />
              <MatchingSubmissions />
              <InitiativeMaterials />
              <section aria-labelledby="manage-initiative-title" className="flex flex-col items-start gap-5 border-t border-line pt-7.5">
                <h2 id="manage-initiative-title" className="text-lead font-medium text-primary">Zarządzanie inicjatywą</h2>
                <DeleteButton
                  label="Usuń inicjatywę"
                  what="tę inicjatywę z biblioteki razem z jej dopasowaniami do zgłoszeń"
                  endpoint={`/api/solutions/${id}`}
                  redirectTo="/admin/inicjatywy"
                />
              </section>
            </div>
          </div>
        </WhenInitiativeLoaded>
      </main>
    </InitiativeProvider>
  );
}
