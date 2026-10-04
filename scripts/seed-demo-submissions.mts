// Loads the demo submissions from app/data/demo_submissions.json: fictional residents, NGOs and
// municipalities across Małopolska, each with its chat. Every row then goes through the same AI
// enrichment as a real submission (summary, category, risk level, embedding, idea card), so the
// admin panel shows what the system actually produces.
//
// Ids are derived from each record's key, so a rerun replaces the demo rows and leaves the rest.
// Run: pnpm seed:demo
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { inArray } from "drizzle-orm";
import { enrichSubmission } from "@/lib/server/ai/enrich-submission";
import { getDb } from "@/server/db/client";
import { conversations, messages, submissions, submitters } from "@/server/db/schema";

type DemoSubmission = {
  key: string;
  type: "problem" | "idea";
  status: "new" | "in_review" | "in_progress" | "resolved" | "rejected";
  daysAgo: number;
  location: string;
  peopleAffected: number | null;
  reporterType: "individual" | "ngo" | "municipality" | "company" | "other";
  submitter: { fullName?: string; email?: string; phone?: string; age?: number; socialGroup?: string };
  canvas?: Record<string, string>;
  messages: { role: "user" | "assistant"; content: string }[];
};

const demo: DemoSubmission[] = JSON.parse(readFileSync("app/data/demo_submissions.json", "utf8"));
const db = getDb();

// A stable v4-shaped uuid per record, so lib/server/submissions.ts accepts it as a submission id.
function demoId(kind: "conversation" | "submission", key: string) {
  const hex = createHash("sha256").update(`hubmi-demo:${kind}:${key}`).digest("hex");
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

const MINUTE = 60_000;

// Submissions reference conversations with "restrict", so they go first.
await db.delete(submissions).where(inArray(submissions.id, demo.map((item) => demoId("submission", item.key))));
await db.delete(conversations).where(inArray(conversations.id, demo.map((item) => demoId("conversation", item.key))));

for (const item of demo) {
  const conversationId = demoId("conversation", item.key);
  const submissionId = demoId("submission", item.key);
  // The chat starts a few minutes before the submission, one message per minute.
  const submittedAt = new Date(Date.now() - item.daysAgo * 24 * 60 * MINUTE);
  const startedAt = new Date(submittedAt.getTime() - (item.messages.length + 1) * MINUTE);
  const userText = item.messages.filter((message) => message.role === "user").map((message) => message.content);

  await db.transaction(async (tx) => {
    await tx.insert(conversations).values({
      id: conversationId,
      flow: item.type === "problem" ? "help" : "idea",
      status: "submitted",
      canvas: item.canvas ?? null,
      createdAt: startedAt,
      updatedAt: submittedAt,
    });
    await tx.insert(messages).values(
      item.messages.map((message, index) => ({
        conversationId,
        role: message.role,
        content: message.content,
        createdAt: new Date(startedAt.getTime() + index * MINUTE),
      })),
    );
    // Title and summary are the raw draft the chat would send; enrichment rewrites both.
    await tx.insert(submissions).values({
      id: submissionId,
      conversationId,
      type: item.type,
      status: item.status,
      title: userText[0].slice(0, 80),
      summary: userText.join("\n\n"),
      location: item.location,
      peopleAffected: item.peopleAffected,
      reporterType: item.reporterType,
      createdAt: submittedAt,
      updatedAt: submittedAt,
    });
    await tx.insert(submitters).values({ submissionId, ...item.submitter, createdAt: submittedAt });
  });
}
console.log(`Inserted ${demo.length} demo submissions, enriching…`);

// One at a time: a burst of parallel calls would hit OpenAI rate limits.
let failed = 0;
for (const [i, item] of demo.entries()) {
  try {
    await enrichSubmission(demoId("submission", item.key));
    console.log(`  ${i + 1}/${demo.length} ${item.key}`);
  } catch (err) {
    failed++;
    console.error(`  ${i + 1}/${demo.length} ${item.key} failed:`, err);
  }
}

console.log(failed ? `Done, ${failed} enrichments failed (rerun pnpm enrich:submissions).` : "Done.");
process.exit(failed ? 1 : 0);
