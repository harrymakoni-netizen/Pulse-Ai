// Client-side text-to-speech helper. Streams PCM chunks from /api/speak and
// plays them progressively via Web Audio. Exposes a small controller for the
// currently playing utterance so the UI can toggle stop.

type Lang = "en" | "sn" | "nd";

type Controller = { stop: () => void; done: Promise<void> };

let current: Controller | null = null;
let currentId: string | null = null;
const listeners = new Set<() => void>();

export function currentlySpeakingId(): string | null {
  return currentId;
}

export function subscribeTts(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  for (const fn of listeners) fn();
}

export function stopSpeech() {
  if (current) {
    current.stop();
    current = null;
  }
  currentId = null;
  notify();
}

export async function speak(text: string, lang: Lang, id?: string): Promise<void> {
  stopSpeech();
  const utteranceId = id ?? Math.random().toString(36).slice(2);
  currentId = utteranceId;
  notify();
  const controller = new AbortController();
  const ctx = new (window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
    sampleRate: 24000,
  });
  if (ctx.state === "suspended") await ctx.resume().catch(() => {});
  let playhead = 0;
  let pending = new Uint8Array(0);
  let stopped = false;
  const sources = new Set<AudioBufferSourceNode>();

  const stop = () => {
    if (stopped) return;
    stopped = true;
    controller.abort();
    for (const s of sources) {
      try {
        s.stop();
      } catch {
        /* ignore */
      }
    }
    sources.clear();
    ctx.close().catch(() => {});
    if (currentId === utteranceId) {
      currentId = null;
      notify();
    }
  };

  const playChunk = (incoming: Uint8Array) => {
    if (stopped) return;
    const merged = new Uint8Array(pending.length + incoming.length);
    merged.set(pending);
    merged.set(incoming, pending.length);
    const usable = merged.length - (merged.length % 2);
    pending = merged.slice(usable);
    if (usable === 0) return;
    const samples = new Int16Array(merged.buffer, 0, usable / 2);
    const floats = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) floats[i] = samples[i] / 32768;
    const buffer = ctx.createBuffer(1, floats.length, 24000);
    buffer.copyToChannel(floats, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.onended = () => sources.delete(src);
    if (playhead === 0) playhead = ctx.currentTime + 0.05;
    else playhead = Math.max(playhead, ctx.currentTime);
    src.start(playhead);
    sources.add(src);
    playhead += buffer.duration;
  };

  const done = (async () => {
    let res: Response;
    try {
      res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
        signal: controller.signal,
      });
    } catch {
      stop();
      return;
    }
    if (!res.ok || !res.body) {
      stop();
      throw new Error(`TTS failed: ${res.status}`);
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "";
    try {
      for (;;) {
        const { done: rDone, value } = await reader.read();
        if (rDone) break;
        buf += value;
        let idx;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload) as { type: string; audio?: string };
            if (ev.type === "speech.audio.delta" && ev.audio) {
              const bin = atob(ev.audio);
              const bytes = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
              playChunk(bytes);
            }
          } catch {
            /* ignore malformed line */
          }
        }
      }
    } catch {
      /* aborted or network error */
    }
    // Let scheduled audio finish; then clear currentId if it's still us.
    const tail = Math.max(0, playhead - ctx.currentTime);
    await new Promise((r) => setTimeout(r, tail * 1000 + 100));
    if (!stopped && currentId === utteranceId) {
      currentId = null;
      notify();
      ctx.close().catch(() => {});
    }
  })();

  current = { stop, done };
  return done;
}