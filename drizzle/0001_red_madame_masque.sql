CREATE TABLE "insight_email_delivery" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"summary_id" text,
	"to_email" text NOT NULL,
	"resend_id" text,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insight_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"explainer_slug" text NOT NULL,
	"summary_json" jsonb NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"prompt_version" text NOT NULL,
	"input_hash" text NOT NULL,
	"insight_count" integer NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_insight" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"explainer_slug" text NOT NULL,
	"chapter_id" text NOT NULL,
	"step_id" text NOT NULL,
	"selected_text" text NOT NULL,
	"surrounding_text" text NOT NULL,
	"note" text,
	"selection_hash" text NOT NULL,
	"source_hash" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insight_email_delivery" ADD CONSTRAINT "insight_email_delivery_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_email_delivery" ADD CONSTRAINT "insight_email_delivery_summary_id_insight_summary_id_fk" FOREIGN KEY ("summary_id") REFERENCES "public"."insight_summary"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "insight_summary" ADD CONSTRAINT "insight_summary_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_insight" ADD CONSTRAINT "saved_insight_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "insight_email_delivery_user_created_idx" ON "insight_email_delivery" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "insight_email_delivery_summary_idx" ON "insight_email_delivery" USING btree ("summary_id");--> statement-breakpoint
CREATE INDEX "insight_summary_user_created_idx" ON "insight_summary" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "insight_summary_user_explainer_idx" ON "insight_summary" USING btree ("user_id","explainer_slug");--> statement-breakpoint
CREATE INDEX "saved_insight_user_created_idx" ON "saved_insight" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "saved_insight_user_explainer_idx" ON "saved_insight" USING btree ("user_id","explainer_slug");