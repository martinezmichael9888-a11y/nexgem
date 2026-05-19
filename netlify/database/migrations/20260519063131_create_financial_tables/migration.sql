CREATE TABLE "accounts" (
	"id" text PRIMARY KEY,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"balance" real DEFAULT 0 NOT NULL,
	"total_earned" real DEFAULT 0 NOT NULL,
	"spent_today" real DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crypto_holdings" (
	"id" text PRIMARY KEY,
	"coin" text NOT NULL,
	"amount" real NOT NULL,
	"current_price" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fundraisers" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"target" real NOT NULL,
	"raised" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_holdings" (
	"id" text PRIMARY KEY,
	"ticker" text NOT NULL,
	"shares" real NOT NULL,
	"current_price" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY,
	"account_id" text NOT NULL,
	"account_name" text NOT NULL,
	"type" text NOT NULL,
	"amount" real NOT NULL,
	"category" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id");