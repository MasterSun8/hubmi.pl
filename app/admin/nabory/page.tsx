import type { Metadata } from "next";
import { CallsList } from "./components/calls-list";
import { GrantCallsProvider, WhenCallsLoaded } from "./components/grant-calls-provider";
import { NewCallForm } from "./components/new-call-form";

export const metadata: Metadata = {
  title: "Nabory — Panel instytucji Hubmi",
};

// Module III (generator wniosków): grant calls ROPS announces. While a call is open, authors
// of handed-off ideas can prepare an application from their canvas.
export default function GrantCallsPage() {
  return (
    <GrantCallsProvider>
      <main id="main-content" className="flex flex-col gap-5 p-10 max-sm:p-5">
        <p className="text-caption font-medium tracking-label-sm text-primary uppercase">Małopolska / panel instytucji</p>
        <h1 className="font-heading text-section text-primary">Nabory</h1>
        <p className="max-w-[70ch]">
          Ogłaszaj nabory na dofinansowanie pomysłów. Gdy nabór trwa, autor przekazanego pomysłu może przygotować wniosek:
          asystent pisze go z kanwy pomysłu, dopasowany do sekcji i kryteriów naboru.
        </p>
        <NewCallForm />
        <WhenCallsLoaded>
          <CallsList />
        </WhenCallsLoaded>
      </main>
    </GrantCallsProvider>
  );
}
