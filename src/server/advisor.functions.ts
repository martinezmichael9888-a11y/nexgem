import { createServerFn } from "@tanstack/react-start";
import { getContextData, logIncome, logExpense } from "./advisor.server";
import { z } from "zod";

export const getContext = createServerFn({ method: "GET" })
  .handler(async () => {
    return await getContextData();
  });

export const addIncome = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    amount: z.number(),
    category: z.string(),
    description: z.string()
  }))
  .handler(async ({ data }) => {
    await logIncome(data.amount, data.category, data.description);
    return { success: true };
  });

export const addExpense = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    amount: z.number(),
    category: z.string(),
    description: z.string()
  }))
  .handler(async ({ data }) => {
    await logExpense(data.amount, data.category, data.description);
    return { success: true };
  });
