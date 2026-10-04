CREATE TYPE "public"."grant_application_status" AS ENUM('draft', 'submitted');--> statement-breakpoint
CREATE TABLE "grant_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" uuid NOT NULL,
	"submission_id" uuid NOT NULL,
	"sections" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "grant_application_status" DEFAULT 'draft' NOT NULL,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grant_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"max_amount" integer,
	"sections" jsonb NOT NULL,
	"criteria" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grant_calls_dates" CHECK ("grant_calls"."ends_on" >= "grant_calls"."starts_on")
);
--> statement-breakpoint
ALTER TABLE "grant_applications" ADD CONSTRAINT "grant_applications_call_id_grant_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "public"."grant_calls"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grant_applications" ADD CONSTRAINT "grant_applications_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "grant_applications_call_id_submission_id_index" ON "grant_applications" USING btree ("call_id","submission_id");--> statement-breakpoint
CREATE INDEX "grant_applications_submission_id_index" ON "grant_applications" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "grant_calls_starts_on_ends_on_index" ON "grant_calls" USING btree ("starts_on","ends_on");