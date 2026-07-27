# Software Behind LifeLine+

## Overview

LifeLine+ is a full-stack web application built on **TanStack Start**, a modern React framework that combines server-side rendering (SSR), static site generation (SSG), and server functions into a single codebase. The app is designed to run on edge infrastructure and is backed by **Lovable Cloud** (Supabase) for authentication, data persistence, and real-time features.

---

## Core Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | TanStack Start v1 | Full-stack React routing, data loading, and server functions |
| **Build Tool** | Vite 7 | Fast development and production bundling |
| **Language** | TypeScript | Type-safe frontend and backend code |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **UI Components** | shadcn/ui | Accessible, themeable component primitives |
| **Backend/Data** | Lovable Cloud / Supabase | Auth, PostgreSQL database, storage |
| **AI Models** | Lovable AI Gateway → Google Gemini 3.6 Flash | Multimodal triage, chat, and vision analysis |
| **Voice** | Web Speech API + OpenAI Whisper (via `/api/transcribe`) | Speech-to-text in English, Shona, and Ndebele |
| **State Management** | TanStack Query | Server state caching and synchronization |
| **Forms** | React Hook Form + Zod | Validated form handling |
| **Icons** | Lucide React | Consistent iconography |

---

## Architecture

LifeLine+ follows a **server-first, edge-ready architecture**:

```
┌─────────────────────────────────────┐
│           Browser / Client          │
│  React 19 + TanStack Router/Query   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      TanStack Start Server Layer    │
│  createServerFn  │  API Routes      │
│  SSR/SSG         │  /api/transcribe │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│         Lovable Cloud Backend       │
│  Supabase Auth  │  PostgreSQL       │
│  Row Level Security (RLS)           │
└─────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Single Codebase**: Frontend and backend logic live together in `src/`, reducing context switching and deployment complexity.
2. **Server Functions over REST**: Internal app logic uses `createServerFn` typed RPC calls rather than hand-written REST endpoints.
3. **Edge-Compatible**: The app targets Cloudflare Workers; server code avoids Node-only modules like `child_process`, `sharp`, or `puppeteer`.
4. **Security by Default**: Every database table uses Row Level Security (RLS). Roles are stored in a separate `user_roles` table, and admin checks use a `SECURITY DEFINER` function.

---

## Project Structure

```
src/
├── routes/                 # TanStack file-based routes
│   ├── __root.tsx          # Root layout with language provider
│   ├── index.tsx           # Marketing homepage
│   ├── auth.tsx            # Demo sign-in flow
│   ├── about.ai.tsx        # AI justification page
│   └── _authenticated/     # Protected app screens
│       ├── assistant.tsx   # AI emergency assistant
│       ├── emergency.new.tsx   # SOS flow
│       ├── emergency.$id.tsx   # Emergency detail
│       └── ministry.tsx    # National operations dashboard
├── components/             # Reusable UI components
│   ├── lifeline/           # Branded components (logo, hero)
│   └── accessibility/      # Accessibility panel
├── i18n/                   # Internationalization
│   ├── index.tsx           # Language provider + welcome modal
│   └── translations.ts     # English, Shona, Ndebele strings
├── lib/                    # Business logic and utilities
│   ├── emergency.functions.ts  # AI triage server functions
│   ├── triage-fallback.ts    # Offline rules-based triage
│   ├── ai-queue.ts           # Client-side AI request queue
│   └── media.ts              # Image/video compression
├── routes/api/             # Public HTTP endpoints
│   └── chat.ts             # Multimodal chat API
├── integrations/supabase/  # Auto-generated Supabase clients
└── styles.css              # Tailwind v4 theme tokens
```

---

## Key Software Systems

### 1. AI Triage Engine

The triage engine is the heart of LifeLine+. It accepts text, voice transcripts, photos, and videos and returns a structured severity assessment.

**Pipeline:**

```
User Input (text/voice/media)
        │
        ▼
Media Compression (client-side)
        │
        ▼
Client-Side AI Queue (concurrency + retry)
        │
        ▼
createServerFn("triage")  ──►  Lovable AI Gateway
        │
        ▼
Google Gemini 3.6 Flash (multimodal)
        │
        ▼
Zod-Validated Structured Output
        │
        ▼
Severity Badge + First-Aid Guidance + Hospital Recommendation
```

**Fallback:** If the AI gateway is unreachable, the app falls back to a rules-based triage engine (`src/lib/triage-fallback.ts`) that uses keyword matching and symptom severity rubrics.

### 2. Voice Intelligence

Voice input uses a dual approach:

- **Browser-native**: `Web Speech API` for fast, on-device speech-to-text in supported browsers.
- **Cloud fallback**: `MediaRecorder` captures audio, which is sent to `/api/transcribe` and forwarded to OpenAI Whisper for higher accuracy.

This ensures voice works across a wide range of devices and browsers common in Zimbabwe.

### 3. Multilingual Internationalization (i18n)

The app supports **English**, **Shona**, and **Ndebele**:

- A `LanguageProvider` wraps the root route and persists the chosen language in `localStorage`.
- A one-time welcome modal prompts first-time visitors to choose their language.
- All user-facing strings are centralized in `src/i18n/translations.ts`.
- Status updates, emergency labels, and accessibility text are all localized.

### 4. Authentication & Session Management

LifeLine+ uses **Supabase Auth** with a demo-only flow for the AI for Impact Challenge:

- Users sign in with pre-defined demo credentials.
- Every sign-in triggers a **session reset**: previous emergencies, medical profiles, contacts, records, and notifications are cleared.
- This guarantees each demo starts from a clean state.

For production, the auth flow can be switched to email/password or OAuth (Google) without structural changes.

### 5. Database Security (RLS)

All tables live in the `public` schema and are protected by Row Level Security:

- `GRANT` statements are included in every migration.
- User roles are stored in a separate `user_roles` table.
- The `has_role()` function uses `SECURITY DEFINER` to avoid recursive RLS checks.
- Leaked Password Protection (HIBP) is enabled on auth.

### 6. Client-Side AI Queue

To handle traffic spikes (e.g., 300 concurrent users), the app uses `src/lib/ai-queue.ts`:

- Limits concurrent AI requests to 2 at a time.
- Queues additional requests with exponential backoff retry.
- Prevents rate-limiting and improves reliability under load.

### 7. Accessibility Panel

A built-in accessibility panel allows users to:

- Increase or decrease text size.
- Toggle a dyslexia-friendly font.
- Adjust contrast preferences.

This helps the app meet WCAG 2.2 AA guidelines.

---

## Data Flow Example: SOS Emergency

1. User taps **SOS Emergency** on the homepage.
2. If not signed in, they are redirected to the demo auth screen.
3. The app clears any previous session data and creates a fresh medical profile.
4. User describes symptoms by text or voice and optionally uploads a photo/video.
5. Media is compressed client-side before upload.
6. The triage request enters the AI queue.
7. Gemini analyzes the input and returns:
   - Severity level (Critical, High, Medium, Low)
   - Recommended first-aid steps
   - Suggested hospital type
8. The app displays nearby hospitals using geolocation.
9. An emergency request is stored in the database with RLS-scoped access.
10. The Ministry dashboard aggregates anonymized national demand.

---

## Deployment & Hosting

- **Preview URL**: Latest development build.
- **Published URL**: Production deployment.
- **Custom Domain**: Configured for branded access.
- **Backend**: Lovable Cloud (Supabase) with scalable compute.
- **Edge Runtime**: Cloudflare Workers-compatible serverless functions.

---

## Why This Stack?

| Requirement | Solution |
|-------------|----------|
| Fast, responsive UI | TanStack Start + Vite + Tailwind |
| Multilingual users | Centralized i18n with localStorage persistence |
| Low-bandwidth areas | Client-side media compression, offline fallback triage |
| Voice input on basic smartphones | Web Speech API + Whisper fallback |
| Secure health data | Supabase RLS, separate roles table, HIBP |
| High concurrent load | AI queue + scalable backend compute |
| Multimodal AI | Gemini 3.6 Flash vision + text |

---

## Future Software Enhancements

- **PWA offline mode** with service-worker caching.
- **Real-time ambulance tracking** via Supabase Realtime.
- **Push notifications** for emergency status updates.
- **Integration with national health APIs** for live hospital bed availability.
- **Machine learning feedback loop** to improve triage accuracy using verified outcomes.

---

## Summary

LifeLine+ is built as a modern, secure, and scalable full-stack application. It combines the speed of TanStack Start, the reliability of Lovable Cloud, and the intelligence of Google Gemini to deliver a life-saving tool tailored for Zimbabwe's healthcare challenges.
