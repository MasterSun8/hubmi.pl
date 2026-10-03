// Dane przykładowe do dema. Wszystkie rekordy są fikcyjne i oznaczone sourceName = "seed".
// Uruchom: pnpm db:seed

try {
  process.loadEnvFile();
} catch {}

import { createDocument } from "../server/services/knowledge";
import { upsertSolution } from "../server/services/solutions";
import { solutionInput } from "../server/validation";

const sampleSolutions = [
  {
    externalId: "posilki-sasiedzkie",
    title: "[PRZYKŁAD] Sąsiedzkie posiłki dla seniorów",
    description:
      "Wolontariusze z sąsiedztwa przygotowują i dostarczają ciepłe posiłki osobom starszym mieszkającym samotnie. Gmina koordynuje listę odbiorców, lokalne restauracje przekazują nadwyżki.",
    problem: "Osoby starsze bez regularnych posiłków i wsparcia w codziennych czynnościach.",
    categories: ["żywienie", "opieka"],
    targetGroups: ["seniorzy"],
    organization: "Przykładowa Fundacja Sąsiedzka",
    contactEmail: "kontakt@example.org",
    implementationNotes: "Start od 10–15 odbiorców, jeden koordynator, grafik wolontariuszy, umowa z 1–2 lokalami.",
    requiredResources: "Koordynator (0,25 etatu), 5–10 wolontariuszy, pojemniki termiczne, transport.",
    region: "Małopolska",
  },
  {
    externalId: "teleopieka",
    title: "[PRZYKŁAD] Teleopieka z opaską bezpieczeństwa",
    description:
      "Seniorzy otrzymują opaskę z przyciskiem alarmowym połączoną z centrum monitoringu, które w razie potrzeby powiadamia rodzinę lub służby.",
    problem: "Samotnie mieszkające osoby starsze narażone na upadki i brak szybkiej pomocy.",
    categories: ["bezpieczeństwo", "opieka"],
    targetGroups: ["seniorzy", "osoby z niepełnosprawnościami"],
    organization: "Przykładowe Centrum Teleopieki",
    contactUrl: "https://example.org/teleopieka",
    requiredResources: "Opaski, umowa z centrum monitoringu, pracownik do instalacji i szkoleń.",
    region: "Małopolska",
  },
  {
    externalId: "mieszkania-treningowe",
    title: "[PRZYKŁAD] Mieszkania treningowe dla młodych w kryzysie bezdomności",
    description:
      "Młodzi dorośli w kryzysie bezdomności otrzymują czasowe mieszkanie oraz wsparcie asystenta w szukaniu pracy i stałego lokum.",
    problem: "Rosnąca liczba młodych osób bez stałego miejsca zamieszkania, niepasujących do standardowych form pomocy.",
    categories: ["mieszkalnictwo", "aktywizacja zawodowa"],
    targetGroups: ["młodzież", "osoby w kryzysie bezdomności"],
    organization: "Przykładowe Stowarzyszenie Start",
    contactEmail: "start@example.org",
    implementationNotes: "Pilotaż na 1–2 mieszkaniach z zasobu gminy, asystent pracujący z 4–6 osobami.",
    region: "Kraków",
  },
  {
    externalId: "klub-cyfrowy-seniora",
    title: "[PRZYKŁAD] Klub cyfrowy seniora",
    description:
      "Cotygodniowe spotkania, na których młodzież uczy seniorów obsługi smartfona, e-usług i bezpiecznego korzystania z internetu.",
    problem: "Wykluczenie cyfrowe i samotność osób starszych.",
    categories: ["edukacja", "integracja"],
    targetGroups: ["seniorzy", "młodzież"],
    organization: "Przykładowa Biblioteka Gminna",
    contactPhone: "+48 000 000 000",
    requiredResources: "Sala z Wi-Fi, 2–3 wolontariuszy, kilka urządzeń do ćwiczeń.",
    region: "Małopolska",
  },
];

async function main() {
  for (const s of sampleSolutions) {
    const input = solutionInput.parse({ ...s, sourceName: "seed" });
    const row = await upsertSolution(input);
    console.log(`solution: ${row.title}`);
  }

  const doc = await createDocument({
    title: "[PRZYKŁAD] Jak przygotować pilotaż usługi społecznej w małej gminie",
    content:
      "Zacznij od małej grupy odbiorców i jasno określ cel pilotażu.\n\nWyznacz koordynatora i ustal, kto z partnerów lokalnych może pomóc: NGO, parafia, szkoła, KGW.\n\nPo 6–8 tygodniach zbierz informacje zwrotne i zdecyduj o skalowaniu.",
    status: "published",
  });
  console.log(`knowledge: ${doc.title}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
