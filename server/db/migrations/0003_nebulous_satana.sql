CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department" text NOT NULL,
	"address" text,
	"opening_hours" text[] DEFAULT '{}'::text[] NOT NULL,
	"phones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"emails" text[] DEFAULT '{}'::text[] NOT NULL,
	"roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regional_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"indicator" text NOT NULL,
	"region" text NOT NULL,
	"year" integer NOT NULL,
	"value" real,
	"value_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "regional_statistics_category_index" ON "regional_statistics" USING btree ("category");--> statement-breakpoint
CREATE INDEX "regional_statistics_indicator_index" ON "regional_statistics" USING btree ("indicator");--> statement-breakpoint
CREATE INDEX "regional_statistics_region_index" ON "regional_statistics" USING btree ("region");--> statement-breakpoint
CREATE INDEX "regional_statistics_year_index" ON "regional_statistics" USING btree ("year");