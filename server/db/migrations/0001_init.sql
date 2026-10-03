CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'retired');--> statement-breakpoint
CREATE TYPE "public"."conversation_flow" AS ENUM('unknown', 'help', 'idea');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('open', 'submitted', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant', 'system');--> statement-breakpoint
CREATE TYPE "public"."reporter_type" AS ENUM('individual', 'ngo', 'municipality', 'company', 'other');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('new', 'in_review', 'in_progress', 'resolved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('problem', 'idea');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow" "conversation_flow" DEFAULT 'unknown' NOT NULL,
	"status" "conversation_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "implementation_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"solution_ids" uuid[] NOT NULL,
	"context" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"pilot" text,
	"sourced_facts" text[] DEFAULT '{}'::text[] NOT NULL,
	"assumptions" text[] DEFAULT '{}'::text[] NOT NULL,
	"missing_info" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"content" text NOT NULL,
	"embedding" vector(1536),
	"embedding_model" text,
	"embedding_updated_at" timestamp with time zone,
	"content_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problem_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"category" text,
	"region" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "solutions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"problem" text,
	"categories" text[] DEFAULT '{}'::text[] NOT NULL,
	"target_groups" text[] DEFAULT '{}'::text[] NOT NULL,
	"author_name" text,
	"organization" text,
	"contact_email" text,
	"contact_phone" text,
	"contact_url" text,
	"image_urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"implementation_notes" text,
	"required_resources" text,
	"region" text,
	"source_name" text,
	"source_url" text,
	"external_id" text,
	"fetched_at" timestamp with time zone,
	"import_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "content_status" DEFAULT 'published' NOT NULL,
	"search_text" text NOT NULL,
	"embedding" vector(1536),
	"embedding_model" text,
	"embedding_updated_at" timestamp with time zone,
	"content_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_solutions" (
	"submission_id" uuid NOT NULL,
	"solution_id" uuid NOT NULL,
	"relevance" real,
	CONSTRAINT "submission_solutions_submission_id_solution_id_pk" PRIMARY KEY("submission_id","solution_id")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"type" "submission_type" NOT NULL,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"category" text,
	"target_group" text,
	"location" text NOT NULL,
	"people_affected" integer,
	"reporter_type" "reporter_type",
	"ai_score" integer,
	"ai_score_breakdown" jsonb,
	"ai_score_rationale" text,
	"ai_missing_data" text[] DEFAULT '{}'::text[] NOT NULL,
	"ai_scored_at" timestamp with time zone,
	"priority_override" integer,
	"cluster_id" uuid,
	"admin_notes" text,
	"embedding" vector(1536),
	"embedding_model" text,
	"embedding_updated_at" timestamp with time zone,
	"content_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submissions_conversationId_unique" UNIQUE("conversation_id"),
	CONSTRAINT "submissions_ai_score_range" CHECK ("submissions"."ai_score" between 0 and 100),
	CONSTRAINT "submissions_priority_override_range" CHECK ("submissions"."priority_override" between 0 and 100)
);
--> statement-breakpoint
CREATE TABLE "submitters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"full_name" text,
	"email" text,
	"phone" text,
	"age" integer,
	"social_group" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submitters_submissionId_unique" UNIQUE("submission_id"),
	CONSTRAINT "submitters_contact_required" CHECK ("submitters"."email" is not null or "submitters"."phone" is not null)
);
--> statement-breakpoint
ALTER TABLE "implementation_recommendations" ADD CONSTRAINT "impl_recommendations_conversation_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_document_id_knowledge_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."knowledge_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_solutions" ADD CONSTRAINT "submission_solutions_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_solutions" ADD CONSTRAINT "submission_solutions_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_cluster_id_problem_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."problem_clusters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submitters" ADD CONSTRAINT "submitters_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "implementation_recommendations_conversation_id_index" ON "implementation_recommendations" USING btree ("conversation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_chunks_document_id_chunk_index_index" ON "knowledge_chunks" USING btree ("document_id","chunk_index");--> statement-breakpoint
CREATE INDEX "knowledge_chunks_fts_idx" ON "knowledge_chunks" USING gin (to_tsvector('simple', "content"));--> statement-breakpoint
CREATE INDEX "knowledge_chunks_embedding_idx" ON "knowledge_chunks" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "messages_conversation_id_created_at_index" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "solutions_source_name_external_id_index" ON "solutions" USING btree ("source_name","external_id");--> statement-breakpoint
CREATE INDEX "solutions_status_index" ON "solutions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "solutions_search_text_fts_idx" ON "solutions" USING gin (to_tsvector('simple', "search_text"));--> statement-breakpoint
CREATE INDEX "solutions_embedding_idx" ON "solutions" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "submissions_status_index" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submissions_type_index" ON "submissions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "submissions_location_index" ON "submissions" USING btree ("location");--> statement-breakpoint
CREATE INDEX "submissions_category_index" ON "submissions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "submissions_cluster_id_index" ON "submissions" USING btree ("cluster_id");--> statement-breakpoint
CREATE INDEX "submissions_created_at_index" ON "submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "submissions_embedding_idx" ON "submissions" USING hnsw ("embedding" vector_cosine_ops);