# References & Resources Used in LifeLine+

This document lists the technologies, APIs, data sources, frameworks, and domain references that informed the design and implementation of LifeLine+.

---

## 1. Frameworks, Libraries & Tooling

| Technology | Purpose | Reference |
|------------|---------|-----------|
| TanStack Start v1 | Full-stack React framework (routing, SSR, server functions) | https://tanstack.com/start |
| TanStack Router | File-based routing and navigation | https://tanstack.com/router |
| TanStack Query | Server state caching and data synchronization | https://tanstack.com/query |
| React 19 | UI component runtime | https://react.dev |
| Vite 7 | Build tool and dev server | https://vitejs.dev |
| Tailwind CSS v4 | Utility-first styling and design tokens | https://tailwindcss.com |
| shadcn/ui | Accessible, themeable UI primitives | https://ui.shadcn.com |
| Zod | Runtime schema validation | https://zod.dev |
| React Hook Form | Form state management | https://react-hook-form.com |
| date-fns | Date formatting utilities | https://date-fns.org |
| Lucide React | Iconography | https://lucide.dev |
| Leaflet + React-Leaflet | Interactive maps | https://leafletjs.com / https://react-leaflet.js.org |

---

## 2. Backend, Auth & Data Platform

| Technology | Purpose | Reference |
|------------|---------|-----------|
| Lovable Cloud | Managed backend, auth, and database platform | https://lovable.dev |
| Supabase | PostgreSQL database, authentication, Row Level Security | https://supabase.com |
| Supabase Auth | User authentication and session management | https://supabase.com/docs/guides/auth |
| PostgreSQL | Relational database | https://www.postgresql.org |

---

## 3. AI, Voice & Multimodal Services

| Technology | Purpose | Reference |
|------------|---------|-----------|
| Lovable AI Gateway | Unified proxy for AI model calls | https://ai.gateway.lovable.dev |
| Google Gemini 3.6 Flash | Multimodal reasoning (text, image, video) for triage | https://ai.google.dev/gemini-api |
| OpenAI Whisper | Speech-to-text transcription (via `/api/transcribe`) | https://platform.openai.com/docs/guides/speech-to-text |
| Web Speech API | Browser-native text-to-speech and speech-to-text | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| MediaRecorder API | Client-side audio/video capture | https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder |

---

## 4. Design, UX & Accessibility References

| Resource | Purpose |
|----------|---------|
| WCAG 2.2 Guidelines | Accessibility standards for color contrast, font scaling, and keyboard navigation | https://www.w3.org/WAI/WCAG22 |
| Apple Human Interface Guidelines | Inspiration for minimal, high-contrast mobile-first design | https://developer.apple.com/design/human-interface-guidelines |
| Material Design 3 | Component and motion patterns | https://m3.material.io |

---

## 5. Presentation-Ready References

Use these citations directly in your pitch deck or bibliography slide.

### Zimbabwe Data Protection & Digital Governance

| Citation | Reference |
|----------|-----------|
| Republic of Zimbabwe. (2021). *Cybersecurity and Data Protection Act [Chapter 12:07]*. Government of Zimbabwe. | https://www.zimlii.org/zw/legislation/act/2021/5/cybersecurity-and-data-protection-act-2021 |
| Postal and Telecommunications Regulatory Authority of Zimbabwe (POTRAZ). (n.d.). *Data protection and consumer rights*. | https://www.potraz.gov.zw |

### Zimbabwe Healthcare & Hospital Landscape

| Citation | Reference |
|----------|-----------|
| Ministry of Health and Child Care, Zimbabwe. (n.d.). *Official ministry portal*. | https://www.mohcc.gov.zw |
| Parirenyatwa Group of Hospitals. (n.d.). *About us*. | https://parirenyatwa.co.zw |
| Mpilo Central Hospital. (n.d.). *Public hospital services — Bulawayo*. | https://www.cityofbulawayo.gov.zw |
| United Bulawayo Hospitals. (n.d.). *Institutional information*. | https://www.ubh.co.zw |
| Harare Central Hospital. (n.d.). *Public health services*. | (cite via Ministry of Health portal) |
| Zimbabwe emergency numbers | 999 (police/fire/ambulance), 112 (standard emergency), 993 (ambulance) |

### AI for Impact & Digital Innovation Context

| Citation | Reference |
|----------|-----------|
| AI for Impact Challenge — Zimbabwe 2026. (2026). *Competition brief and rubric*. | (use your official competition URL or poster) |
| World Health Organization. (2022). *Emergency care systems: strengthening emergency and critical care*. | https://www.who.int/emergencycare |
| Google AI for Developers. (n.d.). *Gemini API — responsible AI and safety*. | https://ai.google.dev/gemini-api/docs/safety-setting |

---

## 6. Domain & Clinical References

| Topic | Source / Reference |
|-------|-------------------|
| Emergency triage severity rubrics | Adapted from widely used emergency-medicine triage principles (airway/breathing/circulation priority, pain scales, red-flag symptom identification). |
| Zimbabwe emergency numbers | 999 and 112 — public emergency services numbers in Zimbabwe. |
| Zimbabwe Data Protection Act | Informed the data-consent flow and privacy-first design. |
| AI for Impact Challenge (Zimbabwe 2026) | The competition context that shaped the problem statement and pitch. |


---

## 6. Hospital & Location Data

- Hospital names, locations, and bed/ambulance counts in the demo are **synthetic** and used for prototype demonstration only.
- The map layer is provided by **OpenStreetMap** (via Leaflet tiles).
- Geolocation uses the browser-native `navigator.geolocation` API.

---

## 7. Educational & Inspiration Resources

| Resource | Why It Was Useful |
|----------|-------------------|
| Google AI for Developers | Gemini model capabilities and prompting best practices | https://ai.google.dev |
| OpenAI Platform Docs | Whisper API integration and audio format guidance | https://platform.openai.com/docs |
| Supabase Docs | RLS policies, auth configuration, and database migrations | https://supabase.com/docs |
| TanStack Docs | Server functions, routing, and query patterns | https://tanstack.com |

---

## 8. Asset & Media References

- Logo, hero imagery, and branded visuals were generated or sourced for the LifeLine+ prototype.
- Icons are from **Lucide React**.
- Fonts and typography follow the project’s Tailwind v4 theme configuration in `src/styles.css`.

---

## 9. Note on Medical Advice

LifeLine+ is a **triage and information tool**, not a diagnostic or treatment authority. Clinical reasoning in the AI prompt is based on:

- Publicly available first-aid and emergency-triage educational material.
- Standard symptom severity frameworks (e.g., red-flag identification, pain scales).
- Explicit safety guardrails requiring users to call emergency services (999/112) for critical cases.

The app does not replace qualified medical professionals, ambulances, or emergency services.

---

*Last updated: July 2026 — for the 2026 AI for Impact Challenge (Zimbabwe).*
