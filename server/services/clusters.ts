import { and, asc, count, cosineDistance, desc, eq, isNotNull, max, min, ne, sql } from "drizzle-orm";
import { getDb, type Tx } from "../db/client";
import { problemClusters, submissions } from "../db/schema";
import { notFound } from "../http";

// TODO: kalibracja na prawdziwych danych; uwzględnić lokalizację i grupę odbiorców (README §8).
export const CLUSTER_SIMILARITY_THRESHOLD = 0.85;

export type ClusterCandidate = {
  submissionId: string;
  clusterId: string | null;
  title: string;
  category: string | null;
  location: string;
  similarity: number;
};

export async function findClusterCandidate(embedding: number[], excludeId?: string): Promise<ClusterCandidate | null> {
  const similarity = sql<number>`1 - (${cosineDistance(submissions.embedding, embedding)})`;
  const [nearest] = await getDb()
    .select({
      submissionId: submissions.id,
      clusterId: submissions.clusterId,
      title: submissions.title,
      category: submissions.category,
      location: submissions.location,
      similarity,
    })
    .from(submissions)
    .where(and(isNotNull(submissions.embedding), excludeId ? ne(submissions.id, excludeId) : undefined))
    .orderBy(desc(similarity))
    .limit(1);
  return nearest && nearest.similarity >= CLUSTER_SIMILARITY_THRESHOLD ? nearest : null;
}

// Sygnały w grupie kandydata – wejście do kryterium „powtarzalność” AI Score.
export async function clusterSignals(candidate: ClusterCandidate | null) {
  if (!candidate) return { count: 0, reporterTypes: [] as string[] };
  const where = candidate.clusterId
    ? eq(submissions.clusterId, candidate.clusterId)
    : eq(submissions.id, candidate.submissionId);
  const rows = await getDb().select({ reporterType: submissions.reporterType }).from(submissions).where(where);
  return {
    count: rows.length,
    reporterTypes: [...new Set(rows.flatMap((r) => (r.reporterType ? [r.reporterType] : [])))],
  };
}

// Dołącza nowe zgłoszenie do grupy kandydata; tworzy grupę, jeśli kandydat jeszcze żadnej nie miał.
export async function joinCluster(tx: Tx, submissionId: string, candidate: ClusterCandidate): Promise<string> {
  let clusterId = candidate.clusterId;
  if (!clusterId) {
    const [cluster] = await tx
      .insert(problemClusters)
      .values({ title: candidate.title, category: candidate.category, region: candidate.location })
      .returning({ id: problemClusters.id });
    clusterId = cluster.id;
    await tx.update(submissions).set({ clusterId }).where(eq(submissions.id, candidate.submissionId));
  }
  await tx.update(submissions).set({ clusterId }).where(eq(submissions.id, submissionId));
  return clusterId;
}

const clusterStats = {
  signalsCount: count(submissions.id),
  reporterTypes: sql<string[]>`coalesce(array_agg(distinct ${submissions.reporterType}) filter (where ${submissions.reporterType} is not null), '{}')`,
  // Celowo maksimum, a nie suma: kilka podmiotów może opisywać tę samą grupę osób.
  maxDeclaredPeople: max(submissions.peopleAffected),
  firstSignalAt: min(submissions.createdAt),
  lastSignalAt: max(submissions.createdAt),
};

export async function listClusters() {
  return getDb()
    .select({
      id: problemClusters.id,
      title: problemClusters.title,
      summary: problemClusters.summary,
      category: problemClusters.category,
      region: problemClusters.region,
      createdAt: problemClusters.createdAt,
      ...clusterStats,
    })
    .from(problemClusters)
    .leftJoin(submissions, eq(submissions.clusterId, problemClusters.id))
    .groupBy(problemClusters.id)
    .orderBy(desc(clusterStats.lastSignalAt));
}

export async function getCluster(id: string) {
  const db = getDb();
  const [cluster] = await db.select().from(problemClusters).where(eq(problemClusters.id, id));
  if (!cluster) throw notFound("Cluster");
  const members = await db
    .select({
      id: submissions.id,
      type: submissions.type,
      title: submissions.title,
      location: submissions.location,
      reporterType: submissions.reporterType,
      peopleAffected: submissions.peopleAffected,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.clusterId, id))
    .orderBy(asc(submissions.createdAt));
  return { ...cluster, submissions: members };
}

export async function createCluster(input: typeof problemClusters.$inferInsert) {
  const [cluster] = await getDb().insert(problemClusters).values(input).returning();
  return cluster;
}

export async function updateCluster(id: string, patch: Partial<typeof problemClusters.$inferInsert>) {
  const [cluster] = await getDb().update(problemClusters).set(patch).where(eq(problemClusters.id, id)).returning();
  if (!cluster) throw notFound("Cluster");
  return cluster;
}

// Zgłoszenia zostają, tracą tylko przypisanie (FK on delete set null).
export async function deleteCluster(id: string) {
  const [cluster] = await getDb().delete(problemClusters).where(eq(problemClusters.id, id)).returning();
  if (!cluster) throw notFound("Cluster");
}
