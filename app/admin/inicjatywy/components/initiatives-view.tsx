import { InitiativesPanels } from "./initiatives-panels";
import { InitiativesProvider } from "./initiatives-provider";

const copy = {
  library: {
    module: "Zasobnik wiedzy",
    title: "Biblioteka innowacji",
    lead: "Sprawdzone innowacje społeczne ROPS. Zobacz, które rozwiązania odpowiadają na zgłaszane potrzeby, i decyduj, co asystent proponuje mieszkańcom.",
  },
  ideas: {
    module: "Kreator pomysłów",
    title: "Pomysły",
    lead: "Pomysły zgłoszone przez mieszkańców i organizacje w ścieżce „Zaoferuj pomoc”. Kliknij fiszkę, aby zobaczyć kanwę i całą rozmowę.",
  },
} as const;

// Page skeleton shared by /admin/inicjatywy (library) and /admin/inicjatywy/pomysly (ideas).
export function InitiativesView({ tab }: { tab: keyof typeof copy }) {
  const { module, title, lead } = copy[tab];
  return (
    <InitiativesProvider tab={tab}>
      <main id="main-content" className="flex flex-col gap-10 p-10 max-sm:gap-7.5 max-sm:p-5">
        <header className="flex flex-col gap-2.5">
          <p className="text-caption font-medium tracking-label-sm text-primary uppercase">{module}</p>
          <h1 className="font-heading text-section text-primary">{title}</h1>
          <p className="max-w-[70ch]">{lead}</p>
        </header>
        <InitiativesPanels />
      </main>
    </InitiativesProvider>
  );
}
