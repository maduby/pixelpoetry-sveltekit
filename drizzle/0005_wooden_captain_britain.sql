ALTER TABLE "saved_insight" ADD COLUMN "content_kind" text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "saved_insight" ADD COLUMN "content_json" jsonb;