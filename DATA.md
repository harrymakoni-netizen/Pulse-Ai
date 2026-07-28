# LifeLine+ — API, Database & Data Statement

This document covers the HTTP/RPC surface, the database schema, and full
disclosure of what data in the system is real, simulated, synthetic, or
still required — along with provenance and rights.

---

## 1. API Documentation

LifeLine+ uses two backend surfaces on TanStack Start:

- **Server functions (`createServerFn`)** — typed RPC used by the app itself
  (client → server). Called via `useServerFn`, not raw `fetch`.
- **Server routes (`src/routes/api/*`)** — raw HTTP endpoints for streaming
  AI responses and browser `FormData` uploads.

All authenticated endpoints require a valid Supabase bearer token. RLS
enforces per-user ownership; nothing is trusted from the client body alone.

### 1.1 Server functions (typed RPC)

| Function | Method | Auth | Input | Returns |
|---|---|---|---|---|
| `assessEmergency` (`src/lib/emergency.functions.ts`) | POST | Signed-in | `{ symptoms: string[], symptomsText?: string, painLevel?: number, age?: number, history?: string, language: "en"\|"sn"\|"nd", media?: { kind: "image"\|"video_frame", dataUrl }[] }` | `{ severity: "low"\|"medium"\|"high"\|"critical", summary, firstAid: string[], redFlags: string[], hospitalReport: string }` |
| `createEmergencyRequest` (`src/lib/emergency.functions.ts`) | POST | Signed-in | Triage payload + chosen `hospital_id`, contact info, geolocation | `{ id: uuid }` (row in `emergency_requests`) |
| `advanceEmergency` (`src/lib/emergency.functions.ts`) | POST | Signed-in (staff/admin roles enforced by RLS) | `{ id: uuid, status: emergency_status, note?: string }` | `{ ok: true }` — also inserts into `emergency_events` |
| `listHospitals` (`src/lib/hospitals.functions.ts`) | GET | Signed-in | none | `Hospital[]` from `public.hospitals` |

Error contract: transient failures throw with `__retryable = true` and an
optional `retryAfterMs`; the client `runAi` queue in `src/lib/ai-queue.ts`
retries with exponential backoff. 402 surfaces as "AI credits exhausted".

### 1.2 Server routes (raw HTTP)

All routes are same-origin. No CORS is configured — they are for the app
itself.

#### `POST /api/chat` — streaming chat completion
- **File:** `src/routes/api/chat.ts`
- **Auth:** Signed-in (Supabase bearer on the fetch)
- **Request:** `application/json`
  ```jsonc
  {
    "messages": [{ "role": "user"|"assistant"|"system", "content": "..." }],
    "language": "en" | "sn" | "nd",
    "media": [{ "kind": "image", "dataUrl": "data:image/jpeg;base64,..." }]
  }
  ```
- **Response:** `text/event-stream` (SSE) — token deltas from Gemini via the
  Lovable AI Gateway, terminated by `[DONE]`.
- **Errors:** `401` unauthenticated, `429`/`503` retryable, `402` credits.

#### `POST /api/transcribe` — speech-to-text
- **File:** `src/routes/api/transcribe.ts`
- **Auth:** Signed-in
- **Request:** `multipart/form-data`
  - `file`: audio blob (`audio/webm`, `audio/mp4`, or `audio/mpeg`), ≤ ~10 MB
  - `language`: `en` | `sn` | `nd`
- **Response:** `application/json` — `{ "text": "..." }`
- **Upstream:** OpenAI Whisper via Lovable AI Gateway.

#### `POST /api/speak` — text-to-speech
- **File:** `src/routes/api/speak.ts`
- **Auth:** Signed-in
- **Request:** `application/json` — `{ "text": string, "language": "en"|"sn"|"nd", "voice"?: string }`
- **Response:** streaming `audio/pcm` frames consumed by the Web Audio
  player in `src/lib/tts.ts`.
- **Upstream:** OpenAI TTS via Lovable AI Gateway.

### 1.3 Third-party APIs used by the client

- **OpenStreetMap tile server** (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`)
  — public map tiles under the ODbL.
- **Web Speech / MediaRecorder / Web Audio** — browser APIs, no network.

There are no public/anonymous endpoints. `/api/*` is signed-in-only; only
`/api/public/*` would bypass auth on published sites and no such routes are
defined in this project.

---

## 2. Database Schema

Hosted on Lovable Cloud (Supabase Postgres). All tables live in `public` and
have Row-Level Security enabled. The `has_role` security-definer function
lives in the `private` schema to prevent privilege escalation via the
Data API.

### 2.1 Enums

| Type | Values |
|---|---|
| `app_role` | `patient`, `hospital_staff`, `ambulance`, `admin` |
| `emergency_severity` | `low`, `medium`, `high`, `critical` |
| `emergency_status` | `requested`, `assessed`, `hospital_notified`, `dispatched`, `en_route`, `arrived`, `transporting`, `completed`, `cancelled` |
| `ambulance_status` | `available`, `dispatched`, `en_route`, `on_scene`, `transporting`, `offline` |
| `preferred_language` | `en`, `sn`, `nd` |

### 2.2 Tables

| Table | Purpose | Key columns | RLS |
|---|---|---|---|
| `profiles` | Per-user demographic + medical profile | `id`(=`auth.users.id`), `full_name`, `phone`, `language`, `blood_type`, `allergies[]`, `medications[]`, `dob`, `avatar_url` | Users can read/insert/update their own row; no delete. |
| `user_roles` | Role assignments; separate from `profiles` to prevent escalation | `user_id`, `role app_role`, `hospital_id` | Users read their own roles only. All writes denied via API — done in migrations / `handle_new_user`. |
| `hospitals` | Partner hospital directory | `name`, `address`, `city`, `lat`, `lng`, `phone`, `specialties[]`, `total_beds`, `available_beds`, `has_emergency`, `rating` | Any authenticated user can read; only admins can modify. |
| `ambulances` | Fleet + live status | `hospital_id`, `plate`, `status`, `lat`, `lng` | Any authenticated user can read; only admins can modify. |
| `emergency_requests` | Triage + SOS submissions | `patient_id`, `symptoms[]`, `symptoms_text`, `pain_level`, `age`, `medical_history`, `lat`/`lng`, `location_label`, `contact_name`/`phone`, `severity`, `ai_summary jsonb`, `ai_report`, `hospital_id`, `ambulance_id`, `status`, `eta_minutes`, `photo_url` | Patients manage their own requests; hospital staff / ambulance / admin can read. |
| `emergency_events` | Immutable audit trail per request | `request_id`, `status`, `note` | Owner + staff can read; owner can insert; updates/deletes denied. |
| `emergency_contacts` | User's next-of-kin contacts | `user_id`, `name`, `relation`, `phone` | Owner-only. |
| `appointments` | Scheduled clinic visits | `user_id`, `hospital_id`, `doctor_name`, `scheduled_at`, `reason`, `status` | Owner-only. |
| `medical_records` | User-uploaded records | `user_id`, `record_type`, `title`, `details jsonb`, `file_url`, `record_date` | Owner-only. |
| `notifications` | Per-user notification inbox | `user_id`, `title`, `body`, `category`, `read` | Owner-only. |

### 2.3 Functions & triggers

- `public.handle_new_user()` — `SECURITY DEFINER`; on `auth.users` insert,
  creates the matching `profiles` row and assigns the default `patient`
  role.
- `public.tg_set_updated_at()` — maintains `updated_at`.
- `private.has_role(uid, role)` — security-definer role check used by all
  role-scoped RLS policies.

### 2.4 Storage buckets

None. Media attached to triage (photos, extracted video frames) is
transported as inline data URLs to the AI Gateway and **not persisted**;
`emergency_requests.photo_url` is currently unused in the demo build.

---

## 3. Data Statement — Provenance, Rights & Status

This section discloses what data is real, what is simulated or synthetic,
what is unavailable, and what still needs to be sourced for a production
deployment.

### 3.1 Real data

| Dataset | Source | Rights | Notes |
|---|---|---|---|
| Language strings (English, chiShona, isiNdebele) | Authored by the project team with review from Shona/Ndebele speakers | Owned by the project; released with the app under the demo license | See `src/i18n/translations.ts`. Medical vocabulary in Shona/Ndebele is best-effort; some technical terms fall back to English. |
| First-aid rules (offline fallback) | Adapted from WHO Basic Emergency Care and Red Cross First-Aid guidelines (public health guidance) | Guidance is publicly available; wording is paraphrased/rewritten in-house | Encoded in `src/lib/triage-fallback.ts`. Not a substitute for clinical protocols. |
| Map tiles | OpenStreetMap contributors | ODbL — attribution required and present in the map component | Rendered client-side; no tile caching. |
| UI icons | Lucide (ISC), shadcn/ui (MIT) | Permissive open source | Bundled with the app. |
| Fonts | Inter and Space Grotesk (SIL Open Font License) | Free to redistribute | Bundled via `@fontsource-variable/*`. |

### 3.2 Simulated / demo data

| Dataset | Status | How it is generated |
|---|---|---|
| Hospital directory (`hospitals`) | **Simulated for demo** | Curated list of well-known Zimbabwean public and mission hospitals (Parirenyatwa, Sally Mugabe, Mpilo, United Bulawayo Hospitals, Chitungwiza, Karanda Mission, Nyanga District, etc.). Bed counts, availability, ratings, phone numbers and coordinates are **plausible approximations**, not authoritative operational data. Not an official MOHCC dataset. |
| Ambulance fleet (`ambulances`) | **Simulated for demo** | Illustrative fleet used to demonstrate dispatch flow. Plates, positions, and statuses are fictional. |
| Demo user account | **Synthetic** | Every sign-in wipes profile, contacts, records, appointments, notifications, and prior emergency requests for the shared demo user, and each session starts empty. No real patient data is retained. |
| Live emergency requests during a demo | **Synthetic** | Entered by the presenter/user during a demo session. Cleared on next sign-in. |

### 3.3 AI-generated data

| Dataset | Model | Rights | Notes |
|---|---|---|---|
| Triage summaries, first-aid steps, hospital reports (`emergency_requests.ai_summary`, `ai_report`) | Google Gemini 3.6 Flash via Lovable AI Gateway | Model output under the gateway ToS; downstream use is the operator's responsibility | Marked in the UI as an AI assessment, not a diagnosis. |
| Assistant chat responses | Google Gemini 3.6 Flash | As above | Streamed via `/api/chat`. |
| Voice transcriptions | OpenAI Whisper | OpenAI API ToS | Audio blob transits the gateway; not stored server-side. |
| Read-aloud audio | OpenAI TTS | OpenAI API ToS | Streamed PCM, not stored. |

### 3.4 Unavailable data (not integrated in the current build)

- **National emergency dispatch feed** — no public real-time API exists in Zimbabwe.
- **Live hospital bed occupancy** — no national interoperability layer; `available_beds` is illustrative only.
- **Ambulance GPS telemetry** — no operator API integration; positions are simulated.
- **Patient EHR / medical history from external providers** — not connected. `medical_records` holds only what the user enters in the app.
- **Insurance / medical-aid eligibility** — not integrated.
- **Push / SMS notification delivery** — the `notifications` table is app-internal only; no SMS gateway is wired up.

### 3.5 Still-required data for production

Before this system could be deployed to real patients in Zimbabwe, the
following would need to be sourced with proper agreements:

1. **Authoritative hospital registry** from the Ministry of Health and Child
   Care (MOHCC), including facility type, catchment, emergency capability
   and verified contact numbers.
2. **Data-sharing MoUs** with participating hospitals covering triage
   handoff, bed availability, and outcome feedback.
3. **Ambulance operator agreements** for dispatch integration (private
   operators + council fleets).
4. **Data Protection Impact Assessment** and registration with the Postal
   and Telecommunications Regulatory Authority of Zimbabwe (POTRAZ) as
   required under the **Cyber and Data Protection Act [Chapter 12:07], 2021**.
5. **Explicit patient consent flows** for storage and cross-border AI
   processing (Gemini and OpenAI are non-domestic processors).
6. **Clinical governance sign-off** for the triage rubric and offline
   rules engine by a qualified emergency physician.
7. **SMS/USSD fallback provider contract** for feature-phone reachability.

### 3.6 Personal data & retention

- **Collected in demo:** name, phone, DOB, blood type, allergies,
  medications, next-of-kin contact, symptoms (text + optional media),
  approximate geolocation, chosen hospital.
- **Retention:** demo-user records are wiped on every sign-in; nothing is
  retained across sessions.
- **Sub-processors:** Supabase (Lovable Cloud), Cloudflare Workers,
  Google Gemini, OpenAI Whisper/TTS, OpenStreetMap tile servers.
- **Not collected:** national ID number, medical-aid membership, biometric
  data, precise continuous location tracking.

### 3.7 Attribution & licensing summary

- Application source: provided as-is for the AI for Impact Challenge
  (see repository `README.md`).
- OpenStreetMap: © OpenStreetMap contributors, ODbL.
- Inter / Space Grotesk: SIL OFL 1.1.
- Lucide icons: ISC License.
- shadcn/ui, Radix, TanStack, Tailwind, React, Zod: MIT / Apache-2.0.
- AI outputs: subject to Lovable AI Gateway, Google, and OpenAI usage terms.

---

*Last updated: July 2026.*
