CREATE TABLE "error_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" bigint,
	"source" varchar(128) NOT NULL,
	"error_name" varchar(128) NOT NULL,
	"error_message" text NOT NULL,
	"error_stack" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"lastfm_username" varchar(64),
	"preferred_locale" varchar(10),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_user_id_unique" UNIQUE("telegram_user_id")
);
--> statement-breakpoint
CREATE INDEX "users_lastfm_username_idx" ON "users" USING btree ("lastfm_username");