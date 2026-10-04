// The 22 Małopolska counties (powiaty), spelled as in regional_statistics.region.
// Kept apart from the map geometry in malopolska-counties.ts (~65 KB of SVG
// paths), so lists, filters and server code can import the names alone.
export const countyNames = [
  "powiat bocheński",
  "powiat brzeski",
  "powiat chrzanowski",
  "powiat dąbrowski",
  "powiat gorlicki",
  "powiat krakowski",
  "powiat limanowski",
  "powiat m. Kraków",
  "powiat m. Nowy Sącz",
  "powiat m. Tarnów",
  "powiat miechowski",
  "powiat myślenicki",
  "powiat nowosądecki",
  "powiat nowotarski",
  "powiat olkuski",
  "powiat oświęcimski",
  "powiat proszowicki",
  "powiat suski",
  "powiat tarnowski",
  "powiat tatrzański",
  "powiat wadowicki",
  "powiat wielicki",
] as const;

export type CountyName = (typeof countyNames)[number];

export function isCountyName(value: string): value is CountyName {
  return (countyNames as readonly string[]).includes(value);
}

// Filter value for submissions whose location matches no county (see county-of-location.ts).
export const UNASSIGNED_COUNTY = "nieustalony";
export type CountyFilter = CountyName | typeof UNASSIGNED_COUNTY;

export function isCountyFilter(value: unknown): value is CountyFilter {
  return typeof value === "string" && (value === UNASSIGNED_COUNTY || isCountyName(value));
}

// "powiat m. Kraków" → "Kraków", "powiat proszowicki" → "proszowicki" (map labels).
export function shortCountyName(county: string) {
  return county.replace(/^powiat (m\. )?/, "");
}

// "powiat m. Kraków" → "Kraków", "powiat proszowicki" → "Powiat proszowicki" (headings).
export function countyTitle(county: string) {
  return county.startsWith("powiat m. ") ? shortCountyName(county) : `Powiat ${shortCountyName(county)}`;
}
