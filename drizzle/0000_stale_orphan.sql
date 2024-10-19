CREATE TABLE IF NOT EXISTS "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"bio" varchar(255),
	"telegram_id" integer NOT NULL,
	"lastfm_session_key" varchar(255),
	"created_at" date DEFAULT 'now()' NOT NULL,
	"updated_at" date DEFAULT 'now()' NOT NULL
);
