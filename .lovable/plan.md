
# LifeLine+ MVP Plan

Zimbabwe-focused AI emergency healthcare platform. Deep on patient journey, scaffolded elsewhere. Real AI + Lovable Cloud (Supabase) auth/DB with RLS.

## Design system

- Palette: medical blue `#1565C0`, emerald `#10B981`, ink `#0B1F3A`, alert red `#E11D48`, warm greys, off-white background `#F7F9FC`
- Typography: **Inter** body, **Space Grotesk** display (both via `@fontsource-variable`)
- Motion: Framer Motion. Signature heartbeat pulse (calm blue 4–6s idle; faster red when emergency active). ECG-line loader. All animations respect `prefers-reduced-motion`.
- shadcn/ui + Tailwind. Glass cards, soft shadows, rounded-2xl.
- Uploaded LIFELINE logo uploaded as `src/assets/lifeline-logo.png.asset.json` via lovable-assets, used in header + auth + footer with pulse glow.

## Routes (TanStack Start file-based)

Public:
- `/` Landing (hero, How it Works, Features, Benefits, AI Technology, Partner Hospitals, Testimonials, FAQ, Footer)
- `/auth` Sign in / Sign up with role picker (Patient / Hospital / Ambulance / Admin), forgot password, email confirmation
- `/reset-password`

Authenticated (`_authenticated/`, managed layout):
- `/dashboard` — patient dashboard (SOS, medical profile, contacts, history, active emergency card)
- `/emergency/new` — SOS workflow wizard
- `/emergency/$id` — live emergency status + timeline + AI report + hospital match + ambulance ETA
- `/assistant` — AI symptom chat (English / Shona / Ndebele)
- `/hospitals` — Leaflet map + filters (distance, beds, services)
- `/records` — medical history, prescriptions, vaccinations, labs, insurance
- `/appointments`
- `/notifications`
- `/settings` — theme, language, notifications, 2FA placeholder, delete account

Role scaffolds (clean shells, ready to expand):
- `/hospital` — incoming queue, bed availability, AI summaries (mock realtime)
- `/ambulance` — dispatch queue, status updates, route panel
- `/admin` — national stats, heatmap placeholder, charts (Recharts)

## AI (Lovable AI Gateway, `google/gemini-3-flash-preview`)

Server route `src/routes/api/chat.ts` — AI SDK `streamText` for the assistant. System prompt: Zimbabwe emergency triage, multilingual (EN/SN/ND), asks symptoms → severity → first aid → hospital recommendation.

Server functions (`src/lib/emergency.functions.ts`):
- `assessEmergency` — structured output (Zod `Output.object`): `{ severity: 'low'|'medium'|'high'|'critical', summary, recommendedSpecialty, firstAid[], redFlags[] }`
- `generateHospitalReport` — professional handoff summary for hospital staff from the SOS submission.

Chat UI uses AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`), streaming, `message.parts` rendering, markdown. Language toggle in composer.

## SOS Workflow

Multi-step wizard on `/emergency/new`:
1. Symptoms (multi-select chips + free text)
2. Pain level slider (0–10), age, brief history
3. Location capture (`navigator.geolocation`; fallback manual)
4. Emergency contact + optional photo (Supabase Storage) + optional voice (MediaRecorder → base64)
5. AI assessment (calls `assessEmergency`, shows severity card with animated pulse ring color-coded by severity)
6. Hospital match: top 3 from Zimbabwe seed hospitals ranked by distance × specialty × bed availability
7. Confirm → creates `emergency_requests` row → routes to `/emergency/$id`

`/emergency/$id` shows: status timeline (Requested → AI Assessed → Hospital Notified → Ambulance Dispatched → En Route → Arrived → Completed), AI report accordion, matched hospital card, simulated ambulance ETA countdown, cancel button.

## Backend (Lovable Cloud / Supabase)

Enable Cloud. Migration:
- `profiles` (id → auth.users, full_name, phone, language, blood_type, allergies, medications, dob)
- `user_roles` + `app_role` enum (patient, hospital_staff, ambulance, admin) + `has_role()` SECURITY DEFINER
- `emergency_contacts` (user_id, name, relation, phone)
- `hospitals` (name, address, lat, lng, phone, specialties[], total_beds, available_beds, has_emergency)
- `ambulances` (hospital_id, plate, status, lat, lng)
- `emergency_requests` (patient_id, symptoms, pain_level, location(lat,lng), severity, ai_summary jsonb, ai_report text, hospital_id, ambulance_id, status, created_at)
- `emergency_events` (request_id, status, note, created_at) — timeline
- `medical_records` (patient_id, type, title, details jsonb, file_url, date)
- `appointments`, `notifications`
- GRANTS for each public table + `service_role`, `authenticated`, narrow `anon` SELECT only on `hospitals`
- RLS: patients read/write their own rows; hospital_staff read requests assigned to their hospital; admins read all via `has_role`
- Seed: 12 Zimbabwe hospitals (Parirenyatwa, Sally Mugabe, Mpilo, Chitungwiza, Avenues, Mater Dei, UBH, etc.) with real coords

Auth: email/password + Google OAuth (via Lovable broker); email confirmation on. Registration writes `profiles` + `user_roles` via trigger.

## Hospital Finder

Leaflet + OpenStreetMap (`react-leaflet`, `leaflet`). User location marker + hospital markers with severity-colored icons. Filter panel (distance slider, has emergency, min available beds, specialty multi-select). Side list synced with map.

## Pulse system

Global `.pulse-heartbeat` utility in styles.css + Framer variants. `<PulseLogo>` component (calm blue). `<EmergencyPulse severity="critical">` (red, faster). ECG SVG loader replaces spinners on route pending states. All gated by `useReducedMotion()`.

## Scaffolded role dashboards

Same shell layout (sidebar + topbar), route-guarded by `has_role`. Each shows realistic mock data cards + a "coming soon" callout for deep features. Admin includes Recharts line/bar for response times + emergencies by region.

## Technical section

- Stack: TanStack Start, TS strict, Tailwind v4, shadcn/ui, Framer Motion, Recharts, react-leaflet, AI SDK + `@ai-sdk/react`
- Fonts via `@fontsource-variable/inter` and `@fontsource-variable/space-grotesk`
- Server boundaries: `createServerFn` for internal ops, `/api/chat` server route for streaming
- All server fns using auth via `requireSupabaseAuth`; `attachSupabaseAuth` middleware appended in `src/start.ts`
- Public route loaders never call protected fns; patient dashboard loads via `_authenticated` gate
- Chat: AI Elements installed (`conversation`, `message`, `prompt-input`, `shimmer`)
- Storage bucket `emergency-media` (private, RLS to owner)
- SEO: per-route `head()` with distinct title/description; leaf og:image on landing only
- Accessibility: WCAG AA tokens, aria-labels on icon buttons, `<main>` per route, reduced-motion respected

## Out of scope for MVP (scaffolded/placeholder only)

- Real SMS/push (in-app notifications only)
- Real ambulance GPS stream (simulated ETA)
- Real Google Maps (using Leaflet/OSM instead)
- Payments/insurance claims
- Deep hospital/ambulance/admin flows beyond navigable shells with mock data

## End-to-end demo path

Sign up as patient → complete profile → press SOS → wizard → AI assessment → hospital match → live status page with simulated ambulance progression → chat with AI assistant → browse hospital finder map. This is the flow judges will click through.
