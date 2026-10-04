// Backfill missing or stale vectors without recreating the library.
// Run: pnpm embed:solutions
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../server/db/client";
import { solutions } from "../server/db/schema";
import { solutionEmbeddingInput, withSolutionEmbeddings } from "../lib/server/ai/solution-embeddings";

const db = getDb();
try {
  const rows = await db.select({
    id: solutions.id, title: solutions.title, description: solutions.description,
    contentHash: solutions.contentHash, embeddingModel: solutions.embeddingModel,
    hasEmbedding: sql<boolean>`${solutions.embedding} is not null`,
  }).from(solutions);
  const todo = rows.filter((row) => {
    const input = solutionEmbeddingInput(row);
    return !row.hasEmbedding || row.embeddingModel !== input.model || row.contentHash !== input.contentHash;
  });
  console.log(`solutions: ${rows.length}, to embed: ${todo.length}`);
  const embedded = await withSolutionEmbeddings(todo);
  let updated = 0;
  await db.transaction(async (tx) => {
    for (const row of embedded) {
      const saved = await tx.update(solutions).set({
        embedding: row.embedding, embeddingModel: row.embeddingModel,
        embeddingUpdatedAt: row.embeddingUpdatedAt, contentHash: row.contentHash,
      }).where(and(
        eq(solutions.id, row.id), eq(solutions.title, row.title), eq(solutions.description, row.description),
      )).returning({ id: solutions.id });
      updated += saved.length;
    }
  });
  console.log(`Embedded: ${updated}; changed or deleted during processing: ${todo.length - updated}`);
} finally {
  // The shared client is also used by the seed and the application.
  const globals = globalThis as typeof globalThis & { hubmiDbClient?: { end(): Promise<void> } };
  await globals.hubmiDbClient?.end();
}
