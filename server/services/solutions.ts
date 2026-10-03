import { and, arrayContains, cosineDistance, desc, eq, getTableColumns, inArray, isNotNull, sql, type SQL } from "drizzle-orm";
import { tryEmbed, type RetrievedSolution } from "../ai";
import { getDb } from "../db/client";
import { solutions } from "../db/schema";
import { notFound } from "../http";
import type { SolutionInput, SolutionPatch } from "../validation";
import { embeddingFields, ftsMatch, toPrefixTsQuery } from "./search";

const { embedding, searchText, contentHash, ...solutionColumns } = getTableColumns(solutions);
void embedding;
void searchText;
void contentHash;
export { solutionColumns };

type SolutionText = Pick<
  SolutionInput,
  "title" | "description" | "problem" | "categories" | "targetGroups" | "implementationNotes" | "requiredResources" | "region"
>;

export function buildSolutionSearchText(s: SolutionText): string {
  return [
    s.title,
    s.description,
    s.problem,
    s.categories.length ? `Kategorie: ${s.categories.join(", ")}` : null,
    s.targetGroups.length ? `Odbiorcy: ${s.targetGroups.join(", ")}` : null,
    s.implementationNotes,
    s.requiredResources,
    s.region,
  ]
    .filter(Boolean)
    .join("\n");
}

export type SolutionSearch = {
  q?: string;
  category?: string;
  targetGroup?: string;
  status?: "draft" | "published" | "retired";
  limit: number;
  offset: number;
};

// Wyszukiwanie wektorowe, a gdy brak embeddingów – full-text search.
export async function searchSolutions(params: SolutionSearch) {
  const db = getDb();
  const filters: SQL[] = [];
  if (params.status) filters.push(eq(solutions.status, params.status));
  if (params.category) filters.push(arrayContains(solutions.categories, [params.category]));
  if (params.targetGroup) filters.push(arrayContains(solutions.targetGroups, [params.targetGroup]));

  const q = params.q?.trim();
  if (q) {
    const vectors = await tryEmbed([q]);
    if (vectors) {
      const similarity = sql<number>`1 - (${cosineDistance(solutions.embedding, vectors[0])})`;
      return db
        .select({ ...solutionColumns, similarity })
        .from(solutions)
        .where(and(...filters, isNotNull(solutions.embedding)))
        .orderBy(desc(similarity))
        .limit(params.limit)
        .offset(params.offset);
    }
    const tsQuery = toPrefixTsQuery(q);
    if (!tsQuery) return [];
    const fts = ftsMatch(solutions.searchText, tsQuery);
    return db
      .select({ ...solutionColumns, similarity: fts.rank })
      .from(solutions)
      .where(and(...filters, fts.where))
      .orderBy(desc(fts.rank))
      .limit(params.limit)
      .offset(params.offset);
  }

  return db
    .select({ ...solutionColumns, similarity: sql<number | null>`null` })
    .from(solutions)
    .where(and(...filters))
    .orderBy(desc(solutions.updatedAt))
    .limit(params.limit)
    .offset(params.offset);
}

// Dla RAG: tylko opublikowane, z minimalnym progiem dopasowania.
export async function retrieveSolutions(query: string, limit = 5, minSimilarity = 0.3): Promise<RetrievedSolution[]> {
  const rows = await searchSolutions({ q: query, status: "published", limit, offset: 0 });
  return rows
    .filter((r) => (r.similarity ?? 0) >= minSimilarity)
    .map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      targetGroups: r.targetGroups,
      sourceUrl: r.sourceUrl,
      similarity: r.similarity ?? 0,
    }));
}

export async function getSolution(id: string, { publishedOnly }: { publishedOnly: boolean }) {
  const [row] = await getDb()
    .select(solutionColumns)
    .from(solutions)
    .where(and(eq(solutions.id, id), publishedOnly ? eq(solutions.status, "published") : undefined));
  if (!row) throw notFound("Solution");
  return row;
}

export async function getSolutionsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return getDb().select(solutionColumns).from(solutions).where(inArray(solutions.id, ids));
}

export async function createSolution(input: SolutionInput) {
  const text = buildSolutionSearchText(input);
  const [row] = await getDb()
    .insert(solutions)
    .values({ ...input, searchText: text, ...(await embeddingFields(text)) })
    .returning(solutionColumns);
  return row;
}

// Import (scraper): wstawia lub aktualizuje po (sourceName, externalId).
export async function upsertSolution(input: SolutionInput) {
  if (input.sourceName && input.externalId) {
    const [existing] = await getDb()
      .select({ id: solutions.id })
      .from(solutions)
      .where(and(eq(solutions.sourceName, input.sourceName), eq(solutions.externalId, input.externalId)));
    if (existing) return updateSolution(existing.id, input);
  }
  return createSolution(input);
}

export async function updateSolution(id: string, patch: SolutionPatch) {
  const db = getDb();
  const [current] = await db.select().from(solutions).where(eq(solutions.id, id));
  if (!current) throw notFound("Solution");

  const merged = { ...current, ...patch };
  const text = buildSolutionSearchText(merged);
  const [row] = await db
    .update(solutions)
    .set({ ...patch, searchText: text, ...(await embeddingFields(text, current)) })
    .where(eq(solutions.id, id))
    .returning(solutionColumns);
  return row;
}

// Wycofanie zamiast usuwania – zgłoszenia mogą wskazywać na to rozwiązanie.
export async function retireSolution(id: string) {
  const [row] = await getDb()
    .update(solutions)
    .set({ status: "retired" })
    .where(eq(solutions.id, id))
    .returning(solutionColumns);
  if (!row) throw notFound("Solution");
  return row;
}
