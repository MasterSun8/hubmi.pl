import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from "drizzle-orm";
import type { z } from "zod";
import { AiNotImplementedError, getAi, tryEmbed, type RetrievedSolution, type ScoreOutput, type SubmissionDraft } from "../ai";
import { getDb } from "../db/client";
import {
  conversations,
  implementationRecommendations,
  messages,
  problemClusters,
  solutions,
  submissionSolutions,
  submissions,
  submitters,
} from "../db/schema";
import { HttpError, notFound } from "../http";
import type { AdminSubmissionQuery, adminSubmissionPatch, submitBody } from "../validation";
import { clusterSignals, findClusterCandidate, joinCluster } from "./clusters";
import { citedSolutionIds, getOpenConversation, toChatTurns } from "./conversations";
import { sha256 } from "./search";
import { retrieveSolutions } from "./solutions";

// Priorytet w kolejce: korekta administratora ma pierwszeństwo przed AI Score.
const priority = sql<number | null>`coalesce(${submissions.priorityOverride}, ${submissions.aiScore})`;

async function tryScore(input: Parameters<ReturnType<typeof getAi>["scoreSubmission"]>[0]): Promise<ScoreOutput | null> {
  try {
    return await getAi().scoreSubmission(input);
  } catch (error) {
    if (error instanceof AiNotImplementedError) return null;
    throw error;
  }
}

function scoreFields(score: ScoreOutput | null) {
  if (!score) return {};
  return {
    aiScore: Math.round(Math.max(0, Math.min(100, score.score))),
    aiScoreBreakdown: score.breakdown,
    aiScoreRationale: score.rationale,
    aiMissingData: score.missingData,
    aiScoredAt: new Date(),
  };
}

// Podsumowanie do pokazania użytkownikowi przed wysłaniem (może je poprawić).
export async function previewSubmission(conversationId: string): Promise<SubmissionDraft> {
  const conversation = await getOpenConversation(conversationId);
  const history = toChatTurns(conversation.messages);
  if (!history.some((m) => m.role === "user")) throw new HttpError(400, "Conversation has no user messages");
  return getAi().extractSubmission(history);
}

export async function submitConversation(conversationId: string, body: z.infer<typeof submitBody>) {
  const conversation = await getOpenConversation(conversationId);
  const history = toChatTurns(conversation.messages);
  if (!history.some((m) => m.role === "user")) throw new HttpError(400, "Conversation has no user messages");

  const embedText = `${body.title}\n${body.summary}`;
  const [vectors, matched] = await Promise.all([tryEmbed([embedText]), retrieveSolutions(body.summary)]);
  const embedding = vectors?.[0] ?? null;

  const candidate = embedding ? await findClusterCandidate(embedding) : null;
  const signals = await clusterSignals(candidate);

  const draft: SubmissionDraft = {
    type: body.type,
    title: body.title,
    summary: body.summary,
    category: body.category ?? null,
    targetGroup: body.targetGroup ?? null,
    peopleAffected: body.peopleAffected ?? null,
    reporterType: body.reporterType ?? null,
    locationHint: null,
  };
  const score = await tryScore({
    draft,
    location: body.location,
    history,
    matchedSolutions: matched,
    similarSubmissionsCount: signals.count,
    similarReporterTypes: signals.reporterTypes,
  });

  // Powiązane rozwiązania: pokazane w rozmowie + dopasowane do podsumowania.
  const relevance = new Map<string, number | null>(citedSolutionIds(conversation.messages).map((id) => [id, null]));
  for (const s of matched) relevance.set(s.id, s.similarity);

  return getDb().transaction(async (tx) => {
    const [submission] = await tx
      .insert(submissions)
      .values({
        conversationId,
        type: body.type,
        title: body.title,
        summary: body.summary,
        category: body.category ?? null,
        targetGroup: body.targetGroup ?? null,
        location: body.location,
        peopleAffected: body.peopleAffected ?? null,
        reporterType: body.reporterType ?? null,
        ...scoreFields(score),
        embedding,
        embeddingModel: embedding ? getAi().embeddingModel : null,
        embeddingUpdatedAt: embedding ? new Date() : null,
        contentHash: sha256(embedText),
      })
      .returning({ id: submissions.id });

    await tx.insert(submitters).values({ submissionId: submission.id, ...body.contact });

    if (relevance.size) {
      await tx
        .insert(submissionSolutions)
        .values([...relevance].map(([solutionId, rel]) => ({ submissionId: submission.id, solutionId, relevance: rel })))
        .onConflictDoNothing();
    }

    const clusterId = candidate ? await joinCluster(tx, submission.id, candidate) : null;

    await tx.update(conversations).set({ status: "submitted" }).where(eq(conversations.id, conversationId));

    return { id: submission.id, clusterId, aiScore: score?.score ?? null };
  });
}

// ---------- Panel ----------

const listColumns = {
  id: submissions.id,
  type: submissions.type,
  status: submissions.status,
  title: submissions.title,
  summary: sql<string>`left(${submissions.summary}, 300)`,
  category: submissions.category,
  targetGroup: submissions.targetGroup,
  location: submissions.location,
  peopleAffected: submissions.peopleAffected,
  reporterType: submissions.reporterType,
  aiScore: submissions.aiScore,
  priorityOverride: submissions.priorityOverride,
  priority,
  clusterId: submissions.clusterId,
  createdAt: submissions.createdAt,
};

export async function listSubmissions(q: AdminSubmissionQuery) {
  const filters: SQL[] = [];
  if (q.status) filters.push(eq(submissions.status, q.status));
  if (q.type) filters.push(eq(submissions.type, q.type));
  if (q.category) filters.push(eq(submissions.category, q.category));
  if (q.targetGroup) filters.push(eq(submissions.targetGroup, q.targetGroup));
  if (q.location) filters.push(ilike(submissions.location, `%${q.location}%`));
  if (q.socialGroup) filters.push(eq(submitters.socialGroup, q.socialGroup));
  if (q.clusterId) filters.push(eq(submissions.clusterId, q.clusterId));
  if (q.from) filters.push(gte(submissions.createdAt, q.from));
  if (q.to) filters.push(lte(submissions.createdAt, q.to));
  if (q.q) filters.push(or(ilike(submissions.title, `%${q.q}%`), ilike(submissions.summary, `%${q.q}%`))!);
  const where = and(...filters);

  const dir = q.order === "asc" ? asc : desc;
  const orderBy =
    q.sort === "priority"
      ? [sql`${priority} ${sql.raw(q.order)} nulls last`, desc(submissions.createdAt)]
      : [dir(submissions.createdAt)];

  const db = getDb();
  const [items, [{ total }]] = await Promise.all([
    db
      .select(listColumns)
      .from(submissions)
      .leftJoin(submitters, eq(submitters.submissionId, submissions.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(q.limit)
      .offset(q.offset),
    db
      .select({ total: count() })
      .from(submissions)
      .leftJoin(submitters, eq(submitters.submissionId, submissions.id))
      .where(where),
  ]);
  return { items, total, limit: q.limit, offset: q.offset };
}

export async function getSubmissionDetail(id: string) {
  const db = getDb();
  const [submission] = await db
    .select({
      ...listColumns,
      summary: submissions.summary,
      conversationId: submissions.conversationId,
      aiScoreBreakdown: submissions.aiScoreBreakdown,
      aiScoreRationale: submissions.aiScoreRationale,
      aiMissingData: submissions.aiMissingData,
      aiScoredAt: submissions.aiScoredAt,
      adminNotes: submissions.adminNotes,
      updatedAt: submissions.updatedAt,
    })
    .from(submissions)
    .where(eq(submissions.id, id));
  if (!submission) throw notFound("Submission");

  const [[submitter], history, linkedSolutions, [cluster], recommendations] = await Promise.all([
    db.select().from(submitters).where(eq(submitters.submissionId, id)),
    // Pełna historia czatu, nie tylko streszczenie AI.
    db
      .select({ id: messages.id, role: messages.role, content: messages.content, metadata: messages.metadata, createdAt: messages.createdAt })
      .from(messages)
      .where(eq(messages.conversationId, submission.conversationId))
      .orderBy(asc(messages.createdAt)),
    db
      .select({ id: solutions.id, title: solutions.title, sourceUrl: solutions.sourceUrl, relevance: submissionSolutions.relevance })
      .from(submissionSolutions)
      .innerJoin(solutions, eq(solutions.id, submissionSolutions.solutionId))
      .where(eq(submissionSolutions.submissionId, id)),
    submission.clusterId
      ? db
          .select({ id: problemClusters.id, title: problemClusters.title, signalsCount: count(submissions.id) })
          .from(problemClusters)
          .leftJoin(submissions, eq(submissions.clusterId, problemClusters.id))
          .where(eq(problemClusters.id, submission.clusterId))
          .groupBy(problemClusters.id)
      : Promise.resolve([]),
    db
      .select()
      .from(implementationRecommendations)
      .where(eq(implementationRecommendations.conversationId, submission.conversationId))
      .orderBy(desc(implementationRecommendations.createdAt)),
  ]);

  return { ...submission, submitter: submitter ?? null, messages: history, solutions: linkedSolutions, cluster: cluster ?? null, recommendations };
}

export async function updateSubmission(id: string, patch: z.infer<typeof adminSubmissionPatch>) {
  const db = getDb();
  if (patch.clusterId) {
    const [cluster] = await db.select({ id: problemClusters.id }).from(problemClusters).where(eq(problemClusters.id, patch.clusterId));
    if (!cluster) throw new HttpError(400, "Cluster does not exist");
  }
  const [row] = await db.update(submissions).set(patch).where(eq(submissions.id, id)).returning({ id: submissions.id });
  if (!row) throw notFound("Submission");
  return getSubmissionDetail(id);
}

// Ponowne wyliczenie AI Score, np. po poprawkach administratora lub zmianie grupy problemów.
export async function rescoreSubmission(id: string) {
  const db = getDb();
  const [s] = await db.select().from(submissions).where(eq(submissions.id, id));
  if (!s) throw notFound("Submission");

  const history = toChatTurns(
    await db.select().from(messages).where(eq(messages.conversationId, s.conversationId)).orderBy(asc(messages.createdAt)),
  );
  const matched: RetrievedSolution[] = await retrieveSolutions(s.summary);
  const peers = s.clusterId
    ? await db.select({ reporterType: submissions.reporterType }).from(submissions).where(eq(submissions.clusterId, s.clusterId))
    : [];
  const others = peers.length ? peers.length - 1 : 0;

  const score = await getAi().scoreSubmission({
    draft: {
      type: s.type,
      title: s.title,
      summary: s.summary,
      category: s.category,
      targetGroup: s.targetGroup,
      peopleAffected: s.peopleAffected,
      reporterType: s.reporterType,
      locationHint: null,
    },
    location: s.location,
    history,
    matchedSolutions: matched,
    similarSubmissionsCount: others,
    similarReporterTypes: [...new Set(peers.flatMap((p) => (p.reporterType ? [p.reporterType] : [])))],
  });
  await db.update(submissions).set(scoreFields(score)).where(eq(submissions.id, id));
  return getSubmissionDetail(id);
}

// Dane do mapy problemów i trendów (sygnały ze zgłoszeń; dane ze scrapowania ROPS – osobny strumień, TODO).
export async function submissionStats(q: { from?: Date; to?: Date; type?: "problem" | "idea" }) {
  const filters: SQL[] = [];
  if (q.from) filters.push(gte(submissions.createdAt, q.from));
  if (q.to) filters.push(lte(submissions.createdAt, q.to));
  if (q.type) filters.push(eq(submissions.type, q.type));
  const where = and(...filters);
  const month = sql<string>`to_char(date_trunc('month', ${submissions.createdAt}), 'YYYY-MM')`;

  const db = getDb();
  const [byLocation, byMonth] = await Promise.all([
    db
      .select({ location: submissions.location, category: submissions.category, signals: count() })
      .from(submissions)
      .where(where)
      .groupBy(submissions.location, submissions.category)
      .orderBy(desc(count())),
    db
      .select({ month, category: submissions.category, signals: count() })
      .from(submissions)
      .where(where)
      .groupBy(month, submissions.category)
      .orderBy(month),
  ]);
  return { byLocation, byMonth };
}
