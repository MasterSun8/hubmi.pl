// Backfills submissions that missed the post-save processing (AI summary,
// category, embedding), e.g. ones created before it shipped or during an
// OpenAI outage. Processed rows are skipped, so it is safe to rerun.
//
// Run: pnpm run enrich:submissions
import { asc, isNull } from "drizzle-orm";
import { enrichSubmission } from "@/lib/server/ai/enrich-submission";
import { getDb } from "@/server/db/client";
import { submissions } from "@/server/db/schema";

const db = getDb();

// One at a time: a burst of parallel calls would hit OpenAI rate limits.
const todo = await db
  .select({ id: submissions.id })
  .from(submissions)
  .where(isNull(submissions.embedding))
  .orderBy(asc(submissions.createdAt));

console.log(`Submissions to backfill: ${todo.length}`);

let failed = 0;
for (const [i, { id }] of todo.entries()) {
  try {
    await enrichSubmission(id);
    console.log(`  ${i + 1}/${todo.length} ${id}`);
  } catch (err) {
    failed++;
    console.error(`  ${i + 1}/${todo.length} ${id} failed:`, err);
  }
}

console.log(failed ? `Done, ${failed} failed.` : "Done.");
process.exit(failed ? 1 : 0);
