import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { askApex } from "../server/ai.functions";
import { addIncome, addExpense, getContext } from "../server/advisor.functions";

const C = {
  bg: "#080c14",
  card: "rgba(255,255,255,0.04)",
  green: "#00f5a0",
  blue: "#00d9f5",
  text: "#e8f0fe",
  muted: "#7a94b8",
  purple: "#a29bfe",
  red: "#ff6b6b",
  yellow: "#ffa502"
};

const fmt = (n: number | string) => "$" + (Number(n) || 0).toFixed(2);

const QUICK_PROMPTS = [
  "Log $50 Instacart income",
  "What's my balance?",
  "Fastest way to make money today",
  "Should I buy more NEXUS stock?",
  "Help me start a fundraiser",
  "Explain my crypto portfolio",
  "Help me save for a phone",
  "How do I deposit money?"
];

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "5px", padding: "0.6rem 0.2rem", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.blue, animation: `tdot 1s infinite ${i * 0.2}s` }} />
      ))}
      <style>{`@keyframes tdot{0%, 80%, 100%{transform:translateY(0); opacity:0.3}40%{transform: translateY(-7px); opacity:1}}`}</style>
    </div>
  );
}

function MicButton({ listening, onClick }: { listening: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} title={listening ? "Stop listening" : "Speak to Apex"} style={{
      width: "44px", height: "44px", borderRadius: "50%", border: "none", background: listening ? C.red : C.card,
      color: "white", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      🎙️
      {listening && <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${C.red}`, animation: "ripple 1.5s infinite" }}></span>}
      <style>{`@keyframes ripple{0%{transform:scale(1);opacity:1}100%{transform:scale(1.6); opacity:0}}`}</style>
    </button>
  );
}

export default function Advisor() {
  const [messages, setMessages] = useState<any[]>([{
    role: "assistant",
    content: "Hey Ruby I'm Apex the AI brain of NEXUS.\n\nI'm not just a chatbot. Tell me what you want to do.",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    actions: []
  }]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const askApexFn = useServerFn(askApex);
  const addIncomeFn = useServerFn(addIncome);
  const addExpenseFn = useServerFn(addExpense);
  const getContextFn = useServerFn(getContext);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const executeAction = async (action: any) => {
    if (!action) return null;
    try {
      if (action.type === "log_income") {
        await addIncomeFn({ data: { amount: action.amount, category: action.category || "Income", description: action.description || "" } });
        return `Income logged: ${fmt(action.amount)} (${action.category || "Income"})`;
      }
      if (action.type === "log_expense") {
        await addExpenseFn({ data: { amount: action.amount, category: action.category || "Expense", description: action.description || "" } });
        return `Expense logged: ${fmt(action.amount)} (${action.category || "Expense"})`;
      }
      if (action.type === "show_balance") {
        const ctx = await getContextFn();
        const main = ctx.accounts.find((a: any) => a.type === "main");
        return `Your balance breakdown:\nMain (Ruby): ${fmt(main?.balance)}`;
      }
    } catch (e: any) {
      return `Action failed: ${e.message}`;
    }
    return null;
  };

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    const newMsg = { role: "user", content: text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await askApexFn({ data: { message: text, history } });
      
      let resContent = result.response;
      let actions: any[] = [];
      
      // Parse ACTION: blocks
      const actionMatch = resContent.match(/ACTION:\s*({.*})/);
      if (actionMatch) {
        try {
          const action = JSON.parse(actionMatch[1]);
          actions.push(action);
          resContent = resContent.replace(actionMatch[0], "").trim();
          
          const execRes = await executeAction(action);
          if (execRes) {
             resContent += "\n\n✔️ " + execRes;
          }
        } catch (e) {
          console.error("Action parse err", e);
        }
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: resContent,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Oops, something went wrong communicating with the server.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.bg, color: C.text, height: "100vh", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      <div style={{ padding: "1rem", borderBottom: `1px solid ${C.card}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem", color: C.blue }}>NEXUS <span style={{ color: C.green }}>AI</span></h1>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
            <div style={{
              background: m.role === "user" ? C.blue : C.card,
              color: m.role === "user" ? C.bg : C.text,
              padding: "0.8rem 1rem",
              borderRadius: "12px",
              borderTopRightRadius: m.role === "user" ? "0" : "12px",
              borderTopLeftRadius: m.role === "assistant" ? "0" : "12px",
              whiteSpace: "pre-wrap",
              lineHeight: 1.5
            }}>
              {m.content}
            </div>
            <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: "4px", textAlign: m.role === "user" ? "right" : "left" }}>
              {m.time}
            </div>
          </div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", background: C.card, padding: "0.8rem 1rem", borderRadius: "12px", borderTopLeftRadius: 0 }}><TypingDots /></div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "1rem", borderTop: `1px solid ${C.card}` }}>
        <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem", marginBottom: "0.5rem", whiteSpace: "nowrap" }}>
          {QUICK_PROMPTS.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)} style={{
              background: C.card, color: C.text, border: `1px solid rgba(255,255,255,0.1)`, borderRadius: "20px", padding: "0.5rem 1rem", cursor: "pointer", fontSize: "0.85rem"
            }}>{p}</button>
          ))}
        </div>
        
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Tell Apex what you need..."
            style={{ flex: 1, background: C.card, border: "none", color: C.text, padding: "0.8rem 1rem", borderRadius: "24px", outline: "none" }}
          />
          <MicButton listening={listening} onClick={() => setListening(!listening)} />
          <button onClick={() => sendMessage()} style={{
            background: C.green, color: C.bg, border: "none", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold"
          }}>→</button>
        </div>
      </div>
    </div>
  );
}
