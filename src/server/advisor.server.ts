import { db } from "../../db/index.js";
import { accounts, transactions, cryptoHoldings, stockHoldings, fundraisers } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function getContextData() {
  const accs = await db.select().from(accounts);
  if (accs.length === 0) {
    // Seed initial data
    const mainId = uuidv4();
    await db.insert(accounts).values([
      { id: mainId, type: "main", name: "Ruby", balance: 500, totalEarned: 1500, spentToday: 20 },
      { id: uuidv4(), type: "sub", name: "Kid A1", balance: 50, totalEarned: 100, spentToday: 0 },
      { id: uuidv4(), type: "sub", name: "Kid B2", balance: 50, totalEarned: 100, spentToday: 0 },
      { id: uuidv4(), type: "sub", name: "Kid C3", balance: 50, totalEarned: 100, spentToday: 0 },
      { id: uuidv4(), type: "sub", name: "Kid D4", balance: 50, totalEarned: 100, spentToday: 0 },
      { id: uuidv4(), type: "sub", name: "Brother E5", balance: 150, totalEarned: 500, spentToday: 0 }
    ]);
    await db.insert(cryptoHoldings).values([
      { id: uuidv4(), coin: "NXS", amount: 10000000, currentPrice: 0.05 },
      { id: uuidv4(), coin: "BTC", amount: 0.05, currentPrice: 65000 }
    ]);
    await db.insert(stockHoldings).values([
      { id: uuidv4(), ticker: "AAPL", shares: 5, currentPrice: 170 },
      { id: uuidv4(), ticker: "TSLA", shares: 2, currentPrice: 200 }
    ]);
    await db.insert(fundraisers).values([
      { id: uuidv4(), title: "New Phone", target: 800, raised: 150 }
    ]);
  }

  const allAccounts = await db.select().from(accounts);
  const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(30);
  const crypto = await db.select().from(cryptoHoldings);
  const stocks = await db.select().from(stockHoldings);
  const funds = await db.select().from(fundraisers);

  return { accounts: allAccounts, transactions: allTransactions, cryptoHoldings: crypto, stockHoldings: stocks, fundraisers: funds };
}

export async function logIncome(amount: number, category: string, description: string) {
  const accs = await db.select().from(accounts).where(eq(accounts.type, "main"));
  if (accs.length === 0) throw new Error("Main account not found");
  const mainAcc = accs[0];

  await db.insert(transactions).values({
    id: uuidv4(),
    accountId: mainAcc.id,
    accountName: mainAcc.name,
    type: "income",
    amount,
    category,
    description
  });

  await db.update(accounts)
    .set({
      balance: mainAcc.balance + amount,
      totalEarned: mainAcc.totalEarned + amount
    })
    .where(eq(accounts.id, mainAcc.id));
}

export async function logExpense(amount: number, category: string, description: string) {
  const accs = await db.select().from(accounts).where(eq(accounts.type, "main"));
  if (accs.length === 0) throw new Error("Main account not found");
  const mainAcc = accs[0];

  await db.insert(transactions).values({
    id: uuidv4(),
    accountId: mainAcc.id,
    accountName: mainAcc.name,
    type: "expense",
    amount,
    category,
    description
  });

  await db.update(accounts)
    .set({
      balance: mainAcc.balance - amount,
      spentToday: mainAcc.spentToday + amount
    })
    .where(eq(accounts.id, mainAcc.id));
}
