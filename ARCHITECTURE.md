# LifeLine+ — System Architecture

This document describes the end-to-end system architecture behind **LifeLine+**, the AI-powered emergency triage platform for Zimbabwe. It covers every layer of the stack, from the browser the patient uses to the AI models that reason about their symptoms, and the failure paths that keep the system usable even when parts of it break.

---

## 1. High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      User Interface (Browser)                │
│  React 19 + TanStack Router · Tailwind v4 · shadcn/ui        │
│  Web Speech · MediaRecorder · Geolocation · Leaflet Maps     │
└──────────────┬───────────────────────────────────────────────┘
               │  HTTPS (SSR + typed RPC + REST)
               ▼
┌──────────────────────────────────────────────────────────────┐
│              Application / API Layer (Edge)                  │
│  TanStack Start server functions  ·  /api/* route handlers   │
│  Auth middleware · Zod validation · AI request orchestration │
└──────┬───────────────────────────┬───────────────────────────┘
       │                           │
       ▼                           ▼
┌──────────────────┐    ┌──────────────────────────────────────┐
│ Database / Store │    │        AI Model / Service Layer      │
│  Supabase        │    │  Lovable AI Gateway                  │
│  Postgres + RLS  │    │  • Gemini 3.6 Flash (triage, vision) │
│  Auth · Storage  │    │  • GPT-4o Transcribe (Whisper STT)   │
│                  │    │  • GPT-4o-mini-TTS (read-aloud)      │
└──────────────────┘    └──────────────────────────────────────┘
```

---

## 2. User Interface Layer

**Runtime:** React 19 rendered by TanStack Start (SSR + hydration) on the patient's device.

**Key modules:**
- **Routing:** File-based routes under `src/routes/`. Protected screens live under `_authenticated/` with a route-level auth gate.
- **Design system:** Tailwind CSS v4 with semantic theme tokens in `src/styles.css`; shadcn/ui primitives in `src/components/ui/`; branded components in `src/components/lifeline/`.
- **Internationalization:** `LanguageProvider` in `src/i18n/index.tsx` with English, Shona (chiShona), and Ndebele (isiNdebele). A one-time welcome modal captures the user's language before anything else renders.
- **Accessibility:** In-app panel (`src/components/accessibility/accessibility-panel.tsx`) with font scaling, dyslexia-friendly font, and high-contrast-friendly tokens. Targets WCAG 2.2 AA.
- **Multimodal capture:** `MediaRecorder` for voice, `<input type="file" capture>` for photos and videos, `navigator.geolocation` for location, Leaflet for the hospital map.
- **State:** TanStack Query owns server state; local UI state uses React hooks. All AI calls flow through the client-side queue (`src/lib/ai-queue.ts`).

---

## 3. Application / API Layer

**Runtime:** TanStack Start on a Cloudflare Workers-compatible edge runtime.

Two backend surfaces coexist:

### 3a. Typed server functions (`createServerFn`)
App-internal RPC used by loaders and components. Files live next to their feature (e.g. `src/lib/emergency.functions.ts`, `src/lib/hospitals.functions.ts`). Protected functions attach `requireSupabaseAuth` middleware, giving the handler an RLS-scoped Supabase client plus the user's ID and claims.

Responsibilities:
- Input validation with Zod
- AI triage orchestration (`assessEmergency`)
- Emergency and hospital CRUD under the caller's identity
- Structured logging of gateway errors

### 3b. HTTP route handlers (`src/routes/api/*`)
Raw HTTP endpoints for streaming and browser-native callers:
- `POST /api/chat` — multimodal chat proxy to the AI gateway with streaming SSE
- `POST /api/transcribe` — audio → text via `openai/gpt-4o-transcribe`
- `POST /api/speak` — text → streamed PCM audio via `openai/gpt-4o-mini-tts`, decoded progressively by `src/lib/tts.ts`

### Cross-cutting middleware
- `src/start.ts` registers `attachSupabaseAuth` (attaches the bearer token to server-function calls) and an error middleware that renders a friendly SSR error page instead of a stack trace.
- Client-side, `src/lib/ai-queue.ts` limits concurrency (2 in flight), applies exponential backoff, and honours `Retry-After` on 429/503.

---

## 4. Database / Storage Layer

**Backend:** Lovable Cloud (Supabase) — managed Postgres + Auth.

**Schema (public):**
- `profiles` — patient medical profile (blood type, allergies, medications, DOB)
- `emergency_requests` — SOS submissions with symptoms, media URL, AI summary, severity, assigned hospital/ambulance, status
- `emergency_events` — append-only status timeline per request
- `hospitals` — partner facilities with location, specialties, bed capacity
- `ambulances` — fleet with live status and coordinates
- `appointments`, `medical_records`, `notifications`, `emergency_contacts` — patient-owned records
- `user_roles` — separate roles table (`patient`, `hospital_staff`, `ambulance`, `admin`) referenced by the private `has_role()` security-definer function

**Security model:**
- Row Level Security enabled on every public table
- Explicit `GRANT` statements per table for `authenticated` / `service_role` (never blanket `anon`)
- Roles isolated in `user_roles` + `private.has_role()` to prevent privilege escalation and recursive-policy bugs
- HIBP leaked-password protection enabled on Supabase Auth

**Client-side storage:** `localStorage` holds only non-sensitive UX state (chosen language, accessibility preferences). Supabase's own auth storage key holds the session JWT.

---

## 5. AI Model / Service Layer

All AI traffic is brokered through the **Lovable AI Gateway** (`https://ai.gateway.lovable.dev/v1`) using a server-only `LOVABLE_API_KEY`. The gateway handles provider routing, billing, and rate-limit signalling.

| Capability | Model | Where it's used |
|---|---|---|
| Emergency triage (text + vision) | `google/gemini-3.6-flash` | `assessEmergency` in `src/lib/emergency.functions.ts` |
| Conversational assistant | `google/gemini-3.6-flash` | `POST /api/chat` |
| Speech-to-text | `openai/gpt-4o-transcribe` | `POST /api/transcribe` |
| Text-to-speech (read-aloud) | `openai/gpt-4o-mini-tts` | `POST /api/speak` + `src/lib/tts.ts` |

**Prompting discipline:**
- Role-framed system prompts ("emergency triage assistant, not a diagnostician")
- Severity rubric (Critical / High / Medium / Low) with explicit criteria
- Structured output enforced with Zod schemas after JSON parsing
- Language passed through so responses stay in the user's chosen language
- Media (photos, sampled video frames) compressed client-side before being sent as `image_url` parts

---

## 6. Integrations

- **Lovable AI Gateway** — unified proxy for Google + OpenAI models, billed in Lovable credits.
- **Supabase Auth** — email/password sessions; demo mode uses a shared demo account with per-sign-in session reset.
- **Leaflet + OpenStreetMap tiles** — hospital map rendering.
- **Browser Geolocation API** — patient coordinates for hospital routing.
- **Web Speech / MediaRecorder / Web Audio APIs** — voice capture and progressive playback of PCM chunks from the TTS stream.
- **GitHub (optional)** — source-control mirror via the Lovable GitHub App.

---

## 7. Hosting & Device Environment

- **Frontend + edge functions:** Deployed by Lovable to a Cloudflare Workers-compatible runtime. Two stable URLs: production (`lifelinepulse.lovable.app`, custom domain `www.lifelineai.co.zw`) and preview.
- **Database + auth:** Managed Supabase instance (upgraded compute tier for concurrency headroom).
- **Runtime constraints:** No Node-only APIs (`child_process`, `sharp`, native addons); all dependencies must be Worker-safe and fully bundled at build time.
- **Client devices:** Optimised for mid-range Android phones on 3G/4G. Media is compressed on-device before upload; the UI degrades gracefully on small viewports.
- **Secrets:** `LOVABLE_API_KEY`, Supabase service-role key, and DB URL live in the edge runtime environment — never shipped to the browser. Only `VITE_SUPABASE_URL` and the publishable key are exposed client-side.

---

## 8. Failure Paths & Resilience

Every critical path has a defined degradation strategy.

| Failure | Detection | Fallback |
|---|---|---|
| AI gateway 429 / 503 | HTTP status + `Retry-After` header | Client queue retries with exponential backoff (`src/lib/ai-queue.ts`); user sees "AI busy, retrying…" instead of an error |
| AI gateway 402 (credits exhausted) | HTTP 402 from gateway | Explicit toast + admin alert; triage falls back to rules engine |
| AI gateway unreachable / offline | Fetch rejection after retries | **Rules-based triage** in `src/lib/triage-fallback.ts` scores severity from symptom tags, keywords, and pain level; UI labels the result as offline triage |
| Whisper transcription fails | Non-2xx from `/api/transcribe` | User can type symptoms manually; recorder shows "Transcription failed" toast |
| TTS stream fails | Non-2xx from `/api/speak` | Read-aloud button silently disables; the text is still visible on-screen |
| Geolocation denied | Promise rejection | Manual location entry + text search over the hospitals table |
| Hospital confirmation network error | Mutation error | Wrapped in `runAi` retry queue; localized "network issue" message if all retries fail |
| Supabase down | Query failure | TanStack Query surfaces cached data where available; auth screen shows a clear retry prompt |
| Rate limit under load (300+ concurrent) | Gateway 429s | Concurrency cap of 2 in the client queue smooths bursts; upgraded Supabase compute keeps DB connections available |
| Session tampering / RLS bypass attempt | Postgres RLS + `has_role()` | Request denied at the database layer regardless of client-side state |

**Guiding principle:** LifeLine+ must remain *useful* when the AI is unavailable. The rules-based triage engine, the offline-friendly hospital list, and the localized UI mean that a patient in a low-connectivity area still gets severity guidance and a nearby hospital, even if the smart layer is dark.

---

## 9. Summary

LifeLine+ is a **single-codebase, edge-deployed, RLS-secured** application that treats AI as a first-class but *replaceable* component. The UI captures multimodal input, the edge layer validates and orchestrates, Supabase persists everything under strict row-level policies, and the AI gateway supplies clinical reasoning, voice, and read-aloud — with a rules-based safety net whenever the network or the model isn't there.
