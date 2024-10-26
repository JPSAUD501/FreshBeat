CREATE TABLE IF NOT EXISTS "key_value" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "key_value_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" varchar(255) NOT NULL,
	"value" varchar(5000) NOT NULL,
	CONSTRAINT "key_value_key_unique" UNIQUE("key")
);
