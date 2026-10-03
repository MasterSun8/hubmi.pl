import { and, asc, cosineDistance, desc, eq, getTableColumns, isNotNull, sql } from "drizzle-orm";
import { getAi, tryEmbed, type RetrievedKnowledge } from "../ai";
import { getDb, type Tx } from "../db/client";
import { knowledgeChunks, knowledgeDocuments } from "../db/schema";
import { notFound } from "../http";
import { ftsMatch, sha256, toPrefixTsQuery } from "./search";
const CHUNK_SIZE = 1200;
export function chunkText(content: string, size = CHUNK_SIZE): string[] {
  const paragraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    for (let i = 0; i < paragraph.length; i += size) {
      const piece = paragraph.slice(i, i + size);
      if (current && current.length + piece.length + 2 > size) {
        chunks.push(current);
        current = "";
      }
      current = current ? `${current}\n\n${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function writeChunks(tx: Tx, documentId: string, content: string) {
  await tx.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId));
  const chunks = chunkText(content);
  if (chunks.length === 0) return;
  const vectors = await tryEmbed(chunks);
  const model = getAi().embeddingModel;
  await tx.insert(knowledgeChunks).values(
    chunks.map((chunk, i) => ({
      documentId,
      chunkIndex: i,
      content: chunk,
      contentHash: sha256(chunk),
      embedding: vectors?.[i] ?? null,
      embeddingModel: vectors ? model : null,
      embeddingUpdatedAt: vectors ? new Date() : null,
    })),
  );
}

export async function listDocuments(status?: "draft" | "published" | "retired") {
  const { content, ...columns } = getTableColumns(knowledgeDocuments);
  void content;
  return getDb()
    .select(columns)
    .from(knowledgeDocuments)
    .where(status ? eq(knowledgeDocuments.status, status) : undefined)
    .orderBy(desc(knowledgeDocuments.updatedAt));
}

export async function getDocument(id: string) {
  const db = getDb();
  const [doc] = await db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.id, id));
  if (!doc) throw notFound("Document");
  const chunks = await db
    .select({ id: knowledgeChunks.id, chunkIndex: knowledgeChunks.chunkIndex, embeddingModel: knowledgeChunks.embeddingModel })
    .from(knowledgeChunks)
    .where(eq(knowledgeChunks.documentId, id))
    .orderBy(asc(knowledgeChunks.chunkIndex));
  return { ...doc, chunks };
}

export async function createDocument(input: typeof knowledgeDocuments.$inferInsert) {
  return getDb().transaction(async (tx) => {
    const [doc] = await tx.insert(knowledgeDocuments).values(input).returning();
    await writeChunks(tx, doc.id, doc.content);
    return doc;
  });
}

export async function updateDocument(id: string, patch: Partial<typeof knowledgeDocuments.$inferInsert>) {
  return getDb().transaction(async (tx) => {
    const [current] = await tx.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.id, id));
    if (!current) throw notFound("Document");
    const [doc] = await tx.update(knowledgeDocuments).set(patch).where(eq(knowledgeDocuments.id, id)).returning();
    if (doc.content !== current.content || doc.title !== current.title) {
      await writeChunks(tx, doc.id, doc.content);
    }
    return doc;
  });
}

export async function retireDocument(id: string) {
  const [doc] = await getDb()
    .update(knowledgeDocuments)
    .set({ status: "retired" })
    .where(eq(knowledgeDocuments.id, id))
    .returning();
  if (!doc) throw notFound("Document");
  return doc;
}

export async function retrieveKnowledge(query: string, limit = 3, minSimilarity = 0.3): Promise<RetrievedKnowledge[]> {
  const db = getDb();
  const base = {
    documentId: knowledgeChunks.documentId,
    title: knowledgeDocuments.title,
    content: knowledgeChunks.content,
    sourceUrl: knowledgeDocuments.sourceUrl,
  };
  const published = eq(knowledgeDocuments.status, "published");

  const vectors = await tryEmbed([query]);
  let rows: (RetrievedKnowledge & { similarity: number })[];
  if (vectors) {
    const similarity = sql<number>`1 - (${cosineDistance(knowledgeChunks.embedding, vectors[0])})`;
    rows = await db
      .select({ ...base, similarity })
      .from(knowledgeChunks)
      .innerJoin(knowledgeDocuments, eq(knowledgeDocuments.id, knowledgeChunks.documentId))
      .where(and(published, isNotNull(knowledgeChunks.embedding)))
      .orderBy(desc(similarity))
      .limit(limit);
  } else {
    const tsQuery = toPrefixTsQuery(query);
    if (!tsQuery) return [];
    const fts = ftsMatch(sql`to_tsvector('simple', ${knowledgeChunks.content})`, tsQuery);
    rows = await db
      .select({ ...base, similarity: fts.rank })
      .from(knowledgeChunks)
      .innerJoin(knowledgeDocuments, eq(knowledgeDocuments.id, knowledgeChunks.documentId))
      .where(and(published, fts.where))
      .orderBy(desc(fts.rank))
      .limit(limit);
  }
  return rows.filter((r) => r.similarity >= minSimilarity);
}
