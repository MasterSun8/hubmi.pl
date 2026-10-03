// Mapowanie danych zescrapowanych z Biblioteki Innowacji Społecznych ROPS Kraków
// (scraped_innovations.json) na wspólny rekord rozwiązania.

import { z } from "zod";
import type { SolutionInput } from "../validation";

export const ROPS_SOURCE_NAME = "rops-biblioteka-innowacji";

export const scrapedInnovation = z.object({
  title: z.string().trim().min(1),
  shortDescription: z.string().default(""),
  fullDescription: z.string().min(1),
  targetGroup: z.string().default(""),
  author: z.string().default(""),
  contactData: z.string().default(""),
  termsOfUse: z.string().default(""),
  materialsLinks: z.array(z.string()).default([]),
  videoLinks: z.array(z.string()).default([]),
  sourceUrl: z.url(),
});
export type ScrapedInnovation = z.infer<typeof scrapedInnovation>;

// Kategorie biblioteki – z segmentu URL, np. ".../dla-seniorow,bawita".
const CATEGORY_LABELS: Record<string, string> = {
  "dla-dzieci-mlodziezy-i-rodziny": "Dzieci, młodzież i rodzina",
  "dla-seniorow": "Seniorzy",
  "dla-osob-z-niepelnosprawnoscia-sensoryczna": "Osoby z niepełnosprawnością sensoryczną",
  "dla-osob-o-ograniczonej-mobilnosci": "Osoby o ograniczonej mobilności",
  "dla-osob-z-niepelnosprawnoscia-intelektualna": "Osoby z niepełnosprawnością intelektualną",
  "dla-zdrowia-i-medycyny": "Zdrowie i medycyna",
  "dla-cudzoziemcow": "Cudzoziemcy",
  "dla-rynku-pracy": "Rynek pracy",
  "dla-osob-w-kryzysie-bezdomnosci": "Osoby w kryzysie bezdomności",
};

function categoryLabel(slug: string): string {
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  const words = slug.replace(/^dla-/, "").replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function parseSourceUrl(url: string): { categorySlug: string; externalId: string } {
  const last = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "";
  const [categorySlug, ...rest] = last.split(",");
  return { categorySlug, externalId: rest.join(",") || last };
}

type SectionKey = "solution" | "problem" | "targetGroup" | "implementers" | "effectiveness" | "authors";

// Nagłówki numerowanych sekcji opisu (numeracja bywa przesunięta, gdy brakuje „Czy to działa?”).
const SECTION_HEADINGS: [SectionKey, RegExp][] = [
  ["solution", /^Na czym polega rozwiązanie\?\s*/],
  ["problem", /^Jakich problemów dotyczy innowacja\?\s*/],
  ["targetGroup", /^Grupa docelowa\s*/],
  ["implementers", /^Kto może skorzystać z (?:innowacji|rozwiązania)\?\s*/],
  ["effectiveness", /^Czy to działa\?\s*/],
  ["authors", /^Autor\p{L}*(?: innowacji)?:?\s*/u],
];

const SECTION_SPLIT =
  /\s\d\.\s(?=Na czym polega|Jakich problemów|Grupa docelowa|Kto może skorzystać|Czy to działa|Autor)/u;

export function parseDescription(text: string) {
  const [preamble, ...parts] = text.split(SECTION_SPLIT);
  const sections: Partial<Record<SectionKey, string>> = {};
  for (const part of parts) {
    for (const [key, heading] of SECTION_HEADINGS) {
      if (heading.test(part)) {
        sections[key] = part.replace(heading, "").trim();
        break;
      }
    }
  }
  // Np. INNOWACJA WYBRANA DO UPOWSZECHNIANIA W RAMACH PROJEKTU "INKUBATOR DOSTĘPNOŚCI"
  const programName = preamble.match(/W RAMACH PROJEKTU\s+"([^"]+)"/)?.[1] ?? null;
  return { sections, programName };
}

// "- Maria Lorenc - Maciej Parol" → ["Maria Lorenc", "Maciej Parol"]
export function parseAuthors(section: string | undefined, fallback: string): string[] {
  const text = (section ?? fallback).trim();
  if (!text) return [];
  const items = text
    .split(/(?:^|\s)-\s+/)
    .map((a) => a.trim().replace(/[;,]$/, ""))
    .filter(Boolean);
  return items.length ? items : [text];
}

const emptyToNull = (s: string | undefined | null) => (s && s.trim() ? s.trim() : null);

export function mapInnovation(raw: ScrapedInnovation, fetchedAt: Date | null): SolutionInput {
  const { categorySlug, externalId } = parseSourceUrl(raw.sourceUrl);
  const { sections, programName } = parseDescription(raw.fullDescription);
  const authors = parseAuthors(sections.authors, raw.author);
  const targetGroup = emptyToNull(raw.targetGroup) ?? emptyToNull(sections.targetGroup);

  return {
    title: raw.title.trim(),
    // Źródło bywa niekompletne (pusta sekcja 1) – wtedy opis problemu, a w ostateczności cały tekst.
    description: emptyToNull(sections.solution) ?? emptyToNull(sections.problem) ?? raw.fullDescription.trim(),
    problem: emptyToNull(sections.problem),
    categories: [categoryLabel(categorySlug)],
    targetGroups: targetGroup ? [targetGroup] : [],
    implementers: emptyToNull(sections.implementers),
    effectiveness: emptyToNull(sections.effectiveness),
    authors,
    authorName: authors.length ? authors.join(", ") : null,
    organization: null,
    // Źródło nie podaje kontaktu do autorów – kontakt przez stronę innowacji w ROPS.
    contactEmail: null,
    contactPhone: emptyToNull(raw.contactData),
    contactUrl: raw.sourceUrl,
    imageUrls: [],
    materialsUrls: raw.materialsLinks,
    videoUrls: raw.videoLinks,
    termsOfUseUrl: emptyToNull(raw.termsOfUse),
    programName,
    implementationNotes: null,
    requiredResources: null,
    region: null,
    sourceName: ROPS_SOURCE_NAME,
    sourceUrl: raw.sourceUrl,
    externalId,
    fetchedAt,
    importMetadata: {
      categorySlug,
      rawFullDescription: raw.fullDescription,
      rawAuthor: raw.author,
      parsedSections: Object.keys(sections),
    },
    status: "published",
  };
}
