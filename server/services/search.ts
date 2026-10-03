import { createHash } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";
import { getAi, tryEmbed } from "../ai";

export const sha256 = (text: string) => createHash("sha256").update(text).digest("hex");

// Krótkie słowa funkcyjne, które jako prefiks łapałyby niezwiązane wyrazy (np. „bez” → „bezdomność”).
const STOPWORDS = new Set([
  "bez", "dla", "jak", "jest", "nie", "się", "oraz", "przez", "który", "która", "które", "aby", "albo",
  "ale", "też", "tak", "czy", "pod", "nad", "przy", "jego", "jej", "ich", "nas", "mamy", "mam", "być",
]);

// Ucinanie do 5 znaków to prymitywny „stemming” dla poprawnosci jezykowej  (seniorów → senio:*).
export function toPrefixTsQuery(text: string): string | null {
  const terms = [
    ...new Set(
      text
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
        .map((w) => w.slice(0, 5)),
    ),
  ].slice(0, 30);
  return terms.length ? terms.map((t) => `${t}:*`).join(" | ") : null;
}

// `indexed` – tsvector zgodny z indeksem GIN (filtr), `weighted` – opcjonalnie ważony tsvector do rankingu.
export function ftsMatch(indexed: SQL, tsQuery: string, weighted: SQL = indexed) {
  const query = sql`to_tsquery('simple', ${tsQuery})`;
  return {
    where: sql`${indexed} @@ ${query}`,
    // Normalizacja 32: rank / (rank + 1) → 0..1 bez spłaszczania wyników.
    rank: sql<number>`ts_rank_cd(${weighted}, ${query}, 32)`,
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
