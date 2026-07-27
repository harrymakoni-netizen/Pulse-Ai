# LifeLine+ — AI-Powered Emergency Triage for Zimbabwe

LifeLine+ is a full-stack web application that helps patients in Zimbabwe assess medical emergencies, find nearby hospitals, and request help using multimodal AI. It supports text, voice, photo, and video input in English, Shona, and Ndebele.

> **Built for the 2026 AI for Impact Challenge (Zimbabwe).**

---

## What it does

- **AI Emergency Triage** — Describe symptoms by text, voice, photo, or video and get an instant severity assessment, first-aid guidance, and a clinical hospital report.
- **Smart Hospital Routing** — Locate and route emergencies to the nearest partner hospital using an interactive map.
- **AI Assistant** — A conversational health assistant that understands voice and image attachments.
- **Ministry Dashboard** — National operations view for monitoring emergency load and response times.
- **Offline Fallback** — Rules-based triage engine that works when the AI gateway is unreachable.
- **Multilingual** — Full interface and AI interaction support for English, Shona (chiShona), and Ndebele (isiNdebele).
- **Accessibility** — Built-in font scaling, dyslexia-friendly font toggle, and high-contrast friendly UI.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + Vite) |
| Styling | Tailwind CSS v4 + shadcn/ui primitives |
| Backend / Auth | Lovable Cloud (Supabase) — Postgres, Auth, RLS |
| AI | Google Gemini 3.6 Flash via Lovable AI Gateway |
| Voice | Web Speech API + OpenAI Whisper transcription proxy |
| Maps | Leaflet + React-Leaflet |
| State / Data | TanStack Query |
| Validation | Zod |

---

## Project structure

```text
src/
├── components/          # Reusable UI components
│   ├── lifeline/        # LifeLine-specific components (logo, shell, severity badge, etc.)
│   └── ui/              # shadcn/ui primitives
├── i18n/                # Translations and language provider
├── integrations/        # Supabase and Lovable generated clients
├── lib/                 # Business logic and server functions
│   ├── emergency.functions.ts   # AI triage + emergency request CRUD
│   ├── triage-fallback.ts       # Offline rules-based triage
│   ├── ai-gateway.server.ts     # AI Gateway client
│   ├── ai-queue.ts              # Client-side request queue + retry
│   └── media.ts                 # Image compression + video frame extraction
├── routes/              # TanStack file-based routes
│   ├── _authenticated/  # Protected app pages
│   ├── api/             # API routes (chat, transcription)
│   ├── about.ai.tsx     # "Why AI" page
│   ├── auth.tsx         # Demo sign-in
│   └── index.tsx        # Marketing landing page
└── styles.css           # Tailwind v4 theme tokens
```

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 20+
- A Lovable Cloud backend (auto-provisioned when the project is created)

### Install dependencies

```bash
bun install
```

### Run the development server

```bash
bun dev
```

The app will be available at `http://localhost:8080`.

### Build for production

```bash
bun run build
```

### Lint and format

```bash
bun run lint
bun run format
```

---

## Environment variables

Lovable injects the following variables automatically. Do not commit real secrets.

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_LOVABLE_AI_GATEWAY_URL` | Lovable AI Gateway endpoint |
| `LOVABLE_API_KEY` | Server-side Lovable API key |

> For local development, copy `.env` values from the Lovable editor.

---

## Key features explained

### Multimodal AI triage

The triage flow accepts symptoms as text, voice, photos, or short videos. Images and extracted video frames are compressed on the client and sent to `assessEmergency`, which calls `google/gemini-3.6-flash` with a structured system prompt. The model returns a JSON object with severity, first-aid steps, red flags, and a hospital report.

### Offline fallback

If the AI gateway is unreachable, the app falls back to `triage-fallback.ts`, a deterministic rules engine that scores severity from symptom tags, free-text keywords, and pain level. The UI clearly labels this as offline triage and prompts the user to re-assess once connectivity returns.

### Client-side AI queue

`src/lib/ai-queue.ts` limits concurrent AI requests and retries with exponential backoff. This protects against rate limits when many users submit triage requests at the same time.

### Voice assistant

The AI Assistant uses the Web Speech API for text-to-speech and a server-side Whisper proxy (`/api/transcribe`) for speech-to-text, supporting all three languages.

### Row Level Security

All database tables use RLS. Public tables grant only the minimum required privileges (`authenticated` for user data, `service_role` for admin/edge operations). The `has_role` security definer function lives in a private schema to prevent privilege escalation.

---

## Demo mode

The current build is configured for live demo use:

- A single demo account is used for sign-in.
- Each sign-in resets the demo session (medical profile, records, appointments, and emergency history are cleared).
- A language welcome modal appears on first visit.

---

## Roadmap / future improvements

- Push notifications for ambulance status updates.
- Real-time location sharing during emergency transport.
- Integration with national emergency dispatch APIs.
- Offline PWA support with service-worker caching.

---

## License

This project was built for the AI for Impact Challenge and is provided as-is for demonstration and educational purposes.

---

## Acknowledgements

- [Lovable](https://lovable.dev) for the full-stack platform and AI Gateway.
- [Google Gemini](https://ai.google.dev/) for the multimodal medical reasoning model.
- The Zimbabwean healthcare partners who provided domain guidance.
