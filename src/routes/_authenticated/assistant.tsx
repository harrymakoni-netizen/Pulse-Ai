import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/lifeline/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LifeLineLogo } from "@/components/lifeline/logo";
import {
  Send,
  Sparkles,
  User as UserIcon,
  Loader2,
  Languages,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · LifeLine+" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };
type Lang = "en" | "sn" | "nd";

const langNames = { en: "English", sn: "Shona", nd: "Ndebele" } as const;
const suggestions: Record<Lang, string[]> = {
  en: ["I have chest pain", "Someone is unconscious", "First aid for a burn", "Signs of a stroke"],
  sn: ["Ndine kurwadziwa pachipfuva", "Munhu haaite kutaura", "Zvekutanga kuita nekutsva", "Zviratidzo zve stroke"],
  nd: ["Ngiphethwe yisifuba", "Umuntu ubuthongo", "Uncedo lokuqala lokutsha", "Izimpawu ze-stroke"],
};
const placeholders: Record<Lang, string> = {
  en: "Describe what's happening...",
  sn: "Tsanangura zviri kuitika...",
  nd: "Chaza ukuthi kwenzenjani...",
};

// BCP 47 codes for Web Speech API
const speechLang: Record<Lang, string> = { en: "en-ZW", sn: "sn-ZW", nd: "nd-ZW" };
const speechLangFallback: Record<Lang, string> = { en: "en-US", sn: "en-ZW", nd: "en-ZW" };

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [ttsEnabled, setTtsEnabled] = useState(false);

  // Speech recognition state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check for speech recognition support
  const hasSpeechRecognition =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // Auto-scroll on message update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea
  useEffect(() => {
    textareaRef.current?.focus();
  }, [busy]);

  // TTS for last assistant message
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechLang[lang] || "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang]);

  // Send message (text or voice transcript)
  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setTranscript("");
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
      // Speak finished response
      speakText(acc);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  // Start voice recording
  function startRecording() {
    if (!hasSpeechRecognition) {
      toast.error("Voice input is not supported in this browser");
      return;
    }
    window.speechSynthesis?.cancel();
    const SpeechRecognitionClass =
      window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    // Try native language first, fall back to English variant
    recognition.lang = speechLang[lang];
    let finalTranscript = "";
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed") {
        toast.error("Microphone access denied");
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        // Fallback language on language-not-supported
        recognition.lang = speechLangFallback[lang];
      }
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setTranscript("");
    setIsRecording(true);
  }

  // Stop and send the transcript
  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (transcript.trim()) {
      send(transcript);
    }
  }

  // Cancel recording without sending
  function cancelRecording() {
    recognitionRef.current?.abort();
    setIsRecording(false);
    setTranscript("");
  }

  // Replay last assistant text
  function replayLastAssistant() {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
    if (last) speakText(last.content);
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">AI Emergency Assistant</div>
          <h1 className="mt-1 font-display text-2xl font-semibold">Talk to LifeLine+ AI</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* TTS toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setTtsEnabled((v) => !v);
              window.speechSynthesis?.cancel();
            }}
            aria-label={ttsEnabled ? "Disable voice output" : "Enable voice output"}
            className="h-8 w-8"
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          {/* Language selector */}
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
            <Languages className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
            {(["en", "sn", "nd"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-[60vh] flex-col rounded-3xl border border-border bg-card">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                <LifeLineLogo showWordmark={false} size={56} />
                <div>
                  <div className="font-display text-xl font-semibold">How can I help?</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ask about symptoms, first aid, or an emergency situation — in {langNames[lang]}.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions[lang].map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs hover:bg-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={m.role === "user" ? "flex justify-end" : "flex gap-3"}
              >
                {m.role === "assistant" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm"
                  }
                >
                  {m.content || (busy && i === messages.length - 1 ? <Dots /> : null)}
                </div>
                {m.role === "user" && (
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Recording state overlay */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="border-t border-border bg-primary/5 p-4"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--alert)] opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--alert)]" />
                  </span>
                  <span className="font-medium">Listening in {langNames[lang]}...</span>
                </div>
                {transcript && (
                  <p className="mt-2 rounded-lg bg-background/50 px-3 py-2 text-sm italic text-muted-foreground">
                    {transcript}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" onClick={stopRecording} className="gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Send
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelRecording}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          {!isRecording && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-border p-4"
            >
              {/* Mic button */}
              {hasSpeechRecognition && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={startRecording}
                  aria-label="Start voice input"
                  disabled={busy}
                  className="shrink-0"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
              <Textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={placeholders[lang]}
                className="min-h-11 resize-none"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-medium">Emergency?</div>
            <p className="mt-1 text-xs text-muted-foreground">
              If this is life-threatening, use the SOS flow — it dispatches an ambulance.
            </p>
            <Button asChild className="mt-3 w-full bg-[color:var(--alert)] hover:bg-[color:var(--alert)]/90">
              <a href="/emergency/new">Start SOS</a>
            </Button>
          </div>

          {/* Voice tips */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mic className="h-4 w-4 text-primary" /> Voice input
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tap the microphone and speak. The assistant transcribes your words, then responds.
            </p>
          </div>

          {/* TTS replay */}
          {ttsEnabled && messages.some((m) => m.role === "assistant" && m.content) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={replayLastAssistant}>
                <RotateCcw className="h-3.5 w-3.5" /> Replay last response
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
            LifeLine+ AI supports English, Shona, and Ndebele. This assistant does not replace professional medical advice.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1">
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
    </span>
  );
}