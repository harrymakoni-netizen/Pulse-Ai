## Goal

On first visit, greet the user with a centered welcome modal to pick English, Shona, or Ndebele. Remember the choice, translate every page of LifeLine+ to it, and let them change language later from the header.

## User experience

1. First-ever visit → dimmed backdrop, LifeLine+ logo, headline "Choose your language / Sarudza mutauro / Khetha ulimi", three large language cards (EN / SN / ND with native names + a short line each), Continue button.
2. Choice persists in `localStorage` under `lifeline.lang`. Modal never reappears unless the user clears storage.
3. A compact EN/SN/ND switcher lives in the top-right of the app header (AppShell) and on the landing page nav — clicking updates the app instantly.
4. Every user-facing string on every page (landing, auth, dashboard, hospitals, hospital, ambulance, ministry, appointments, records, notifications, emergency new/detail, settings, admin, assistant, 404/error) renders through the active language.

## Technical approach

### 1. i18n infrastructure (new)

```text
src/i18n/
  index.tsx         ← LanguageProvider + useT() hook + <LanguagePicker/>
  translations.ts   ← flat dictionary: t[lang][key] = string
```

- `LanguageProvider` reads `localStorage.lifeline.lang` (SSR-safe: default "en" on server, hydrate real value in `useEffect`), exposes `{ lang, setLang, t }` via React context.
- `useT()` returns a `t(key, vars?)` function. Missing keys fall back to English so nothing renders blank.
- Mount `<LanguageProvider>` in `src/routes/__root.tsx` so it wraps every route.
- `<LanguagePicker />` is a Radix Dialog shown when `localStorage.lifeline.lang` is unset after hydration; on selection it writes storage and closes.

### 2. Header language switcher

- Add a small pill toggle (EN/SN/ND) into `src/components/lifeline/app-shell.tsx` header, and into the landing page nav in `src/routes/index.tsx`. Both call `setLang()` from context.

### 3. Translate every route

Replace hard-coded strings with `t("key")` in:

- Landing: `src/routes/index.tsx`
- Auth: `src/routes/auth.tsx`, `src/routes/reset-password.tsx`
- Authenticated shell + pages: `src/components/lifeline/app-shell.tsx`, `dashboard.tsx`, `hospitals.tsx`, `hospital.tsx`, `ambulance.tsx`, `ministry.tsx`, `appointments.tsx`, `records.tsx`, `notifications.tsx`, `emergency.new.tsx`, `emergency.$id.tsx`, `settings.tsx`, `admin.tsx`
- Existing `assistant.tsx`: migrate its local `T` dictionary into the shared `translations.ts` and use `useT()`.
- Error/not-found boundaries in `__root.tsx` and route files.

Keys are grouped by page (`landing.hero.title`, `dashboard.stats.activeCases`, …) to keep the dictionary readable. All three languages provided for every key.

### 4. AI chat language sync

`assistant.tsx` already sends `language` to `/api/chat`. Wire the same `lang` from context so the AI replies in the active language everywhere.

### 5. Dates / numbers

Format via `Intl.DateTimeFormat` / `Intl.NumberFormat` using a locale map (`en: "en-ZW"`, `sn: "sn-ZW"`, `nd: "nd-ZW"`) exposed by the provider as `locale`.

## Out of scope (this pass)

- Translating dynamic content that comes from the database (hospital names, user-entered notes) — those stay as written.
- RTL support (not needed for these languages).
- Server-side language negotiation via `Accept-Language`; we rely on the client picker.

## Verification

- Load site fresh (clear localStorage) → welcome modal appears, picking Shona translates the landing page immediately.
- Navigate through dashboard, hospitals, ministry, assistant, settings → all copy is in Shona.
- Switch to Ndebele from the header pill → every page updates without reload.
- Reload → chosen language persists, modal does not reappear.
- Playwright screenshot pass across desktop + mobile in all three languages on the landing page and dashboard.
