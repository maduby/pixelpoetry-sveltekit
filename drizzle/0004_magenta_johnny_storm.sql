CREATE TABLE "ai_usage_reset" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"week_start" timestamp NOT NULL,
	"reset_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_usage_reset" ADD CONSTRAINT "ai_usage_reset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_usage_reset_user_week_uidx" ON "ai_usage_reset" USING btree ("user_id","week_start");--> statement-breakpoint
CREATE INDEX "ai_usage_reset_user_idx" ON "ai_usage_reset" USING btree ("user_id");