## Recommendation

Client-side queue + retry is a good choice for a demo — but on its own it only hides bursts, it doesn't prevent them. When 300 tabs all fire at once, the gateway still sees 300 requests in the same second and returns 429s; the client just retries. That works, but users wait 5–15s with a spinner and no feedback.

I'd suggest **client queue + retry with backoff, paired with a tiny server-side smoother**. Together they give the smoothest demo experience without touching billing or infra.

## What I'll build

### 1. Client-side request queue (`src/lib/ai-queue.ts`)
- Small singleton queue wrapping calls to `assessEmergency` and `/api/chat`.
- Max N concurrent in-flight requests per browser tab (e.g. 2). Extra calls wait in FIFO.
- Exponential backoff with jitter on 429/503: 1s → 2s → 4s → 8s, max 4 retries.
- On final failure, surface a clear translated toast ("AI busy, please try again") instead of a raw error.

### 2. UX feedback during wait
- In `emergency.new.tsx` and `assistant.tsx`, show queue position / "AI is thinking…" state so users see progress instead of a frozen button.
- Keep the SOS button disabled while queued so users don't double-fire.

### 3. Light server-side smoother (`/api/chat` + `assessEmergency`)
- Per-request 429 detection: if the gateway returns 429, translate it into a structured `{ retryAfterMs }` response so the client backs off intelligently instead of guessing.
- No queue on the server (edge workers are stateless); just clean error propagation.

### 4. i18n
- Add 4 new keys (EN/SN/ND): `ai.busy`, `ai.retrying`, `ai.queued`, `ai.failed`.

## What I won't change

- No changes to the AI model, prompts, or triage logic.
- No infra/billing changes.
- No demo fallback (option 3) — happy to add later if you want a guaranteed "never fails on stage" mode.

## Realistic outcome after this

- 300 concurrent triages spread over ~10–20 seconds: all succeed, users see a brief "AI is thinking…" state.
- 300 in the exact same instant: still all succeed, worst-case wait ~8–12s for the last few users.
- Zero raw error toasts on stage under normal burst conditions.

## Technical notes

- Queue lives in module scope so it's shared across components in one tab (each browser has its own queue — that's fine, the gateway limit is global so per-tab throttling still helps).
- Backoff reads `Retry-After` header when present, falls back to exponential.
- All existing call sites (`assessEmergency`, `useChat` transport, transcribe) route through the queue with a single wrapper.
