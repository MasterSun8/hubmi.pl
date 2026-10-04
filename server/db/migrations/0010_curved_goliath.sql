CREATE TABLE "innovation_testers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solution_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text,
	"motivation" text,
	"status" "submission_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "innovation_testers" ADD CONSTRAINT "innovation_testers_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "innovation_testers_solution_id_index" ON "innovation_testers" USING btree ("solution_id");