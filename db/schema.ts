import { pgTable, text, timestamp, real } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'main', 'sub', 'ai-partner'
  name: text("name").notNull(),
  balance: real("balance").default(0).notNull(),
  totalEarned: real("total_earned").default(0).notNull(),
  spentToday: real("spent_today").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull().references(() => accounts.id),
  accountName: text("account_name").notNull(),
  type: text("type").notNull(), // 'income', 'expense', 'transfer'
  amount: real("amount").notNull(),
  category: text("category"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cryptoHoldings = pgTable("crypto_holdings", {
  id: text("id").primaryKey(),
  coin: text("coin").notNull(),
  amount: real("amount").notNull(),
  currentPrice: real("current_price").notNull(),
});

export const stockHoldings = pgTable("stock_holdings", {
  id: text("id").primaryKey(),
  ticker: text("ticker").notNull(),
  shares: real("shares").notNull(),
  currentPrice: real("current_price").notNull(),
});

export const fundraisers = pgTable("fundraisers", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  target: real("target").notNull(),
  raised: real("raised").default(0).notNull(),
});
