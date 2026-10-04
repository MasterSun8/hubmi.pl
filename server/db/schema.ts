import { sql } from "drizzle-orm";
import {
  check,
  date,
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
// Etap realizacji pomysłu z fiszki (moduł Kreator pomysłów).
export const ideaStage = pgEnum("idea_stage", ["idea", "prototype", "pilot", "running"]);
export const grantApplicationStatus = pgEnum("grant_application_status", ["draft", "submitted"]);

// ---------- Rozmowy ----------

export const conversations = pgTable("conversations", {
  id: uuid().primaryKey().defaultRandom(),
  flow: conversationFlow().notNull().default("unknown"),
  status: conversationStatus().notNull().default("open"),
  // Kanwa innowacji społecznych (moduł Kreator pomysłów, tylko flow = idea): pola kanwy,
  // wstępnie wypełnione przez AI z rozmowy i poprawiane przez użytkownika.
  canvas: jsonb().$type<Record<string, string>>(),
  // Fiszka pomysłu na żywo (flow = idea) i liczba wiadomości, z której powstała: AI liczy ją
  // ponownie dopiero, gdy w rozmowie przybędzie wiadomości.
  ideaCard: jsonb().$type<{ messageCount: number; card: Record<string, unknown> }>(),
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
    // Kto może wdrożyć / skorzystać z rozwiązania (instytucje, organizacje).
    implementers: text(),
    // „Czy to działa?” – wyniki testu innowacji ze źródła.
    effectiveness: text(),
    authors: text().array().notNull().default(sql`'{}'::text[]`),
    authorName: text(),
    organization: text(),
    contactEmail: text(),
    contactPhone: text(),
    contactUrl: text(),
    imageUrls: text().array().notNull().default(sql`'{}'::text[]`),
    // Materiały do pobrania (PDF/ZIP), filmy i zasady wykorzystania (licencja).
    materialsUrls: text().array().notNull().default(sql`'{}'::text[]`),
    videoUrls: text().array().notNull().default(sql`'{}'::text[]`),
    termsOfUseUrl: text(),
    // Program, w którym innowację wybrano do upowszechniania (np. „Inkubator Dostępności”).
    programName: text(),
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

// ---------- Kontakty i Działy ROPS ----------

export const contacts = pgTable("contacts", {
  id: uuid().primaryKey().defaultRandom(),
  department: text().notNull(),
  address: text(),
  openingHours: text().array().notNull().default(sql`'{}'::text[]`),
  phones: jsonb().notNull().default([]), // array of { number, description }
  emails: text().array().notNull().default(sql`'{}'::text[]`),
  roles: jsonb().notNull().default([]), // array of { title, name, email, phone }
  ...timestamps,
});

// ---------- Obserwator Statystyk Społecznych (Wskaźniki Regionalne) ----------

export const regionalStatistics = pgTable("regional_statistics", {
  id: uuid().primaryKey().defaultRandom(),
  category: text().notNull(), // np. 'LUDNOŚĆ'
  indicator: text().notNull(), // np. 'Ludność ogółem'
  region: text().notNull(), // np. 'powiat bocheński', 'Małopolska'
  year: integer().notNull(), // np. 2024
  value: real(), // Wartość liczbowa (jeśli dotyczy)
  valueText: text(), // Wartość tekstowa w razie znaków specjalnych (np. brak danych)
  description: text(), // Opis wskaźnika
  source: text(), // Źródło danych
  ...timestamps,
}, (t) => [
  index().on(t.category),
  index().on(t.indicator),
  index().on(t.region),
  index().on(t.year),
]);

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
    // Fiszka pomysłu (tylko type = idea): na czym polega pomysł i na jakim jest etapie.
    essence: text(),
    stage: ideaStage(),
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
    // AI triage for problems only (null for ideas): 1 low, 2 medium, 3 high, 4 critical.
    riskLevel: integer(),
    riskReasoning: text(),
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
    check("submissions_risk_level_range", sql`${t.riskLevel} between 1 and 4`),
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

// ---------- Nabory i wnioski (moduł 3, generator wniosków) ----------

// Sekcja wniosku w naborze: klucz, nazwa i pytanie pomocnicze dla autora i AI.
export type GrantCallSection = { key: string; label: string; question: string };

export const grantCalls = pgTable(
  "grant_calls",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: text().notNull(),
    description: text().notNull().default(""),
    // Nabór trwa od startsOn do endsOn włącznie; tylko wtedy autor pomysłu widzi „Przygotuj wniosek”.
    startsOn: date().notNull(),
    endsOn: date().notNull(),
    maxAmount: integer(),
    sections: jsonb().$type<GrantCallSection[]>().notNull(),
    // Kryteria oceny – AI bierze je pod uwagę, pisząc wniosek.
    criteria: text().notNull().default(""),
    ...timestamps,
  },
  (t) => [index().on(t.startsOn, t.endsOn), check("grant_calls_dates", sql`${t.endsOn} >= ${t.startsOn}`)],
);

export const grantApplications = pgTable(
  "grant_applications",
  {
    id: uuid().primaryKey().defaultRandom(),
    callId: uuid()
      .notNull()
      .references(() => grantCalls.id, { onDelete: "cascade" }),
    submissionId: uuid()
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    // Treść sekcji wniosku: klucz sekcji naboru → tekst.
    sections: jsonb().$type<Record<string, string>>().notNull().default({}),
    status: grantApplicationStatus().notNull().default("draft"),
    submittedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex().on(t.callId, t.submissionId), index().on(t.submissionId)],
);

// ---------- Tester Innowacji (moduł 4) ----------

export const innovationTesters = pgTable(
  "innovation_testers",
  {
    id: uuid().primaryKey().defaultRandom(),
    solutionId: uuid()
      .notNull()
      .references(() => solutions.id, { onDelete: "cascade" }),
    fullName: text().notNull(),
    email: text().notNull(),
    organization: text(),
    motivation: text(),
    status: submissionStatus().notNull().default("new"),
    ...timestamps,
  },
  (t) => [index().on(t.solutionId)]
);
