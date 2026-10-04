import type { Metadata } from "next";
import Link from "next/link";
import { InitiativeDescription } from "./components/initiative-description";
import { InitiativeHeader } from "./components/initiative-header";
import { InitiativeMaterials } from "./components/initiative-materials";
import { InitiativeProvider, WhenInitiativeLoaded } from "./components/initiative-provider";
import { MatchingSubmissions } from "./components/matching-submissions";
import { InitiativeTesters } from "./components/initiative-testers";

export const metadata: Metadata = {
  title: "Szczegóły innowacji — Panel instytucji Hubmi",
};

// One innovation from GET /api/solutions/[id] with the submissions it matches.
export default async function InitiativeDetailsPage({ params }: PageProps<"/admin/inicjatywy/[id]">) {
  const { id } = await params;

  return (
    <InitiativeProvider id={id}>
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <Link href="/admin/inicjatywy" className="self-start text-primary no-underline">
          <span aria-hidden="true">←</span> Wróć do inicjatyw
        </Link>

        <WhenInitiativeLoaded>
          <InitiativeHeader />
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_430px] items-start gap-x-15 gap-y-10 max-xl:grid-cols-1">
            <InitiativeDescription />
            <div className="flex flex-col gap-7.5">
              <InitiativeTesters solutionId={id} />
              <MatchingSubmissions />
              <InitiativeMaterials />
            </div>
          </div>
        </WhenInitiativeLoaded>
      </main>
    </InitiativeProvider>
  );
}
