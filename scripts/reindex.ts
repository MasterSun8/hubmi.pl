// Przelicza embeddingi rozwiązań i fragmentów wiedzy, których brakuje lub które pochodzą z innego modelu.
// Uruchom po wdrożeniu providera OpenAI lub zmianie OPENAI_EMBEDDING_MODEL: pnpm db:reindex

try {
  process.loadEnvFile();
} catch {}

import { eq, isNull, ne, or } from "drizzle-orm";
import { getAi, tryEmbed } from "../server/ai";
import { getDb } from "../server/db/client";
import { knowledgeChunks, solutions } from "../server/db/schema";

const BATCH = 50;

async function main() {
  const model = getAi().embeddingModel;
  if (!model) throw new Error(`Provider "${getAi().name}" does not compute embeddings`);
  const db = getDb();
  const stale = (t: typeof solutions | typeof knowledgeChunks) => or(isNull(t.embedding), ne(t.embeddingModel, model));

  for (;;) {
    const rows = await db.select({ id: solutions.id, text: solutions.searchText }).from(solutions).where(stale(solutions)).limit(BATCH);
    if (rows.length === 0) break;
    const vectors = await tryEmbed(rows.map((r) => r.text));
    if (!vectors) throw new Error("Embedding failed");
    for (const [i, r] of rows.entries()) {
      await db
        .update(solutions)
        .set({ embedding: vectors[i], embeddingModel: model, embeddingUpdatedAt: new Date() })
        .where(eq(solutions.id, r.id));
    }
    console.log(`solutions: ${rows.length}`);
  }

  for (;;) {
    const rows = await db
      .select({ id: knowledgeChunks.id, text: knowledgeChunks.content })
      .from(knowledgeChunks)
      .where(stale(knowledgeChunks))
      .limit(BATCH);
    if (rows.length === 0) break;
    const vectors = await tryEmbed(rows.map((r) => r.text));
    if (!vectors) throw new Error("Embedding failed");
    for (const [i, r] of rows.entries()) {
      await db
        .update(knowledgeChunks)
        .set({ embedding: vectors[i], embeddingModel: model, embeddingUpdatedAt: new Date() })
        .where(eq(knowledgeChunks.id, r.id));
    }
    console.log(`knowledge chunks: ${rows.length}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
