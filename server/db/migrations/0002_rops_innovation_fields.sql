ALTER TABLE "solutions" ADD COLUMN "implementers" text;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "effectiveness" text;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "authors" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "materials_urls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "video_urls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "terms_of_use_url" text;--> statement-breakpoint
ALTER TABLE "solutions" ADD COLUMN "program_name" text;