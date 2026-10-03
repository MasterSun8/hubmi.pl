import { sql } from "drizzle-orm";
import {
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";

// Musi odpowiadać OPENAI_EMBEDDING_DIMENSIONS. Zmiana = nowa migracja + reindeksacja.
export const EMBEDDING_DIMENSIONS = 1536;

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const embeddingColumns = {
  embedding: vector({ dimensions: EMBEDDING_DIMENSIONS }),
  embeddingModel: text(),
  embeddingUpdatedAt: timestamp({ withTimezone: true }),
  // Hash tekstu, z którego policzono embedding – przeliczamy tylko po zmianie treści lub modelu.
  contentHash: text(),
};

// ---------- Enumy ----------

export const conversationFlow = pgEnum("conversation_flow", ["unknown", "help", "idea"]);
export const conversationStatus = pgEnum("conversation_status", ["open", "submitted", "abandoned"]);
export const messageRole = pgEnum("message_role", ["user", "assistant", "system"]);
export const submissionType = pgEnum("submission_type", ["problem", "idea"]);
export const submissionStatus = pgEnum("submission_status", [
  "new",
  "in_review",
  "in_progress",
  "resolved",
  "rejected",
]);
export const reporterType = pgEnum("reporter_type", [
  "individual",
  "ngo",
  "municipality",
  "company",
  "other",
]);
export const contentStatus = pgEnum("content_status", ["draft", "published", "retired"]);

// ---------- Rozmowy ----------

export const conversations = pgTable("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  flow: conversationFlow().notNull().default("unknown"),
  status: conversationStatus().notNull().default("open"),
  ...timestamps,
});

export const messages = pgTable(
  "messages",
  {
    id: uuid().primaryKey().defaultRandom(),
    conversationId: uuid()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRole().notNull(),
    content: text().notNull(),
    // Np. { citedSolutionIds: [...], retrieved: [...], missingInfo: [...] }
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.conversationId, t.createdAt)],
);

// ---------- Baza rozwiązań (moduł 4, RAG) ----------

export const solutions = pgTable(
  "solutions",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    description: text().notNull(),
    problem: text(),
    categories: text().array().notNull().default(sql`'{}'::text[]`),
    targetGroups: text().array().notNull().default(sql`'{}'::text[]`),
    authorName: text(),
    organization: text(),
    contactEmail: text(),
    contactPhone: text(),
    contactUrl: text(),
    imageUrls: text().array().notNull().default(sql`'{}'::text[]`),
    implementationNotes: text(),
    requiredResources: text(),
    region: text(),
    // Pochodzenie rekordu
    sourceName: text(),
    sourceUrl: text(),
    externalId: text(),
    fetchedAt: timestamp({ withTimezone: true }),
    importMetadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    status: contentStatus().notNull().default("published"),
    searchText: text().notNull(),
    ...embeddingColumns,
    ...timestamps,
  },
  (t) => [
    uniqueIndex().on(t.sourceName, t.externalId),
    index().on(t.status),
    index("solutions_search_text_fts_idx").using("gin", sql`to_tsvector('simple', ${t.searchText})`),
    index("solutions_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

// ---------- Zasobnik wiedzy ROPS (moduł 6) ----------

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  content: text().notNull(),
  sourceUrl: text(),
  status: contentStatus().notNull().default("published"),
  ...timestamps,
});

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid().primaryKey().defaultRandom(),
    documentId: uuid()
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    chunkIndex: integer().notNull(),
    content: text().notNull(),
    ...embeddingColumns,
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex().on(t.documentId, t.chunkIndex),
    index("knowledge_chunks_fts_idx").using("gin", sql`to_tsvector('simple', ${t.content})`),
    index("knowledge_chunks_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

// ---------- Grupy problemów (agregacja sygnałów) ----------

export const problemClusters = pgTable("problem_clusters", {
  id: uuid().primaryKey().defaultRandom(),
  title: text().notNull(),
  summary: text(),
  category: text(),
  region: text(),
  ...timestamps,
});

// ---------- Zgłoszenia (panel „Grażynka”) ----------

export type AiScoreBreakdown = {
  urgency: number;
  scale: number;
  supportGap: number;
  recurrence: number;
};

export const submissions = pgTable(
  "submissions",
  {
    id: uuid().primaryKey().defaultRandom(),
    conversationId: uuid()
      .notNull()
      .unique()
      .references(() => conversations.id, { onDelete: "restrict" }),
    type: submissionType().notNull(),
    status: submissionStatus().notNull().default("new"),
    title: text().notNull(),
    summary: text().notNull(),
    category: text(),
    targetGroup: text(),
    // Lokalizacja zamieszkania z formularza (dokładność do ustalenia: miejscowość/gmina).
    location: text().notNull(),
    // Deklarowana liczba osób – nie sumować bez weryfikacji między zgłoszeniami.
    peopleAffected: integer(),
    reporterType: reporterType(),
    aiScore: integer(),
    aiScoreBreakdown: jsonb().$type<AiScoreBreakdown>(),
    aiScoreRationale: text(),
    aiMissingData: text().array().notNull().default(sql`'{}'::text[]`),
    aiScoredAt: timestamp({ withTimezone: true }),
    // Ręczna korekta priorytetu przez administratora (ma pierwszeństwo przed aiScore).
    priorityOverride: integer(),
    clusterId: uuid().references(() => problemClusters.id, { onDelete: "set null" }),
    adminNotes: text(),
    ...embeddingColumns,
    ...timestamps,
  },
  (t) => [
    index().on(t.status),
    index().on(t.type),
    index().on(t.location),
    index().on(t.category),
    index().on(t.clusterId),
    index().on(t.createdAt),
    index("submissions_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
    check("submissions_ai_score_range", sql`${t.aiScore} between 0 and 100`),
    check("submissions_priority_override_range", sql`${t.priorityOverride} between 0 and 100`),
  ],
);

// Dane osobowe trzymamy osobno, żeby łatwiej było później ograniczyć do nich dostęp (RODO).
export const submitters = pgTable(
  "submitters",
  {
    id: uuid().primaryKey().defaultRandom(),
    submissionId: uuid()
      .notNull()
      .unique()
      .references(() => submissions.id, { onDelete: "cascade" }),
    fullName: text(),
    email: text(),
    phone: text(),
    age: integer(),
    socialGroup: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("submitters_contact_required", sql`${t.email} is not null or ${t.phone} is not null`)],
);

export const submissionSolutions = pgTable(
  "submission_solutions",
  {
    submissionId: uuid()
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    solutionId: uuid()
      .notNull()
      .references(() => solutions.id, { onDelete: "cascade" }),
    relevance: real(),
  },
  (t) => [primaryKey({ columns: [t.submissionId, t.solutionId] })],
);

// ---------- Rekomendacje wdrożenia (moduł 7, middleman) ----------

export type RecommendationStep = { title: string; description: string; roles?: string[] };

export const implementationRecommendations = pgTable(
  "implementation_recommendations",
  {
    id: uuid().primaryKey().defaultRandom(),
    conversationId: uuid().notNull(),
    solutionIds: uuid().array().notNull(),
    // Wejście: wielkość zespołu, zasoby, skala potrzeby, kontekst lokalny
    context: jsonb().$type<Record<string, unknown>>().notNull(),
    steps: jsonb().$type<RecommendationStep[]>().notNull(),
    pilot: text(),
    // Oddzielamy informacje ze źródeł od założeń modelu.
    sourcedFacts: text().array().notNull().default(sql`'{}'::text[]`),
    assumptions: text().array().notNull().default(sql`'{}'::text[]`),
    missingInfo: text().array().notNull().default(sql`'{}'::text[]`),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Jawna nazwa – domyślna przekracza limit 63 znaków identyfikatora w Postgresie.
    foreignKey({
      name: "impl_recommendations_conversation_fk",
      columns: [t.conversationId],
      foreignColumns: [conversations.id],
    }).onDelete("cascade"),
    index().on(t.conversationId),
  ],
);
