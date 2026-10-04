import "server-only";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/server/db/client";
import { solutions, innovationTesters } from "@/server/db/schema";
import { getEnv } from "@/server/env";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Matchmaking for the admin panel: every submission is matched with its N closest
// published innovations (cosine distance between embeddings). Both directions use
// the same pairs, so "this innovation fits 4 submissions" and "this submission's
// matching innovations" always agree, and no similarity threshold is needed.
const MATCHES_PER_SUBMISSION = 3;
// Cosine distance above which a pair is not a match (text-embedding-3-small). On our
// data real matches sit below 0.50 and chats without a real need start around 0.52,
// so without a cutoff every submission would get three innovations forced on it.
const MAX_MATCH_DISTANCE = 0.5;

export function isSolutionId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export const updateSolutionStatusSchema = z
  .object({ status: z.enum(["draft", "published", "retired"]) })
  .strict();

type MatchRow = { submission_id: string; solution_id: string; distance: number };

// The (submission, solution) pairs; only rows embedded with the current model are
// comparable, the same rule the chat's RAG search uses.
async function matchPairs(filter: { submissionId?: string; solutionId?: string } = {}): Promise<MatchRow[]> {
  const model = getEnv().OPENAI_EMBEDDING_MODEL;
  if (!model) return [];

  const rows = await getDb().execute<MatchRow>(sql`
    with ranked as (
      select
        sub.id as submission_id,
        sol.id as solution_id,
        (sub.embedding <=> sol.embedding) as distance,
        row_number() over (partition by sub.id order by sub.embedding <=> sol.embedding) as rank
      from submissions sub
      cross join solutions sol
      where sub.embedding is not null
        and sub.embedding_model = ${model}
        and sol.embedding is not null
        and sol.embedding_model = ${model}
        and sol.status = 'published'
        ${filter.submissionId ? sql`and sub.id = ${filter.submissionId}` : sql``}
    )
    select submission_id, solution_id, distance
    from ranked
    where rank <= ${MATCHES_PER_SUBMISSION}
      and distance < ${MAX_MATCH_DISTANCE}
      ${filter.solutionId ? sql`and solution_id = ${filter.solutionId}` : sql``}
    order by distance
  `);
  return [...rows];
}

export async function listSolutions() {
  const [rows, pairs] = await Promise.all([
    getDb()
      .select({
        id: solutions.id,
        title: solutions.title,
        description: solutions.description,
        targetGroups: solutions.targetGroups,
        categories: solutions.categories,
        organization: solutions.organization,
        status: solutions.status,
        sourceUrl: solutions.sourceUrl,
        updatedAt: solutions.updatedAt,
        // Fields GET /api/solutions already returned before the admin panel used it.
        authorName: solutions.authorName,
        sourceName: solutions.sourceName,
        externalId: solutions.externalId,
        contactUrl: solutions.contactUrl,
        searchText: solutions.searchText,
        authors: solutions.authors,
        materialsUrls: solutions.materialsUrls,
        videoUrls: solutions.videoUrls,
        termsOfUseUrl: solutions.termsOfUseUrl,
      })
      .from(solutions)
      .orderBy(solutions.title),
    matchPairs(),
  ]);

  const matches = new Map<string, number>();
  for (const pair of pairs) matches.set(pair.solution_id, (matches.get(pair.solution_id) ?? 0) + 1);
  return rows.map((row) => ({ ...row, matchedSubmissions: matches.get(row.id) ?? 0 }));
}

export async function getSolution(id: string) {
  const [row] = await getDb()
    .select({
      id: solutions.id,
      title: solutions.title,
      description: solutions.description,
      problem: solutions.problem,
      categories: solutions.categories,
      targetGroups: solutions.targetGroups,
      implementers: solutions.implementers,
      effectiveness: solutions.effectiveness,
      authors: solutions.authors,
      authorName: solutions.authorName,
      organization: solutions.organization,
      contactUrl: solutions.contactUrl,
      imageUrls: solutions.imageUrls,
      materialsUrls: solutions.materialsUrls,
      videoUrls: solutions.videoUrls,
      termsOfUseUrl: solutions.termsOfUseUrl,
      programName: solutions.programName,
      requiredResources: solutions.requiredResources,
      sourceName: solutions.sourceName,
      sourceUrl: solutions.sourceUrl,
      status: solutions.status,
      updatedAt: solutions.updatedAt,
    })
    .from(solutions)
    .where(eq(solutions.id, id))
    .limit(1);
  return row ?? null;
}

// Submissions that have this innovation among their closest matches.
export async function matchingSubmissions(solutionId: string) {
  const pairs = await matchPairs({ solutionId });
  if (pairs.length === 0) return [];
  const ids = pairs.map((pair) => pair.submission_id);
  const rows = await getDb().execute<{
    id: string;
    title: string;
    type: "problem" | "idea";
    status: string;
    location: string;
    category: string | null;
    created_at: string;
  }>(sql`
    select id, title, type, status, location, category, created_at
    from submissions
    where id in (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})
  `);
  const byId = new Map([...rows].map((row) => [row.id, row]));
  return pairs.flatMap((pair) => {
    const row = byId.get(pair.submission_id);
    return row
      ? [{ id: row.id, title: row.title, type: row.type, status: row.status, location: row.location, category: row.category, createdAt: row.created_at, distance: pair.distance }]
      : [];
  });
}

// The closest published innovations for one submission.
export async function matchingSolutions(submissionId: string) {
  const pairs = await matchPairs({ submissionId });
  if (pairs.length === 0) return [];
  const rows = await getDb()
    .select({ id: solutions.id, title: solutions.title, description: solutions.description, sourceUrl: solutions.sourceUrl })
    .from(solutions)
    .where(sql`${solutions.id} in (${sql.join(pairs.map((pair) => sql`${pair.solution_id}`), sql`, `)})`);
  const byId = new Map(rows.map((row) => [row.id, row]));
  return pairs.flatMap((pair) => {
    const row = byId.get(pair.solution_id);
    return row ? [{ ...row, distance: pair.distance }] : [];
  });
}

export async function updateSolutionStatus(id: string, status: z.infer<typeof updateSolutionStatusSchema>["status"]) {
  const [row] = await getDb()
    .update(solutions)
    .set({ status, updatedAt: new Date() })
    .where(eq(solutions.id, id))
    .returning({ id: solutions.id, status: solutions.status, updatedAt: solutions.updatedAt });
  return row ?? null;
}

export async function getInnovationTesters(solutionId: string) {
  const rows = await getDb()
    .select({
      id: innovationTesters.id,
      fullName: innovationTesters.fullName,
      email: innovationTesters.email,
      organization: innovationTesters.organization,
      motivation: innovationTesters.motivation,
      status: innovationTesters.status,
      createdAt: innovationTesters.createdAt,
    })
    .from(innovationTesters)
    .where(eq(innovationTesters.solutionId, solutionId))
    .orderBy(innovationTesters.createdAt);
  
  return rows;
}
