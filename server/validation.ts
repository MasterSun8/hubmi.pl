import { z } from "zod";

const trimmed = z.string().trim();
const optionalText = trimmed.min(1).nullish();
const stringList = z.array(trimmed.min(1)).default([]);

export const paginationQuery = {
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
};

// ---------- Czat ----------

export const createConversationBody = z
  .object({ flow: z.enum(["unknown", "help", "idea"]).default("unknown") })
  .default({ flow: "unknown" });

export const postMessageBody = z.object({
  content: trimmed.min(1).max(20_000),
});

export const recommendationBody = z.object({
  solutionIds: z.array(z.uuid()).min(1).max(5),
  context: z
    .object({
      teamSize: z.number().int().min(0).optional(),
      peopleAffected: z.number().int().min(0).optional(),
      resources: trimmed.max(2000).optional(),
      location: trimmed.max(200).optional(),
      partners: trimmed.max(2000).optional(),
      notes: trimmed.max(4000).optional(),
    })
    .default({}),
});

// ---------- Zgłoszenie ----------

export const submitBody = z.object({
  // Dane z podsumowania – użytkownik mógł je poprawić przed wysłaniem.
  type: z.enum(["problem", "idea"]),
  title: trimmed.min(1).max(200),
  summary: trimmed.min(1).max(10_000),
  category: optionalText,
  targetGroup: optionalText,
  peopleAffected: z.number().int().min(0).nullish(),
  reporterType: z.enum(["individual", "ngo", "municipality", "company", "other"]).nullish(),
  // Wymagane przed wysłaniem (README §4). Dokładność do ustalenia.
  location: trimmed.min(2).max(200),
  contact: z
    .object({
      fullName: optionalText,
      email: z.email().nullish(),
      phone: trimmed.regex(/^\+?[\d\s-]{6,20}$/, "Invalid phone number").nullish(),
      age: z.number().int().min(0).max(130).nullish(),
      socialGroup: optionalText,
    })
    // Otwarta decyzja: czy wymagać obu kanałów. Na razie wystarczy jeden.
    .refine((c) => c.email || c.phone, { message: "E-mail or phone is required", path: ["email"] }),
});

// ---------- Rozwiązania ----------

export const solutionSearchQuery = z.object({
  q: trimmed.max(500).optional(),
  category: trimmed.optional(),
  targetGroup: trimmed.optional(),
  ...paginationQuery,
});

export const solutionInput = z.object({
  title: trimmed.min(1).max(300),
  description: trimmed.min(1),
  problem: optionalText,
  categories: stringList,
  targetGroups: stringList,
  authorName: optionalText,
  organization: optionalText,
  contactEmail: z.email().nullish(),
  contactPhone: optionalText,
  contactUrl: z.url().nullish(),
  imageUrls: z.array(z.url()).default([]),
  implementationNotes: optionalText,
  requiredResources: optionalText,
  region: optionalText,
  sourceName: optionalText,
  sourceUrl: z.url().nullish(),
  externalId: optionalText,
  fetchedAt: z.coerce.date().nullish(),
  importMetadata: z.record(z.string(), z.unknown()).default({}),
  status: z.enum(["draft", "published", "retired"]).default("published"),
});
export type SolutionInput = z.infer<typeof solutionInput>;

export const solutionPatch = solutionInput.partial();
export type SolutionPatch = z.infer<typeof solutionPatch>;

export const adminSolutionQuery = solutionSearchQuery.extend({
  status: z.enum(["draft", "published", "retired"]).optional(),
});

// ---------- Panel: zgłoszenia ----------

const submissionStatus = z.enum(["new", "in_review", "in_progress", "resolved", "rejected"]);

export const adminSubmissionQuery = z.object({
  status: submissionStatus.optional(),
  type: z.enum(["problem", "idea"]).optional(),
  category: trimmed.optional(),
  location: trimmed.optional(),
  targetGroup: trimmed.optional(),
  socialGroup: trimmed.optional(),
  clusterId: z.uuid().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: trimmed.max(500).optional(),
  sort: z.enum(["priority", "createdAt"]).default("priority"),
  order: z.enum(["asc", "desc"]).default("desc"),
  ...paginationQuery,
});
export type AdminSubmissionQuery = z.infer<typeof adminSubmissionQuery>;

export const adminSubmissionPatch = z.object({
  status: submissionStatus.optional(),
  title: trimmed.min(1).max(200).optional(),
  summary: trimmed.min(1).optional(),
  category: optionalText,
  targetGroup: optionalText,
  location: trimmed.min(2).max(200).optional(),
  peopleAffected: z.number().int().min(0).nullish(),
  reporterType: z.enum(["individual", "ngo", "municipality", "company", "other"]).nullish(),
  priorityOverride: z.number().int().min(0).max(100).nullish(),
  clusterId: z.uuid().nullish(),
  adminNotes: z.string().nullish(),
});

// ---------- Panel: grupy problemów ----------

export const clusterInput = z.object({
  title: trimmed.min(1).max(200),
  summary: optionalText,
  category: optionalText,
  region: optionalText,
});

// ---------- Panel: zasobnik wiedzy ----------

export const knowledgeInput = z.object({
  title: trimmed.min(1).max(300),
  content: trimmed.min(1),
  sourceUrl: z.url().nullish(),
  status: z.enum(["draft", "published", "retired"]).default("published"),
});

export const knowledgePatch = knowledgeInput.partial();

export const statsQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  type: z.enum(["problem", "idea"]).optional(),
});
