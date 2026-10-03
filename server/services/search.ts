import { createHash } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";
import { getAi, tryEmbed } from "../ai";

export const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

// Ucinanie do 5 znaków to prymitywny „stemming” dla poprawnosci jezykowej  (seniorów → senio:*).
export function toPrefixTsQuery(text: string): string | null {
  const terms = [
    ...new Set(
      text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length >= 3)
        .map((w) => w.slice(0, 5)),
    ),
  ].slice(0, 30);
  return terms.length ? terms.map((t) => `${t}:*`).join(" | ") : null;
}

export function ftsMatch(column: SQL.Aliased | SQL | unknown, tsQuery: string) {
  const query = sql`to_tsquery('simple', ${tsQuery})`;
  const vector = sql`to_tsvector('simple', ${column})`;
  return {
    where: sql`${vector} @@ ${query}`,
    rank: sql<number>`least(1, ts_rank(${vector}, ${query}) * 10)`,
  };
}

type EmbeddingState = {
  contentHash: string | null;
  embeddingModel: string | null;
  embedding: number[] | null;
};

// Pola embeddingu do zapisu. Przeliczamy tylko po zmianie treści lub modelu.
export async function embeddingFields(text: string, existing?: EmbeddingState) {
  const contentHash = sha256(text);
  const model = getAi().embeddingModel;
  if (
    existing &&
    existing.contentHash === contentHash &&
    existing.embeddingModel === model &&
    existing.embedding !== null
  ) {
    return { contentHash };
  }
  const vectors = await tryEmbed([text]);
  return {
    contentHash,
    embedding: vectors?.[0] ?? null,
    embeddingModel: vectors ? model : null,
    embeddingUpdatedAt: vectors ? new Date() : null,
  };
}
