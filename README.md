# LifeLine+ — AI-Powered Emergency Triage for Zimbabwe

LifeLine+ is a full-stack web app that helps patients in Zimbabwe assess medical emergencies, get first-aid guidance, and route to the nearest partner hospital using multimodal AI. It supports text, voice, photo, and video input in English, Shona, and Ndebele.

> Built for the **2026 AI for Impact Challenge (Zimbabwe)**.

- Preview: https://id-preview--e01b876a-b770-4b37-a041-f012436c22f9.lovable.app
- Live: https://lifelinepulse.lovable.app
- Custom domain: https://www.lifelineai.co.zw

---

## Features

- **AI Emergency Triage** — severity assessment, first-aid steps, red flags, and a clinical hospital report from text/voice/photo/video.
- **Smart Hospital Routing** — Leaflet map with the nearest partner hospitals.
- **AI Assistant** — conversational multilingual health assistant with voice input, read-aloud, and image/video attachments.
- **Ministry Dashboard** — national ops view for load and response times.
- **Offline Fallback** — deterministic rules engine when the AI gateway is unreachable.
- **Accessibility** — font scaling, dyslexia-friendly font toggle, WCAG-oriented components.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start v1 (React 19 + Vite 8) |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix primitives |
| Backend / Auth / DB | Lovable Cloud (Supabase — Postgres, Auth, RLS, Storage) |
| Data | TanStack Query, Zod |
| AI | Google Gemini 3.6 Flash via **Lovable AI Gateway** |
| Voice | OpenAI Whisper (STT) + OpenAI TTS via Lovable AI Gateway; Web Audio API playback |
| Maps | Leaflet + React-Leaflet |
| Runtime | Cloudflare Workers (workerd) via nitro |

---

## Requirements

- **Bun** ≥ 1.1 (recommended) or **Node.js** ≥ 20
- A Lovable Cloud project (auto-provisioned) OR a self-hosted Supabase instance
- A Lovable AI Gateway API key (`LOVABLE_API_KEY`) for AI features
- Modern browser with `MediaRecorder` + Web Audio API for voice features

---

## Manifests & lockfiles

- `package.json` — dependencies and scripts
- `bun.lockb` — Bun lockfile (source of truth; commit it)
- `bunfig.toml` — Bun config
- `tsconfig.json` — TypeScript config
- `vite.config.ts` — extends `@lovable.dev/vite-tanstack-config`
- `eslint.config.js`, `.prettierrc`, `.prettierignore` — lint/format
- `components.json` — shadcn/ui config
- `supabase/config.toml` — Supabase project config (auto-managed)
- `src/routeTree.gen.ts` — auto-generated; never edit by hand

If you use npm/pnpm instead of Bun, remove `bun.lockb` and generate the matching lockfile. Do not commit multiple lockfiles.

---

## Environment example

Copy to `.env` (Lovable injects these automatically in the editor):

```dotenv
# Public — safe in client bundle
VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxx"
VITE_SUPABASE_PROJECT_ID="<project-ref>"

# Server-only — never expose to the client
LOVABLE_API_KEY="lv_xxx"                 # Lovable AI Gateway
```

Notes:
- `LOVABLE_API_KEY` must remain server-side; it is read only inside server functions / API routes.
- Do **not** commit real values. The Supabase service role key and DB password are not accessible on Lovable Cloud.
- On the hosted platform, secrets are managed through the Lovable secrets UI, not a committed `.env`.

---

## Build & run

Install:
```bash
bun install
```

Development (http://localhost:8080):
```bash
bun dev
```

Production build:
```bash
bun run build
```

Preview built output:
```bash
bun run preview
```

Lint & format:
```bash
bun run lint
bun run format
```

---

## Required services

| Service | Purpose | Required? |
|---|---|---|
| Lovable Cloud (Supabase) | Postgres, Auth, RLS, Storage | Yes |
| Lovable AI Gateway | Gemini 3.6 Flash (triage/chat/vision), Whisper (STT), OpenAI TTS | Yes for AI features |
| Cloudflare Workers (nitro target) | SSR + server routes hosting | Yes in production |
| OpenStreetMap tiles | Leaflet map tiles | Yes for map view |

Without `LOVABLE_API_KEY`, the app automatically falls back to the on-device rules-based triage engine (`src/lib/triage-fallback.ts`) and disables voice/vision features.

---

## Configuration

- **AI model** — set in `src/lib/emergency.functions.ts` and `src/routes/api/chat.ts` (default: `google/gemini-3.6-flash`).
- **Client-side AI queue** — `src/lib/ai-queue.ts` (concurrency 2, exponential backoff, retry on 429/503).
- **Languages** — `src/i18n/translations.ts` (en, sn, nd). Language is picked once and persisted in `localStorage` under `lifeline.hasChosen` / `lifeline.language`.
- **RLS** — all public tables have explicit `GRANT`s; roles live in a separate `user_roles` table; `has_role` is a `SECURITY DEFINER` function in a private schema.
- **Auth** — demo mode: single shared demo account, session data (emergency requests, profile, appointments, notifications) is cleared on every sign-in.
- **SSR error wrapper** — `src/server.ts` normalizes h3-swallowed 500s and renders a branded error page.

---

## Project structure

```text
src/
├── components/          # UI components (lifeline/* app-specific, ui/* shadcn primitives)
├── i18n/                # LanguageProvider + translations (en/sn/nd)
├── integrations/supabase # Auto-generated Supabase client + auth middleware
├── lib/                 # Server functions, AI gateway client, queue, media, TTS
├── routes/              # File-based routes
│   ├── _authenticated/  # Protected pages
│   └── api/             # POST endpoints: chat, transcribe, speak
├── router.tsx / server.ts / start.ts
└── styles.css           # Tailwind v4 theme tokens
```

---

## Known limitations

- **Not a diagnostic device.** LifeLine+ performs **triage** (urgency estimation and first-aid guidance), not medical diagnosis. Always call local emergency services for life-threatening situations.
- **Demo auth.** Sign-in uses a shared demo account and wipes user records on every session — do not use in production without replacing the auth flow.
- **AI availability.** Depends on Lovable AI Gateway; hard rate limits surface as retries in the client queue. Requests fall back to the offline rules engine on hard failures.
- **Voice features** require `MediaRecorder` + microphone permission; unavailable on some in-app browsers and older iOS Safari builds.
- **Maps** require network access to OpenStreetMap tile servers; no offline map cache is bundled.
- **Cloudflare Workers runtime.** No Node child_process, `sharp`, `canvas`, `fs.watch`, or native addons. Any added dependency must be Worker-compatible.
- **Hospital dataset** is a curated partner list, not an exhaustive national registry.
- **Language coverage.** Shona and Ndebele UI strings are complete; AI model responses are best-effort and may fall back to English for uncommon medical terms.
- **No PWA / service worker yet.** Offline mode covers triage logic only, not asset caching.
- **Push notifications, real-time ambulance tracking, and national dispatch API integration** are on the roadmap, not implemented.

---

## License

Provided as-is for demonstration and educational purposes under the AI for Impact Challenge.

## Acknowledgements

- [Lovable](https://lovable.dev) — platform + AI Gateway
- [Google Gemini](https://ai.google.dev/) — multimodal medical reasoning
- [OpenAI](https://openai.com/) — Whisper STT and TTS
- Zimbabwean healthcare partners for domain guidance
