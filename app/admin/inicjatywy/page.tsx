import type { Metadata } from "next";
import { InitiativesPanels } from "./components/initiatives-panels";
import { InitiativesProvider } from "./components/initiatives-provider";
import { InitiativesTabs } from "./components/initiatives-tabs";

export const metadata: Metadata = {
  title: "Inicjatywy — Panel instytucji Hubmi",
};

// Library of ROPS innovations (GET /api/solutions) with matchmaking counts, and residents' ideas.
export default function InitiativesPage() {
  return (
    <InitiativesProvider>
      <main id="main-content" className="flex flex-col gap-10 p-10 max-sm:gap-7.5 max-sm:p-5">
        <header className="flex flex-col gap-2.5">
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Małopolska / panel instytucji</p>
          <h1 className="font-heading text-section text-primary">Inicjatywy</h1>
          <p className="max-w-[70ch]">
            Biblioteka sprawdzonych innowacji społecznych ROPS i pomysły mieszkańców. Zobacz, które rozwiązania odpowiadają na
            zgłaszane potrzeby, i decyduj, co asystent proponuje mieszkańcom.
          </p>
        </header>
        <div className="flex flex-col gap-5">
          <InitiativesTabs />
          <InitiativesPanels />
        </div>
      </main>
    </InitiativesProvider>
  );
}
