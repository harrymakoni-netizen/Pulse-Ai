# LifeLine+ — Reliability & Security

This document covers the tests we run, the logs we rely on, the latency and performance checks we track, how the system behaves when a dependency fails, the security controls in place, and the known bugs that remain.

---

## 1. Relevant tests

LifeLine+ is a demonstrator, so testing is pragmatic: fast static checks on every change, plus scripted end-to-end vignettes against the real stack.

### 1.1 Static checks (run on every change)

| Check | Command | What it catches |
| --- | --- | --- |
| TypeScript | `tsgo` | Type errors across routes, server functions, Zod schemas |
| Lint | `eslint .` | Unused vars, unsafe `any`, React hook misuse, import order |
| Format | `prettier --check` | Formatting drift |
| Build | `bun run build` | Vite/TanStack Start bundle for the Cloudflare Worker target |
| Route tree | auto-generated `src/routeTree.gen.ts` | Duplicate routes, broken links |

### 1.2 AI triage vignettes (n=80 synthetic cases)

Documented in `AI_METHOD.md` §5–6. Each vignette is submitted through the real `/api/chat` or `assessEmergency` server function and graded by two reviewers against a fixed rubric.

- Severity accuracy vs. clinician label: 88% exact, 99% within one band.
- Critical recall: 100% (no critical case ever downgraded).
- Structured-output validity (Zod parse): 100%.
- Language fidelity: 97%.

### 1.3 Manual end-to-end smoke test (pre-demo)

1. Fresh incognito → language modal appears → pick Shona.
2. Sign in with demo credentials → dashboard loads clean (no prior emergencies, blank profile).
3. SOS flow → dictate symptoms → attach photo → consent → AI report renders → read-aloud plays.
4. Confirm nearest hospital → appears in `/hospital` incoming queue with full details.
5. Sign out → back to `/auth` → session and cache cleared.
6. Same flow on `/assistant` with voice input + TTS on reply.
7. Kill network mid-SOS → rules-based fallback fires, banner labelled `[OFFLINE TRIAGE]`.
8. `/ministry` dashboard reflects the new event in aggregate counters.

### 1.4 Not yet automated

No unit tests, no Playwright suite, no load test in CI. The demonstrator relies on typecheck + build + scripted vignettes.

---

## 2. Logs

Logs are used for post-hoc debugging only; no PHI is written anywhere.

| Source | What it captures | Retention |
| --- | --- | --- |
| **AI Gateway request logs** | Per-call `log_id`, `run_id`, model, tokens, cost, HTTP status, error type; already-redacted payload previews | Managed by Lovable AI Gateway |
| **Cloudflare Worker logs** | SSR errors captured by `src/lib/error-capture.ts`, normalised by `src/server.ts`, and re-rendered via `renderErrorPage` instead of leaking h3's `{"unhandled":true}` 500 body | Rolling worker logs |
| **Client error reporting** | `src/lib/lovable-error-reporting.ts` forwards uncaught client errors to the Lovable overlay | Session only |
| **Supabase Postgres logs** | Query errors, slow queries, auth events | Managed by Supabase |
| **Browser DevTools** | Vite HMR, network, console — dev only | Local |

Not logged: symptom text, patient name, phone, contact, media, `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or session tokens. Gateway payload previews are redacted upstream before we see them.

---

## 3. Latency & performance checks

### 3.1 Observed latencies (median / p95, demo hardware)

| Path | Median | P95 | Notes |
| --- | --- | --- | --- |
| Cold SSR page load | ~450 ms | ~900 ms | Cloudflare Worker + edge cache |
| Warm route navigation | <100 ms | ~250 ms | TanStack Router client transition |
| Sign-in (demo) | ~600 ms | ~1.2 s | Cleanup runs fire-and-forget; dashboard shown immediately |
| AI triage assessment | 3.1 s | 11.4 s @ 300 concurrent | `google/gemini-3.6-flash`, JSON mode |
| AI assistant streamed reply (first token) | ~800 ms | ~2 s | SSE via `/api/chat` |
| TTS first audio chunk | ~600 ms | ~1.4 s | Streaming PCM via `src/lib/tts.ts` |
| Whisper STT (5 s clip) | ~1.4 s | ~3 s | `openai/gpt-4o-transcribe` |
| Hospital list query | <150 ms | ~400 ms | Indexed Postgres read |

### 3.2 Client-side controls

- **Concurrency cap:** `src/lib/ai-queue.ts` limits in-flight AI calls to 2 per tab.
- **Retry with backoff:** 4 retries, exponential backoff + jitter, capped at 10 s.
- **Media compression:** `src/lib/media.ts` downscales images before upload.
- **Streaming everywhere:** chat and TTS stream, so time-to-first-token dominates perceived latency.
- **Suspense loaders:** routes use `ensureQueryData` so data is warm before mount.

### 3.3 Server-side controls

- Cloudflare Worker cold starts typically <50 ms.
- Compute sized "Large" for ~300 concurrent users (`supabase--resize_compute`).
- Postgres connection pooling via Supabase Supavisor.
- No N+1 queries on hot paths; hospital + request lookups are single joined queries.

### 3.4 What we do not measure yet

No RUM, no synthetic uptime probe, no Core Web Vitals dashboard. Latencies above come from manual DevTools sampling and gateway logs.

---

## 4. Dependency failure & fallback behaviour

Every external dependency has an explicit fallback path.

| Dependency | Failure mode | Fallback |
| --- | --- | --- |
| **Lovable AI Gateway (Gemini triage)** | 429, 503, network drop | `runAi` retries 4× with backoff; if all retries fail, `src/lib/triage-fallback.ts` returns a rules-based severity + first aid, labelled `[OFFLINE TRIAGE — RULE-BASED FALLBACK]` in the hospital report |
| **Gemini vision (photo/video)** | Non-JSON or off-schema output | Server regex-extracts `{...}`; Zod parse; on second failure, drop media and re-run text-only |
| **OpenAI Whisper STT** | Upload fails or too-short recording | `/api/transcribe` returns 400; UI shows "Recording too short" and keeps the text field editable |
| **OpenAI TTS** | Stream aborts mid-playback | `src/lib/tts.ts` catches the error, stops playback, SpeakButton returns to idle; on-screen text remains |
| **Supabase Auth** | Refresh token invalid (`refresh_token_not_found`) | Client clears session, redirects to `/auth` |
| **Supabase Postgres** | Query error / RLS denial | Server fn returns typed error; UI shows localized toast, never a raw SQL message |
| **Network offline** | Any fetch fails | AI queue retries, then triage-fallback fires for SOS; other pages show cached data via TanStack Query where available |
| **Cloudflare Worker crash** | Unhandled SSR error | `src/server.ts` normalises h3-swallowed 500s and renders `renderErrorPage()` |
| **No MediaRecorder / getUserMedia** | Voice input unavailable | Mic button hidden; text input remains fully functional |
| **No Web Audio API** | TTS cannot play | SpeakButton disabled; text remains readable |

### 4.1 Circuit-breaker behaviour

`runAi` treats these as retryable: HTTP 429, 503, `load failed`, `failed to fetch`, `network`, `timeout`, `temporarily`. Everything else fails fast so the UI can show an accurate error rather than hanging.

### 4.2 Graceful degradation summary

If **every** AI dependency is down, the user can still: sign in, submit an SOS, receive a rules-based severity + first aid, see the nearest hospital, and have that request land in the hospital dashboard. AI is an accelerator, never a hard requirement.

---

## 5. Security checks

### 5.1 Authentication & authorization

- Supabase Auth (email/password for demo; Google OAuth removed at user request).
- Protected routes sit under `src/routes/_authenticated/` with a `beforeLoad` session gate that redirects to `/auth`.
- Server functions that mutate data use `.middleware([requireSupabaseAuth])` so RLS applies as the calling user.
- `src/start.ts` registers `attachSupabaseAuth` as `functionMiddleware` so the bearer token flows automatically.
- Sign-out cancels in-flight queries, clears the query cache, calls `supabase.auth.signOut()`, and history-replaces to `/auth` — no protected data survives the back button.

### 5.2 Row-Level Security (RLS)

- Enabled on every table in `public`.
- Roles stored in a dedicated `user_roles` table (never on `profiles`), checked via a `SECURITY DEFINER` function `private.has_role` in a **private schema** — prevents recursive RLS and privilege escalation.
- `hospitals` and `ambulances` readable only by authenticated users (fixed from earlier public-read finding).
- `emergency_requests` / `emergency_events` scoped to the patient, plus `hospital_staff` / `ambulance` / `admin` for read.
- `profiles`, `emergency_contacts`, `appointments`, `medical_records`, `notifications` strictly `auth.uid() = user_id`.
- Every `CREATE TABLE` migration includes explicit `GRANT` statements — no reliance on default PostgREST privileges.

### 5.3 Secrets

- `LOVABLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL` are server-only, read via `process.env` inside handlers only.
- Never exposed via `VITE_*`, client props, route loader data, or localStorage.
- Publishable Supabase keys are safe in the client bundle by design.

### 5.4 Input validation

- Zod schemas on every `.inputValidator()` and every AI JSON output.
- Length caps on user text: symptoms, contact fields, TTS input (`slice(0, 3500)`).
- Media size + type enforced client-side before upload; server re-checks.
- No `dangerouslySetInnerHTML` anywhere in the app.

### 5.5 Transport & headers

- HTTPS enforced (Cloudflare edge).
- CORS not opened on any protected route; no `/api/public/*` endpoints exist today.
- SSR error responses use `text/html; charset=utf-8` with a safe error page — no stack traces leaked to end users.

### 5.6 Data protection (Zimbabwe Data Protection Act [Chapter 12:07])

- Explicit consent checkbox required before every SOS submission.
- Data minimisation: only symptoms, coarse location, and optional media are stored — no ID number, no insurance data.
- Demo sign-in wipes the user's `emergency_requests`, `emergency_contacts`, `appointments`, `notifications`, `medical_records`, and profile PII on every login.
- No PHI in logs, analytics, or AI Gateway payload previews.

### 5.7 Supply chain

- `bun.lock` committed; deterministic installs.
- Dependencies scanned via `code--dependency_scan` before submission.
- No native `.node` addons; runs cleanly on the Cloudflare Worker runtime.

### 5.8 Findings addressed

Persisted security-scanner findings fixed during development:

- `SUPA_authenticated_security_definer_function_executable` — `has_role` moved to `private` schema.
- `ambulances_public_readable` — RLS restricted to authenticated users.
- `hospitals_public_readable` — RLS restricted to authenticated users.
- `SUPA_auth_leaked_password_protection` — HIBP check enabled on Supabase Auth.

---

## 6. Known bugs & limitations

| Item | Impact | Status |
| --- | --- | --- |
| **Stale refresh token toast on first load in editor iframe** | Console shows `refresh_token_not_found` 400; client recovers by redirecting to `/auth`. Cosmetic. | Won't fix for demo — Safari/iframe cookie behaviour |
| **`auto_confirm_email` enabled** | Convenient for judging. Must be disabled for real deployment. | Documented; disable pre-production |
| **Demo credentials wipe user data on every sign-in** | Intentional for a clean judging experience, but the demo user cannot accumulate history. | By design for demo |
| **Language modal forced on every load** | Intentional for the demo; in production it appears once per browser (`lifeline.hasChosen` in `localStorage`). | Toggle before production |
| **No native mobile app** | Web only; requires a modern browser with MediaRecorder + Web Audio. | Roadmap: PWA install + iOS/Android shells |
| **Hospital + ambulance data is seeded, not live** | Bed counts and ambulance positions are synthetic; see `DATA.md`. | Roadmap: integrate MOHCC feed |
| **STT occasionally mishears drug names** | ~17% WER on code-switched speech. Text field remains editable. | Acceptable |
| **AI over-triage on ambiguous free text** | ~9% of medium cases upgraded to high. Clinically preferred to under-triage. | Documented in `AI_METHOD.md` §7 |
| **TTS input capped at 3500 chars** | Very long reports get truncated; sentence-splitter mitigates most cases. | Acceptable |
| **No offline queue for SOS submissions** | Rules-based triage runs offline, but the request itself cannot be posted until connectivity returns. | Roadmap: background sync via Service Worker |
| **No unit tests / Playwright in CI** | Regressions caught by typecheck + manual smoke test only. | Roadmap |
| **No RUM / uptime monitoring** | Latency figures are sampled manually. | Roadmap: Cloudflare Analytics + Sentry |
| **GitHub / Facebook / Discord OAuth not supported** | Lovable Cloud native auth limited to email, phone, Google, Apple, SAML. | Documented; use Supabase Integration if needed |

---

*Last updated: July 2026.*
*Companion documents: `README.md`, `ARCHITECTURE.md`, `DATA.md`, `AI_METHOD.md`, `SOFTWARE.md`.*
