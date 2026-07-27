## Goal
Let users attach a photo (or short video frame) of an injury/symptom during triage so the AI can factor visual evidence into its assessment.

## Feasibility
Yes. Lovable AI Gateway supports multimodal input — Gemini 3.x Flash models accept images in the chat `messages` array as `image_url` blocks (https URL or base64 data URL). Video is supported by Gemini too, but browser video files are large and slow; the pragmatic path is **images + an auto-captured frame from a short video**, sent as base64 to the existing triage server function.

## Scope (what will change)

### 1. Emergency triage flow (`src/routes/_authenticated/emergency/new.tsx`)
- Add a new "Photo/Video (optional)" field on Step 1 (under the description textarea).
- Accept up to 3 images (JPEG/PNG/WebP, ≤5 MB each) OR 1 short video (≤10 s, ≤15 MB).
- For video: extract 1–2 still frames client-side via a hidden `<canvas>` (no server transcoding needed on the Worker runtime).
- Show thumbnails with a remove button. Compress large images client-side to ~1280 px longest edge before upload.

### 2. AI triage server function (`src/lib/emergency.functions.ts`)
- Extend the input schema with `images: string[]` (base64 data URLs).
- Switch the triage model to a vision-capable one (`google/gemini-3.6-flash` or `google/gemini-3.1-flash-lite` — both accept images) and build the user message as a multimodal `content` array (`text` + `image_url` blocks) instead of a plain string.
- Update the system prompt so the model considers visual cues (visible bleeding, swelling, burns, rash, deformity) and calls out any image quality issues.
- Keep the existing Zod-validated JSON output shape unchanged so the rest of the UI keeps working.

### 3. Storage decision
- **Do not persist images by default** — pass them straight to the model as base64 and discard. This avoids new storage buckets, RLS policy work, and PII retention concerns for a demo.
- Optionally (only if you want it): save to a private `triage-media` Supabase Storage bucket linked to the emergency request. Not included unless you say yes.

### 4. i18n
- Add keys for the new UI: `emerg.new.media`, `emerg.new.mediaHint`, `emerg.new.addPhoto`, `emerg.new.addVideo`, `emerg.new.remove`, `emerg.new.mediaTooLarge`, `emerg.new.mediaAnalyzing`, in English, Shona, Ndebele.

### 5. Assistant chat (`src/routes/_authenticated/assistant.tsx`)
- Out of scope for this plan unless you want image chat there too — happy to add in a follow-up.

## Non-goals
- No new storage bucket, no DB schema change, no persistence of uploaded media.
- No real-time video streaming; only still images (and stills extracted from a short clip).
- No changes to hospital selection, contact, or timeline logic.

## Technical notes
- Gateway multimodal shape:
  ```
  { role: "user", content: [
      { type: "text", text: "<symptoms/context>" },
      { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } }
  ]}
  ```
- Client compression: draw to `<canvas>` at max 1280 px, `toBlob("image/jpeg", 0.82)`, then `FileReader` → data URL.
- Keep total request body under ~4 MB; enforce cap before send and show a friendly "compress or remove one" toast.
- Reuse the existing `runAi` queue + backoff — no new rate-limit logic.

## Question before I build
Video is heavier and mostly redundant vs. 1–3 clear photos. Do you want:
- **A) Photos only** (simplest, fastest, recommended), or
- **B) Photos + short video (≤10 s) with auto-frame extraction**?