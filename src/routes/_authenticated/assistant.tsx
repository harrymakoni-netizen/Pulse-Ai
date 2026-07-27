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
  Mic,
  Volume2,
  VolumeX,
  RotateCcw,
  Camera,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/i18n";
import { fetchAi } from "@/lib/ai-queue";
import { compressImage, extractVideoFrames } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant · LifeLine+" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string; images?: string[] };
type Lang = "en" | "sn" | "nd";

const langNames = { en: "English", sn: "Shona", nd: "Ndebele" } as const;

// Full i18n dictionary for every visible string on this page.
const T = {
  en: {
    eyebrow: "AI Emergency Assistant",
    title: "Talk to LifeLine+ AI",
    enableVoice: "Enable voice output",
    disableVoice: "Disable voice output",
    howCanIHelp: "How can I help?",
    intro: (l: string) => `Ask about symptoms, first aid, or an emergency situation, in ${l}.`,
    listening: (l: string) => `Listening in ${l}...`,
    send: "Send",
    cancel: "Cancel",
    stopRecording: "Stop and transcribe",
    startVoice: "Start voice input",
    placeholder: "Describe what's happening...",
    suggestions: ["I have chest pain", "Someone is unconscious", "First aid for a burn", "Signs of a stroke"],
    emergencyTitle: "Emergency?",
    emergencyBody: "If this is life-threatening, use the SOS flow, it dispatches an ambulance.",
    startSos: "Start SOS",
    voiceTitle: "Voice input",
    voiceBody: "Tap the microphone and speak. When you stop, your words are transcribed and sent.",
    replay: "Replay last response",
    disclaimer: "LifeLine+ AI supports English, Shona, and Ndebele. This assistant does not replace professional medical advice.",
    transcribing: "Transcribing your voice…",
    micDenied: "Microphone access denied. Please allow it in your browser settings.",
    micUnavailable: "Microphone not available on this device.",
    tooShort: "Recording too short, please try again.",
    transcribeFailed: "Could not transcribe audio. Please try again.",
    takePhoto: "Take photo",
    uploadPhoto: "Upload photo",
    recordVideo: "Record video",
    uploadVideo: "Upload video",
    mediaProcessing: "Preparing media...",
    mediaTooLarge: "That file is too large.",
    mediaTooMany: "Maximum 3 attachments.",
    removeAttachment: "Remove attachment",
  },
  sn: {
    eyebrow: "Mubatsiri weAI weMamergency",
    title: "Taura neLifeLine+ AI",
    enableVoice: "Bvumidza izwi",
    disableVoice: "Dzima izwi",
    howCanIHelp: "Ndingakubatsira sei?",
    intro: (l: string) => `Bvunza nezve zviratidzo, rubatsiro rwekutanga, kana mamergency, mu${l}.`,
    listening: (l: string) => `Ndiri kuteerera mu${l}...`,
    send: "Tumira",
    cancel: "Kanzura",
    stopRecording: "Mira uye shandurira",
    startVoice: "Tanga kutaura",
    placeholder: "Tsanangura zviri kuitika...",
    suggestions: ["Ndine kurwadziwa pachipfuva", "Munhu haaite kutaura", "Zvekutanga kuita nekutsva", "Zviratidzo zve stroke"],
    emergencyTitle: "Mamergency?",
    emergencyBody: "Kana izvi zvichigona kukonzera rufu, shandisa SOS, inodaidza ambulance.",
    startSos: "Tanga SOS",
    voiceTitle: "Kutaura",
    voiceBody: "Dzvanya maikorofoni utaure. Kana wapedza, mashoko ako anonyorwa oendeswa.",
    replay: "Dzokorora mhinduro yekupedzisira",
    disclaimer: "LifeLine+ AI inotsigira Chirungu, chiShona, neisiNdebele. Mubatsiri uyu haatsivi zano rechiremba.",
    transcribing: "Kushandura izwi rako kuita mashoko…",
    micDenied: "Maikorofoni haabvumidzwe. Bvumidza mune settings dzebrowser.",
    micUnavailable: "Maikorofoni haiwanikwe padhivhaisi iyi.",
    tooShort: "Zvakanyanya kupfupika, edzazve.",
    transcribeFailed: "Hazvina kubudirira kushandurira izwi. Edzazve.",
    takePhoto: "Tora mufananidzo",
    uploadPhoto: "Tumira mufananidzo",
    recordVideo: "Rekodha vhidhiyo",
    uploadVideo: "Tumira vhidhiyo",
    mediaProcessing: "Kugadzirira midhiya...",
    mediaTooLarge: "Faira iri rakakura.",
    mediaTooMany: "Zvinosvika zvitatu chete.",
    removeAttachment: "Bvisa",
  },
  nd: {
    eyebrow: "Umsizi we-AI wesimo esiphuthumayo",
    title: "Khuluma le-LifeLine+ AI",
    enableVoice: "Vumela ilizwi",
    disableVoice: "Vala ilizwi",
    howCanIHelp: "Ngingakusiza njani?",
    intro: (l: string) => `Buza ngezimpawu, uncedo lokuqala, kumbe isimo esiphuthumayo, nge${l}.`,
    listening: (l: string) => `Ngilalele nge${l}...`,
    send: "Thumela",
    cancel: "Khansela",
    stopRecording: "Yima uphendulele",
    startVoice: "Qalisa ilizwi",
    placeholder: "Chaza ukuthi kwenzenjani...",
    suggestions: ["Ngiphethwe yisifuba", "Umuntu ubuthongo", "Uncedo lokuqala lokutsha", "Izimpawu ze-stroke"],
    emergencyTitle: "Isimo esiphuthumayo?",
    emergencyBody: "Uma kuyingozi empilweni, sebenzisa i-SOS, ithumela i-ambulensi.",
    startSos: "Qalisa i-SOS",
    voiceTitle: "Ilizwi",
    voiceBody: "Cindezela imakrofoni ukhulume. Nxa uqedile, amazwi akho ayabhalwa athunyelwe.",
    replay: "Phinda impendulo yokugcina",
    disclaimer: "I-LifeLine+ AI isekela isiNgisi, isiShona, le-isiNdebele. Umsizi lo katshintshi iseluleko sikadokotela.",
    transcribing: "Kuphendulelwa ilizwi lakho…",
    micDenied: "Imakrofoni ivimbelwe. Ivumele kuzilungiselelo zebhrawuza.",
    micUnavailable: "Imakrofoni ayikho kule idivayisi.",
    tooShort: "Ukurekhoda kufishane kakhulu, zama futhi.",
    transcribeFailed: "Yehlulekile ukuphendulela. Zama futhi.",
    takePhoto: "Thatha isithombe",
    uploadPhoto: "Layisha isithombe",
    recordVideo: "Qopha ividiyo",
    uploadVideo: "Layisha ividiyo",
    mediaProcessing: "Kulungiswa imidiya...",
    mediaTooLarge: "Ifayela likhulu kakhulu.",
    mediaTooMany: "Okuphezulu okuthathu.",
    removeAttachment: "Susa",
  },
} as const;

// BCP 47 codes for text-to-speech playback
const ttsLang: Record<Lang, string> = { en: "en-ZW", sn: "sn-ZW", nd: "nd-ZW" };

function AssistantPage() {
  const { lang, t: tGlobal } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const t = T[lang];

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMic =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [busy]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    if (timerRef.current) window.clearInterval(timerRef.current);
  }, []);

  const speakText = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLang[lang] || "en-US";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, lang]);

  async function send(text: string) {
    const trimmed = text.trim();
    if ((!trimmed && images.length === 0) || busy) return;
    const attached = images;
    const next: Msg[] = [...messages, { role: "user", content: trimmed || "(image attached)", images: attached }];
    setMessages(next);
    setInput("");
    setImages([]);
    setBusy(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const res = await fetchAi("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content, images: m.images })),
          language: lang,
        }),
      }, {
        onQueued: () => toast.info(tGlobal("ai.queued")),
        onRetry: () => toast.info(tGlobal("ai.retrying")),
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
      speakText(acc);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
      setMessages((m) => m.slice(0, -1));
      setImages(attached);
    } finally {
      setBusy(false);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setMediaBusy(true);
    try {
      const next: string[] = [];
      for (const file of Array.from(files)) {
        if (images.length + next.length >= 3) { toast.error(t.mediaTooMany); break; }
        if (file.type.startsWith("video/")) {
          if (file.size > 25 * 1024 * 1024) { toast.error(t.mediaTooLarge); continue; }
          const frames = await extractVideoFrames(file, 2);
          for (const f of frames) {
            if (images.length + next.length >= 3) break;
            next.push(f);
          }
        } else if (file.type.startsWith("image/")) {
          if (file.size > 10 * 1024 * 1024) { toast.error(t.mediaTooLarge); continue; }
          const compressed = await compressImage(file, 1280, 0.82);
          next.push(compressed);
        }
      }
      if (next.length) setImages((prev) => [...prev, ...next].slice(0, 3));
    } catch {
      toast.error(t.mediaTooLarge);
    } finally {
      setMediaBusy(false);
    }
  }

  function pickMime(): string | undefined {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
    for (const c of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
    }
    return undefined;
  }

  async function startRecording() {
    if (!hasMic) { toast.error(t.micUnavailable); return; }
    try {
      window.speechSynthesis?.cancel();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      cancelledRef.current = false;
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((tr) => tr.stop());
        streamRef.current = null;
        if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
        setIsRecording(false);
        if (cancelledRef.current) return;
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        if (blob.size < 2048) { toast.error(t.tooShort); return; }
        await transcribeAndSend(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
      setIsRecording(true);
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "SecurityError") toast.error(t.micDenied);
      else if (name === "NotFoundError") toast.error(t.micUnavailable);
      else toast.error(t.micUnavailable);
      setIsRecording(false);
    }
  }

  function stopRecording() {
    cancelledRef.current = false;
    try { recorderRef.current?.stop(); } catch { /* noop */ }
  }

  function cancelRecording() {
    cancelledRef.current = true;
    try { recorderRef.current?.stop(); } catch { /* noop */ }
  }

  async function transcribeAndSend(blob: Blob) {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "recording.webm");
      fd.append("language", lang);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      if (!text) { toast.error(t.transcribeFailed); return; }
      await send(text);
    } catch (e) {
      toast.error(e instanceof Error && e.message ? e.message : t.transcribeFailed);
    } finally {
      setIsTranscribing(false);
    }
  }

  function replayLastAssistant() {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
    if (last) speakText(last.content);
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">{t.eyebrow}</div>
          <h1 className="mt-1 font-display text-2xl font-semibold">{t.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setTtsEnabled((v) => !v);
              window.speechSynthesis?.cancel();
            }}
            aria-label={ttsEnabled ? t.disableVoice : t.enableVoice}
            className="h-8 w-8"
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex min-h-[60vh] flex-col rounded-3xl border border-border bg-card">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                <LifeLineLogo showWordmark={false} size={56} />
                <div>
                  <div className="font-display text-xl font-semibold">{t.howCanIHelp}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{t.intro(langNames[lang])}</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {t.suggestions.map((s) => (
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

          <AnimatePresence>
            {(isRecording || isTranscribing) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="border-t border-border bg-primary/5 p-4"
              >
                {isRecording ? (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="relative flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--alert)] opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full bg-[color:var(--alert)]" />
                      </span>
                      <span className="font-medium">{t.listening(langNames[lang])}</span>
                      <span className="ml-auto tabular-nums text-xs text-muted-foreground">
                        {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" onClick={stopRecording} className="gap-1.5">
                        <Send className="h-3.5 w-3.5" /> {t.stopRecording}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelRecording}>
                        {t.cancel}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> {t.transcribing}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!isRecording && !isTranscribing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2 border-t border-border p-4"
            >
              {hasMic && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={startRecording}
                  aria-label={t.startVoice}
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
                placeholder={t.placeholder}
                className="min-h-11 resize-none"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label={t.send}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>

        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="text-sm font-medium">{t.emergencyTitle}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t.emergencyBody}</p>
            <Button asChild className="mt-3 w-full bg-[color:var(--alert)] hover:bg-[color:var(--alert)]/90">
              <a href="/emergency/new">{t.startSos}</a>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Mic className="h-4 w-4 text-primary" /> {t.voiceTitle}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t.voiceBody}</p>
          </div>

          {ttsEnabled && messages.some((m) => m.role === "assistant" && m.content) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={replayLastAssistant}>
                <RotateCcw className="h-3.5 w-3.5" /> {t.replay}
              </Button>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">{t.disclaimer}</div>
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