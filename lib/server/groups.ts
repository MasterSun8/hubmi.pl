import "server-only";

import { and, count, eq, ilike, isNotNull, max, sql } from "drizzle-orm";
import { SUBMISSION_CATEGORIES } from "@/lib/server/ai/prompts/submission-summary";
import { getDb } from "@/server/db/client";
import { submissions } from "@/server/db/schema";

// Groups are the fixed category list the AI assigns in enrichSubmission;
// the category column is the group, there is no separate table.
export type SubmissionGroup = {
  category: (typeof SUBMISSION_CATEGORIES)[number];
  count: number;
  // How many places report it: a hint the problem is systemic.
  locations: string[];
  lastSubmissionAt: Date | null;
};

export type GroupFilters = {
  // Substring match: location is free text from the form ("gm. Słomniki").
  location?: string;
  type?: (typeof submissions.$inferSelect)["type"];
  status?: (typeof submissions.$inferSelect)["status"];
};

export async function listGroups(filters: GroupFilters) {
  const rows = await getDb()
    .select({
      category: submissions.category,
      count: count(),
      locations: sql<string[]>`array_agg(distinct ${submissions.location} order by ${submissions.location})`,
      lastSubmissionAt: max(submissions.createdAt),
    })
    .from(submissions)
    .where(
      and(
        isNotNull(submissions.category),
        filters.location ? ilike(submissions.location, `%${escapeLike(filters.location)}%`) : undefined,
        filters.type ? eq(submissions.type, filters.type) : undefined,
        filters.status ? eq(submissions.status, filters.status) : undefined,
      ),
    )
    .groupBy(submissions.category);

  // Every group is listed, empty ones too, so the panel always shows the
  // same set. Biggest first; ties keep the order of the category list.
  const groups: SubmissionGroup[] = SUBMISSION_CATEGORIES.map((category) => {
    const row = rows.find((r) => r.category === category);
    return {
      category,
      count: row?.count ?? 0,
      locations: row?.locations ?? [],
      lastSubmissionAt: row?.lastSubmissionAt ?? null,
    };
  });
  return groups.sort((a, b) => b.count - a.count);
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
