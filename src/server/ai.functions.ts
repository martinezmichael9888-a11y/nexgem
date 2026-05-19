import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import OpenAI from "openai";
import { getContextData } from "./advisor.server";

const APEX_SYSTEM = `You are Apex, the AI core of NEXUS Finance - a personal finance platform built for Ruby and her family.

Your personality: warm, direct, capable, real. You don't sugarcoat. You give specific, actionable answers. You speak like a smart friend who actually knows finance.

Ruby's situation:
- Single mom building a financial platform called NEXUS for independence
- Has 4 kids (A1, B2, C3, D4) and a brother (E5) on sub-accounts
- Needs capital for a phone and computer (equipment)
- Income sources: gig work, freelance, reselling, content, crypto
- Owns 10 million NXS founder tokens + stocks
- Has a gift card marketplace, P2P exchange, fundraising platform built in

You can TAKE ACTIONS when asked. When the user says something like "add income", "log expense", "create fundraiser", "add stock", "transfer money", "set goal", respond with an action plan AND include an ACTION block.

Example actions:
ACTION: {"type": "log_income", "amount": 50, "category": "Gig Work", "description": "Instacart delivery"}
ACTION: {"type": "log_expense", "amount": 20, "category": "Food", "description": "Groceries"}
ACTION: {"type": "show_fundraiser_form", "title": "Help me get a laptop"}
ACTION: {"type": "navigate", "page": "Exchange"}
ACTION: {"type": "navigate", "page": "Deposit"}
ACTION: {"type": "navigate", "page": "Stocks"}
ACTION: {"type": "set_balance_goal", "amount": 500, "description": "New phone by May"}
ACTION: {"type": "show_balance"}
ACTION: {"type": "suggest_income"}

Always include a human-readable response before any ACTION block. Keep responses to 3-5 short paragraphs. Be real, warm, encouraging.`;

export const askApex = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    message: z.string(),
    history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional()
  }))
  .handler(async ({ data }) => {
    // If the system doesn't have AI Gateway keys in the env, we fallback to hardcoded behavior so it doesn't break locally without keys.
    const useFallback = !process.env.NETLIFY_AI_GATEWAY_KEY && !process.env.OPENAI_API_KEY;

    if (useFallback) {
      const m = data.message.toLowerCase();
      let response = "I'm here and listening. Tell me exactly what you need. I can log transactions, check your balance, help you plan income, or navigate anywhere in NEXUS. Just say the word.";
      
      if (m.includes("balance")) {
        response = `Let's look at your balance.\n\nACTION: {"type": "show_balance"}`;
      } else if (m.includes("income") || m.includes("log") || m.includes("instacart") || m.includes("earned")) {
        response = `Got it. I'll log that income for you.\n\nACTION: {"type": "log_income", "amount": 50, "category": "Gig Work", "description": "Instacart delivery"}`;
      } else if (m.includes("expense") || m.includes("spent") || m.includes("bought")) {
        response = `Logging that expense now.\n\nACTION: {"type": "log_expense", "amount": 20, "category": "Other", "description": "Misc"}`;
      } else if (m.includes("make money") || m.includes("earn") || m.includes("source")) {
        response = `Here's your fastest path to cash right now:\n\nACTION: {"type": "suggest_income"}`;
      } else if (m.includes("fundraiser") || m.includes("raise")) {
        response = `Starting a fundraiser is one of your best moves right now especially for equipment. Head to the Exchange.\n\nACTION: {"type": "show_fundraiser_form", "title": "Help me get a laptop"}`;
      } else if (m.includes("stock") || m.includes("nxs") || m.includes("invest")) {
        response = `Your NXS stock is your biggest long-term asset - 10 million founder shares. Every new user helps.`;
      } else if (m.includes("crypto") || m.includes("btc") || m.includes("eth")) {
        response = `Your NEXUS Token (NXS) is your biggest crypto position at 10M tokens. Keep holding.`;
      } else if (m.includes("phone") || m.includes("laptop") || m.includes("computer") || m.includes("equipment")) {
        response = `For a solid phone + laptop setup you're looking at $200-400 easily. Let's set a goal.\n\nACTION: {"type": "set_balance_goal", "amount": 500, "description": "New phone by May"}`;
      }
      return { response };
    }

    try {
      const openai = new OpenAI(); // Powered by Netlify AI Gateway implicitly
      const context = await getContextData();
      
      const systemPrompt = `${APEX_SYSTEM}\n\nCurrent Context Data (JSON): ${JSON.stringify(context)}`;
      
      const messages: any[] = [
        { role: "system", content: systemPrompt }
      ];

      if (data.history) {
        messages.push(...data.history);
      }
      messages.push({ role: "user", content: data.message });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // fast and cheap model
        messages: messages,
      });

      return { response: completion.choices[0].message.content || "I couldn't process that right now." };
    } catch (e: any) {
      console.error(e);
      return { response: `I hit a snag connecting to my brain. \n\nError: ${e.message}` };
    }
  });
