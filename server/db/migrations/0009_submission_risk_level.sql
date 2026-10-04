ALTER TABLE "submissions" ADD COLUMN "risk_level" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "risk_reasoning" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_risk_level_range" CHECK ("submissions"."risk_level" between 1 and 4);