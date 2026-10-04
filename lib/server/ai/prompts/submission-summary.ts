import "server-only";

// Fixed list so the admin panel can filter by category. Problem areas, not
// target groups: "seniorzy" belongs in targetGroup.
export const SUBMISSION_CATEGORIES = [
  "opieka i usługi opiekuńcze",
  "zdrowie i zdrowie psychiczne",
  "samotność i wykluczenie społeczne",
  "transport i dostępność komunikacyjna",
  "mieszkalnictwo",
  "ubóstwo i sytuacja materialna",
  "praca i aktywizacja zawodowa",
  "edukacja i rozwój",
  "niepełnosprawność i dostępność",
  "rodzina i dzieci",
  "przemoc i bezpieczeństwo",
  "uzależnienia",
  "aktywność obywatelska i społeczność lokalna",
  "inne",
] as const;

// Turns a resident's chat into a submission for ROPS staff. The output is
// also what gets embedded for grouping similar submissions, so it has to
// describe the need itself, without greetings or chat noise.
export const SUBMISSION_SUMMARY_PROMPT = `
Na podstawie rozmowy mieszkańca z asystentem przygotuj zgłoszenie dla pracowników ROPS.

Zasady:
- Opisuj wyłącznie to, co napisał mieszkaniec. Wypowiedzi asystenta (np. proponowane
  rozwiązania) służą tylko jako kontekst. Niczego nie dopowiadaj ani nie oceniaj.
- title: krótki, rzeczowy tytuł (do 80 znaków), który mówi, czego dotyczy potrzeba lub pomysł.
- summary: 2–5 zdań w trzeciej osobie: na czym polega problem lub pomysł, kogo dotyczy,
  w jakiej sytuacji i czego brakuje. Bez powitań, bez danych osobowych (imion, adresów,
  telefonów, e-maili).
- category: jeden obszar z listy, który najlepiej pasuje. Jeśli żaden nie pasuje, "inne".
- targetGroup: kogo dotyczy (np. "seniorzy 75+ mieszkający samotnie na wsi"),
  albo null, jeśli z rozmowy to nie wynika.
- Jeśli rozmowa nie zawiera żadnej konkretnej potrzeby ani pomysłu, napisz to wprost
  w summary i użyj kategorii "inne".
- Jeśli w rozmowie padły groźby, zamiar skrzywdzenia kogoś albo opis przestępstwa
  (np. narażanie lub sprzedaż dzieci), nie przedstawiaj tego jako pomocy ani dobrego
  pomysłu: pierwsze zdanie summary ma wprost opisać, co padło, a tytuł zacznij od
  „Sygnał zagrożenia:”.
`.trim();
