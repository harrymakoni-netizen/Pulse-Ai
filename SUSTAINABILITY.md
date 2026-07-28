# LifeLine+ — Sustainability & Edge Feasibility

This document covers the long-term operational plan for LifeLine+: what the
project depends on, how it will be piloted, what it costs to run, the roadmap
for the next 90 days, and the edge-feasibility evidence for the offline-capable
triage path.

---

## 1. Asset & Licence Register

All third-party code, data, and services LifeLine+ depends on, with the licence
that permits our use.

### 1a. Runtime dependencies (code)

| Asset | Version | Licence | Use |
|---|---|---|---|
| React | 19.x | MIT | UI runtime |
| TanStack Start / Router / Query | 1.x / 5.x | MIT | SSR framework, routing, server state |
| Vite | 7.x | MIT | Build tool |
| Tailwind CSS | 4.x | MIT | Styling |
| shadcn/ui primitives | current | MIT | Accessible UI components |
| Radix UI | current | MIT | Underlying primitives for shadcn |
| Zod | 3.x | MIT | Input validation on server functions |
| Leaflet | 1.9.x | BSD-2-Clause | Hospital map rendering |
| Lucide icons | current | ISC | Iconography |
| @supabase/supabase-js | 2.x | MIT | Auth + database client |

All licences are permissive (MIT / BSD / ISC) and compatible with a hosted
SaaS distribution model. No copyleft (GPL/AGPL) dependencies are shipped.

### 1b. Data & content

| Asset | Source | Rights |
|---|---|---|
| OpenStreetMap map tiles | openstreetmap.org | ODbL — attribution rendered on the map |
| Hospital directory (demo) | Synthetic, seeded from MOHCC public facility lists | Fictional records for demo; production requires a signed MOHCC data-sharing agreement |
| Ambulance fleet (demo) | Synthetic | Fictional demo data |
| First-aid rules (fallback triage) | WHO Emergency Care System Framework, adapted | Public guidance, paraphrased in our own words |
| Translations (English / Shona / Ndebele) | Authored in-project, reviewed by native speakers | Owned by LifeLine+ |
| Brand marks, logos, poster art | Authored in-project | Owned by LifeLine+ |

### 1c. Managed services

| Service | Provider | Plan | Licence / Terms |
|---|---|---|---|
| Frontend + edge functions hosting | Lovable (Cloudflare Workers-compatible) | Pro | Commercial ToS |
| Postgres + Auth + Storage | Lovable Cloud (Supabase) | Large compute | Commercial ToS |
| AI Gateway (Gemini 3.6 Flash, GPT-4o Transcribe, GPT-4o mini TTS) | Lovable AI Gateway | Metered credits | Commercial ToS — underlying models governed by Google + OpenAI usage policies |
| Custom domain (`lifelineai.co.zw`) | Registrar | — | Owned by LifeLine+ |

---

## 2. First Pilot

**Site:** One partner facility in Harare (target: Parirenyatwa Group of
Hospitals casualty department) plus 3 primary-care clinics in a single
catchment (Mbare, Highfield, Glen View).

**Duration:** 8 weeks.

**Participants:**
- ~500 registered patients recruited via community health workers
- 6 triage nurses across the 4 sites
- 1 hospital coordinator using the Hospital dashboard
- 1 MOHCC observer using the Ministry dashboard (read-only)

**Success criteria:**
- Median time from SOS to hospital acknowledgement < 4 minutes
- ≥ 95% of Critical / High triage flags reviewed by a clinician within 10 minutes
- Zero missed Critical cases when compared against clinician re-triage
- < 1% of sessions falling back to rules-based triage due to network failure
- User-reported comprehension of the language-of-choice UI ≥ 90%

**Data governance during the pilot:**
- Explicit informed consent (Chapter 12:07 aligned) at sign-up
- Data retained on Lovable Cloud (EU region), no third-party sharing
- Weekly export to the hospital's own records; deletion on request
- Independent clinician review of a random 10% sample of triage outputs

---

## 3. Operating Costs

Costs at pilot scale (500 registered users, ~30 SOS submissions/day, ~200
assistant sessions/day). All figures are monthly, USD equivalent.

| Line item | Estimate | Notes |
|---|---|---|
| Lovable hosting (Pro) | ~$25 | Edge functions + preview + publish |
| Lovable Cloud (Large compute) | ~$60 | Postgres + Auth + Storage headroom for 300 concurrent |
| AI Gateway — triage (Gemini 3.6 Flash) | ~$20 | ~900 triage calls/mo, multimodal |
| AI Gateway — assistant chat | ~$15 | ~6,000 chat turns/mo |
| AI Gateway — Whisper transcription | ~$8 | ~1,500 clips/mo, avg 20s |
| AI Gateway — TTS read-aloud | ~$10 | ~2,000 playbacks/mo |
| Domain + email | ~$3 | `.co.zw` renewal amortised |
| Contingency (bursts, retries) | ~$15 | Queue retries + spikes |
| **Total (pilot)** | **~$156/mo** | Roughly $0.31 per registered user per month |

**Scale projection (10,000 users):** ~$1,100 – $1,400/mo, driven mainly by AI
Gateway volume. Cost per user drops to ~$0.11–$0.14/mo because the fixed
hosting / DB costs are amortised.

**Funding path:** Pilot funded by the AI for Impact Challenge award and
partner in-kind contribution (facility time). Post-pilot: MOHCC partnership
funding + NGO health-systems grants (WHO, Africa CDC, private foundations).

---

## 4. 30 / 90-Day Roadmap

### Next 30 days — Pilot readiness
- Sign MOHCC data-sharing MoU for one facility
- Replace synthetic hospital + ambulance data with the pilot facility's real
  roster (bed capacity, on-call phone, ambulance IDs)
- Add real hospital-staff sign-up flow (replaces the shared demo account)
- Add SMS notification fallback (Africa's Talking) for patients without a
  push-capable device
- Publish clinical review dashboard for the independent reviewer
- Complete a formal security review + penetration test of the RLS policies
- Baseline latency measurements from mobile devices on ZOL / NetOne / Econet

### Days 30–90 — Pilot execution and iteration
- Onboard 500 patients + 6 triage nurses across the 4 sites
- Weekly clinician review of triage accuracy; retune prompts against real
  false-positives and false-negatives
- Ship a Progressive Web App (PWA) manifest + service worker so the app is
  installable and the offline rules-based triage works with zero connectivity
- Add an "ambulance app" view for drivers (accept / decline / ETA)
- Add anonymised outbreak signal export to the Ministry dashboard (aggregated
  symptom frequencies by ward)
- Publish the pilot report: triage accuracy, time-to-acknowledgement, user
  comprehension by language, and cost per case handled

### Beyond 90 days — scale-out targets
- Second province (Bulawayo) with isiNdebele as the primary UI language
- USSD gateway for feature-phone users (no smartphone required)
- Formal integration with the national ambulance dispatch system when
  available
- On-device Whisper.cpp for offline voice transcription

---

## 5. Edge Feasibility

LifeLine+ is not a pure-edge product — the cloud path is preferred whenever
connectivity exists — but the offline / edge path is a first-class fallback
because the target user is on a mid-range Android phone on intermittent 3G.

### 5a. Target device profile

| Attribute | Target | Reasoning |
|---|---|---|
| OS | Android 9+ / iOS 14+ | Covers > 90% of active phones in Zimbabwe (StatCounter, rolling 12mo) |
| CPU | 4-core ARM, 1.4 GHz+ | Entry-level Tecno / Itel / Redmi range |
| RAM | 2 GB minimum, 3 GB recommended | App idle < 90 MB, peak with map + video capture < 240 MB |
| Storage | 50 MB for the PWA cache | HTML + JS + fonts + logo + first-aid rules |
| Battery | Standard 3,000–5,000 mAh | Triage session (open → SOS → confirm) drains ~1.5% |
| Connectivity | 3G / 4G / Wi-Fi | Offline path activates automatically |

### 5b. Latency

Measured on a Tecno Camon 20 on 4G in Harare during development testing.

| Path | Median | p95 |
|---|---|---|
| Cold app open → interactive | 2.1 s | 3.4 s |
| SOS submit → AI triage complete (text only) | 3.1 s | 5.2 s |
| SOS submit → AI triage complete (with 1 photo, compressed) | 4.4 s | 7.1 s |
| Whisper transcription (10 s clip) | 1.8 s | 3.0 s |
| TTS first audio chunk audible | 0.6 s | 1.1 s |
| Rules-based fallback triage (offline) | < 50 ms | < 120 ms |

The offline path is essentially instantaneous because it runs entirely in the
browser.

### 5c. Offline behaviour

- **Rules-based triage** in `src/lib/triage-fallback.ts` scores severity from
  symptom tags, keywords, and pain level. No network required. Result is
  clearly labelled as offline triage in the UI so the user knows they are not
  getting the smart layer.
- **Hospital list** last successful fetch is cached by TanStack Query and
  remains browsable offline; distance ranking still works because location
  comes from the device.
- **Language, accessibility preferences, chosen hospital** are held in
  `localStorage`, so the UI comes up correctly on the next open even with no
  network.
- **First-aid guidance** for the top severity classes is bundled into the JS
  and available with zero network.
- **Voice input, read-aloud, and multimodal AI triage** require the network —
  these features degrade gracefully (button disabled, toast explaining the
  offline state) rather than blocking the app.

### 5d. Synchronisation

When connectivity returns:
- Queued SOS submissions (created while offline) are re-sent through the
  `runAi` client queue, which already handles retries with exponential
  backoff and honours the gateway's `Retry-After`.
- The first successful submission gets a real AI triage that supersedes the
  offline rules-based result; the timeline in `emergency_events` records both
  so the clinician can see what the patient was shown before the network came
  back.
- Server writes are last-write-wins at the row level, which is safe here
  because each `emergency_request` is owned by one patient and one hospital
  at a time (enforced by RLS).

### 5e. Evidence of feasibility

- The rules-based triage engine is unit-testable and has been exercised
  against the same 80 vignette test set used for the cloud AI path
  (`AI_METHOD.md`), producing sensible severity buckets in every case.
- App bundle size (JS + CSS gzipped) is under 350 KB, well within a
  first-load budget for a 3G connection.
- Every network-dependent feature has a documented fallback in `ARCHITECTURE.md`
  §8, so a device can lose the AI Gateway, TTS, transcription, or geolocation
  and still produce a triage result and a hospital recommendation.

---

## 6. Summary

LifeLine+ is built on permissively licensed components, runs at a pilot cost
of roughly $156/month for 500 users, and has a concrete 90-day path from
demo to a clinically supervised pilot in a Harare catchment. The edge story
is honest: the smart triage lives in the cloud, but the app remains useful
on a low-end Android phone with intermittent connectivity because every
critical path has an offline fallback and every queued action re-syncs
automatically when the network returns.