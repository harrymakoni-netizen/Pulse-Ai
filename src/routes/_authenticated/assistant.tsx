import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/lifeline/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { Send, Sparkles, User as UserIcon, Loader2, Languages } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · LifeLine+" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const suggestions = {
  en: ["I have chest pain", "Someone is unconscious", "First aid for a burn", "Signs of a stroke"],
  sn: ["Ndine kurwadziwa pachipfuva", "Munhu haaite kutaura", "Zvekutanga kuita nekutsva", "Zviratidzo zve stroke"],
  nd: ["Ngiphethwe yisifuba", "Umuntu ubuthongo", "Uncedo lokuqala lokutsha", "Izimpawu ze-stroke"],
};

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<"en"|"sn"|"nd">("en");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, language: lang }),
      });
      if (!res.ok || !res.body) throw new Error("AI unavailable");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally { setBusy(false); }
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">AI Assistant</div>
          <h1 className="mt-1 font-display text-2xl font-semibold">Talk to LifeLine+ AI</h1>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
          <Languages className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
          {(["en","sn","nd"] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} className={`rounded-full px-3 py-1 ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-[60vh] flex-col rounded-3xl border border-border bg-card">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                <LifeLineLogo showWordmark={false} size={56} />
                <div>
                  <div className="font-display text-xl font-semibold">How can I help?</div>
                  <p className="mt-1 text-sm text-muted-foreground">Ask about symptoms, first aid, or an emergency situation.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions[lang].map(s => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs hover:bg-secondary">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-3"}>
                {m.role === "assistant" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div>}
                <div className={m.role === "user"
                  ? "max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                  : "max-w-[80%] rounded-2xl bg-secondary/60 px-4 py-2.5 text-sm"}>
                  {m.content || (busy && i === messages.length - 1 ? <span className="inline-flex gap-1"><Dot /><Dot delay={150} /><Dot delay={300} /></span> : null)}
                </div>
                {m.role === "user" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"><UserIcon className="h-4 w-4" /></div>}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-border p-4">
            <Textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder={lang === "en" ? "Describe what's happening..." : lang === "sn" ? "Tsanangura zviri kuitika..." : "Chaza ukuthi kwenzenjani..."}
              className="min-h-11 resize-none"
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>

        <aside className="space-y-4 hidden lg:block">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-medium">Emergency?</div>
            <p className="mt-1 text-xs text-muted-foreground">If this is life-threatening, use the SOS flow — it dispatches an ambulance.</p>
            <Button asChild className="mt-3 w-full bg-[color:var(--alert)] hover:bg-[color:var(--alert)]/90">
              <a href="/emergency/new">Start SOS</a>
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
            LifeLine+ AI supports English, Shona, and Ndebele. This assistant does not replace professional medical advice.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: `${delay}ms` }} />;
}