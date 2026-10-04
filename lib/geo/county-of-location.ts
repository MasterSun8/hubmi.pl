// Residents type their town or gmina freely ("Słomniki", "Proszowice (test)"); reports and the
// map work per county (names from county-names.ts). This maps the county seats and the
// larger towns of each county; anything else stays unassigned and is listed as such.
import { countyNames, type CountyName } from "./county-names";

const townsByCounty: Record<CountyName, string[]> = {
  "powiat bocheński": ["bochnia", "nowy wiśnicz"],
  "powiat brzeski": ["brzesko", "czchów"],
  "powiat chrzanowski": ["chrzanów", "trzebinia", "libiąż", "alwernia"],
  "powiat dąbrowski": ["dąbrowa tarnowska", "szczucin"],
  "powiat gorlicki": ["gorlice", "biecz", "bobowa"],
  "powiat krakowski": ["skawina", "słomniki", "krzeszowice", "zabierzów", "zielonki", "skała", "świątniki górne"],
  "powiat limanowski": ["limanowa", "mszana dolna"],
  "powiat m. Kraków": ["kraków", "krakow"],
  "powiat m. Nowy Sącz": ["nowy sącz", "nowy sacz"],
  "powiat m. Tarnów": ["tarnów", "tarnow"],
  "powiat miechowski": ["miechów", "miechow", "książ wielki"],
  "powiat myślenicki": ["myślenice", "dobczyce", "sułkowice"],
  "powiat nowosądecki": ["stary sącz", "krynica-zdrój", "krynica", "muszyna", "piwniczna-zdrój", "grybów"],
  "powiat nowotarski": ["nowy targ", "rabka-zdrój", "rabka", "szczawnica"],
  "powiat olkuski": ["olkusz", "bukowno", "wolbrom"],
  "powiat oświęcimski": ["oświęcim", "kęty", "brzeszcze", "chełmek", "zator"],
  "powiat proszowicki": ["proszowice", "koszyce"],
  "powiat suski": ["sucha beskidzka", "maków podhalański", "jordanów"],
  "powiat tarnowski": ["tuchów", "ryglice", "wojnicz", "żabno", "zakliczyn"],
  "powiat tatrzański": ["zakopane"],
  "powiat wadowicki": ["wadowice", "andrychów", "kalwaria zebrzydowska"],
  "powiat wielicki": ["wieliczka", "niepołomice"],
};

// Longest names first, so "nowy sącz" is not mistaken for "stary sącz" and similar overlaps.
const towns = countyNames
  .flatMap((county) => townsByCounty[county].map((name) => ({ county, name })))
  .sort((a, b) => b.name.length - a.name.length);

export function countyOfLocation(location: string): CountyName | null {
  const text = location.toLocaleLowerCase("pl").replace(/\(.*?\)/g, " ");
  // A county named outright ("powiat proszowicki", "pow. krakowski") wins over towns.
  for (const county of countyNames) {
    if (county.startsWith("powiat m.")) continue;
    const stem = county.slice("powiat ".length);
    if (new RegExp(`(powiat|pow\\.)\\s*${stem}`, "u").test(text)) return county;
  }
  const match = towns.find(({ name }) => new RegExp(`(^|[^\\p{L}])${name}($|[^\\p{L}])`, "u").test(text));
  return match?.county ?? null;
}
