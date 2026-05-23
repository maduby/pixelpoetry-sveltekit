CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TABLE "insight_summary_source" (
	"id" text PRIMARY KEY NOT NULL,
	"summary_id" text NOT NULL,
	"source_chunk_id" text NOT NULL,
	"source_document_id" text NOT NULL,
	"score" real NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_insight_source_match" (
	"id" text PRIMARY KEY NOT NULL,
	"saved_insight_id" text NOT NULL,
	"source_chunk_id" text NOT NULL,
	"source_document_id" text NOT NULL,
	"score" real NOT NULL,
	"match_reason" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_chunk" (
	"id" text PRIMARY KEY NOT NULL,
	"source_document_id" text NOT NULL,
	"source_id" text NOT NULL,
	"explainer_slug" text NOT NULL,
	"chapter_id" text,
	"step_id" text,
	"chunk_kind" text NOT NULL,
	"chunk_text" text NOT NULL,
	"url" text,
	"content_hash" text NOT NULL,
	"embedding" vector(1536),
	"embedding_model" text,
	"embedded_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_document" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"explainer_slug" text NOT NULL,
	"short" text NOT NULL,
	"full" text NOT NULL,
	"url" text,
	"year" integer NOT NULL,
	"content_hash" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insight_summary_source" ADD CONSTRAINT "insight_summary_source_summary_id_insight_summary_id_fk" FOREIGN KEY ("summary_id") REFERENCES "public"."insight_summary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_summary_source" ADD CONSTRAINT "insight_summary_source_source_chunk_id_source_chunk_id_fk" FOREIGN KEY ("source_chunk_id") REFERENCES "public"."source_chunk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_summary_source" ADD CONSTRAINT "insight_summary_source_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insight_source_match" ADD CONSTRAINT "saved_insight_source_match_saved_insight_id_saved_insight_id_fk" FOREIGN KEY ("saved_insight_id") REFERENCES "public"."saved_insight"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insight_source_match" ADD CONSTRAINT "saved_insight_source_match_source_chunk_id_source_chunk_id_fk" FOREIGN KEY ("source_chunk_id") REFERENCES "public"."source_chunk"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insight_source_match" ADD CONSTRAINT "saved_insight_source_match_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_chunk" ADD CONSTRAINT "source_chunk_source_document_id_source_document_id_fk" FOREIGN KEY ("source_document_id") REFERENCES "public"."source_document"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "insight_summary_source_uidx" ON "insight_summary_source" USING btree ("summary_id","source_chunk_id");--> statement-breakpoint
CREATE INDEX "insight_summary_source_summary_idx" ON "insight_summary_source" USING btree ("summary_id");--> statement-breakpoint
CREATE INDEX "insight_summary_source_source_idx" ON "insight_summary_source" USING btree ("source_document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_insight_source_match_uidx" ON "saved_insight_source_match" USING btree ("saved_insight_id","source_chunk_id");--> statement-breakpoint
CREATE INDEX "saved_insight_source_match_insight_idx" ON "saved_insight_source_match" USING btree ("saved_insight_id");--> statement-breakpoint
CREATE INDEX "saved_insight_source_match_source_idx" ON "saved_insight_source_match" USING btree ("source_document_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_chunk_content_hash_uidx" ON "source_chunk" USING btree ("content_hash");--> statement-breakpoint
CREATE INDEX "source_chunk_explainer_idx" ON "source_chunk" USING btree ("explainer_slug");--> statement-breakpoint
CREATE INDEX "source_chunk_source_document_idx" ON "source_chunk" USING btree ("source_document_id");--> statement-breakpoint
CREATE INDEX "source_chunk_context_idx" ON "source_chunk" USING btree ("explainer_slug","chapter_id","step_id");--> statement-breakpoint
CREATE UNIQUE INDEX "source_document_explainer_source_uidx" ON "source_document" USING btree ("explainer_slug","source_id");--> statement-breakpoint
CREATE INDEX "source_document_explainer_idx" ON "source_document" USING btree ("explainer_slug");
