// Backfills submissions that missed the post-save processing (AI summary,
// category, embedding, risk level), e.g. ones created before it shipped or
// during an OpenAI outage. Processed rows are skipped, so it is safe to rerun.
//
// Run: pnpm run enrich:submissions
// With --risk it assesses the risk level of every submission again (e.g. after the rules
// in lib/server/ai/risk.ts change) and leaves summaries and embeddings alone.
import { asc, isNull, or } from "drizzle-orm";
import { enrichSubmission, reassessRisk } from "@/lib/server/ai/enrich-submission";
import { getDb } from "@/server/db/client";
import { submissions } from "@/server/db/schema";

const db = getDb();
const riskOnly = process.argv.includes("--risk");

// One at a time: a burst of parallel calls would hit OpenAI rate limits.
const todo = await db
  .select({ id: submissions.id })
  .from(submissions)
  .where(riskOnly ? undefined : or(isNull(submissions.embedding), isNull(submissions.riskLevel)))
  .orderBy(asc(submissions.createdAt));

console.log(`Submissions to backfill: ${todo.length}`);

let failed = 0;
for (const [i, { id }] of todo.entries()) {
  try {
    await (riskOnly ? reassessRisk(id) : enrichSubmission(id));
    console.log(`  ${i + 1}/${todo.length} ${id}`);
  } catch (err) {
    failed++;
    console.error(`  ${i + 1}/${todo.length} ${id} failed:`, err);
  }
}

console.log(failed ? `Done, ${failed} failed.` : "Done.");
process.exit(failed ? 1 : 0);
