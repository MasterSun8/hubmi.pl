CREATE TYPE "public"."idea_stage" AS ENUM('idea', 'prototype', 'pilot', 'running');--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "essence" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "stage" "idea_stage";