import "server-only";
import { and, cosineDistance, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { solutions } from "@/server/db/schema";
import { getEnv } from "@/server/env";
import { getOpenAI } from "../client";

const DEFAULT_LIMIT = 5;

export type SolutionHit = {
  id: string;
  title: string;
  description: string;
  problem: string | null;
  targetGroups: string[];
  implementers: string | null;
  effectiveness: string | null;
  sourceUrl: string | null;
  // Cosine distance: 0 = identical, 2 = opposite.
  distance: number;
};

// Embeds the query and returns the nearest published solutions.
// Rows embedded with a different model are skipped: their vectors live
// in another space, so distances to them would be meaningless.
export async function searchSolutions(query: string, limit = DEFAULT_LIMIT): Promise<SolutionHit[]> {
  const { OPENAI_EMBEDDING_MODEL: model, OPENAI_EMBEDDING_DIMENSIONS: dimensions } = getEnv();
  if (!model) throw new Error("Missing OPENAI_EMBEDDING_MODEL (see .env.example)");

  const { data } = await getOpenAI().embeddings.create({ model, input: query, dimensions });
  const distance = cosineDistance(solutions.embedding, data[0].embedding).mapWith(Number);

  const rows = await getDb()
    .select({
      id: solutions.id,
      title: solutions.title,
      description: solutions.description,
      problem: solutions.problem,
      targetGroups: solutions.targetGroups,
      implementers: solutions.implementers,
      effectiveness: solutions.effectiveness,
      sourceUrl: solutions.sourceUrl,
      distance,
    })
    .from(solutions)
    .where(
      and(
        eq(solutions.status, "published"),
        isNotNull(solutions.embedding),
        eq(solutions.embeddingModel, model),
      ),
    )
    .orderBy(distance)
    // Over-fetch: the import left ~20 innovations in the table twice.
    .limit(limit * 2);

  // Rows are sorted by distance, so the first copy of each title is the closest.
  const seen = new Set<string>();
  return rows.filter((r) => !seen.has(r.title) && seen.add(r.title)).slice(0, limit);
}
