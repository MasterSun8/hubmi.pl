// Import Biblioteki Innowacji Społecznych ROPS (dane ze scrapera) do tabeli solutions.
//
//   pnpm db:import                         # domyślnie ./scraped_innovations.json
//   pnpm db:import ścieżka/do/pliku.json
//   pnpm db:import --prune                 # dodatkowo wycofuje rekordy tego źródła, których nie ma w pliku
//
// Import jest idempotentny: rekordy są aktualizowane po (sourceName, externalId),
// a embedding przeliczany tylko po zmianie treści.

try {
  process.loadEnvFile();
} catch {}

import { readFileSync, statSync } from "node:fs";
import { and, eq, notInArray } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../server/db/client";
import { solutions } from "../server/db/schema";
import { mapInnovation, parseSourceUrl, ROPS_SOURCE_NAME, scrapedInnovation } from "../server/import/rops-innovations";
import { upsertSolution } from "../server/services/solutions";

async function main() {
  const args = process.argv.slice(2);
  const prune = args.includes("--prune");
  const file = args.find((a) => !a.startsWith("--")) ?? "scraped_innovations.json";

  const raw = z.array(z.unknown()).parse(JSON.parse(readFileSync(file, "utf8")));
  // Brak daty pobrania w danych – przyjmujemy datę modyfikacji pliku.
  const fetchedAt = statSync(file).mtime;

  const byId = new Map<string, ReturnType<typeof mapInnovation>>();
  const invalid: string[] = [];
  for (const [i, item] of raw.entries()) {
    const parsed = scrapedInnovation.safeParse(item);
    if (!parsed.success) {
      invalid.push(`#${i}: ${z.prettifyError(parsed.error)}`);
      continue;
    }
    const { externalId } = parseSourceUrl(parsed.data.sourceUrl);
    // Scraper zwraca część innowacji wielokrotnie (ten sam URL) – zostawiamy jedną.
    if (!byId.has(externalId)) byId.set(externalId, mapInnovation(parsed.data, fetchedAt));
  }

  let done = 0;
  for (const input of byId.values()) {
    await upsertSolution(input);
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${byId.size}`);
  }

  let retired = 0;
  if (prune) {
    const rows = await getDb()
      .update(solutions)
      .set({ status: "retired" })
      .where(
        and(
          eq(solutions.sourceName, ROPS_SOURCE_NAME),
          eq(solutions.status, "published"),
          notInArray(solutions.externalId, [...byId.keys()]),
        ),
      )
      .returning({ id: solutions.id });
    retired = rows.length;
  }

  console.log(`Plik: ${file}`);
  console.log(`Rekordów w pliku: ${raw.length}, unikalnych: ${byId.size}, duplikatów pominiętych: ${raw.length - byId.size - invalid.length}`);
  console.log(`Zaimportowano/zaktualizowano: ${done}${prune ? `, wycofano nieobecnych: ${retired}` : ""}`);
  if (invalid.length) console.warn(`Odrzucone (${invalid.length}):\n${invalid.join("\n")}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
