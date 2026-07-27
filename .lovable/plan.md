## Goal
Allow attaching photos/videos from the device gallery (in addition to camera capture) on the emergency triage flow, and add the same photo/video attachment capability to the AI Assistant chat so the AI can analyze the media.

## Changes

### 1. Emergency triage (`src/routes/_authenticated/emergency.new.tsx`)
Currently the photo/video inputs use `capture="environment"`, which on mobile forces the camera and hides the gallery. Split into two controls per media type:
- "Take photo" (camera) and "Upload photo" (gallery) — remove `capture` on the upload input.
- "Record video" (camera) and "Upload video" (gallery).
Keep the existing compression / frame extraction / 3-image cap logic unchanged. Add new i18n keys (`emerg.new.takePhoto`, `emerg.new.uploadPhoto`, `emerg.new.recordVideo`, `emerg.new.uploadVideo`) in en/sn/nd.

### 2. AI Assistant media attachments (`src/routes/_authenticated/assistant.tsx`)
- Add attach buttons next to the mic: "Take/Upload photo" and "Record/Upload video" (same 4-button pattern as triage), with a small preview strip above the composer showing thumbnails + remove (X).
- Reuse the `compressImage` and `extractVideoFrames` helpers — extract them into `src/lib/media.ts` so both pages share one implementation.
- Cap 3 images per message, same size limits and toasts.
- On send: include images in the request body and clear them after successful send.
- Add i18n keys for the assistant attach labels and preview aria-labels.

### 3. Chat API (`src/routes/api/chat.ts`) + gateway
- Accept optional `images: string[]` on the latest user message from the assistant request body. When present, rewrite the last user message's `content` into the OpenAI multimodal blocks shape (`[{type:"text",...}, {type:"image_url",...}]`) and switch the model to `google/gemini-3.6-flash` (vision-capable) for that request only. Text-only requests keep the current fast model.
- Update the system prompt to instruct the model to describe visible clinical signs when an image is attached, mirroring the triage prompt guidance.
- No changes needed in `ai-gateway.server.ts` (already forwards `messages` as-is).

### 4. Shared helper (`src/lib/media.ts` — new file)
Export `compressImage(file, maxSize?, quality?)` and `extractVideoFrames(file, count?)` moved verbatim from `emergency.new.tsx`. Update `emergency.new.tsx` to import from here.

## Out of scope
- No DB/schema changes (assistant messages aren't persisted; triage already stores `images` inside `ai_summary` via the assessment payload only — no change).
- No changes to voice/transcription, i18n architecture, or triage business logic.
- No new dependencies.

## Verification
- Build passes.
- Manual: on triage step 1, "Upload photo" opens the gallery on mobile; "Take photo" opens the camera. Same for video.
- Manual: on Assistant, attach an image, send a message, confirm the AI reply references the image; remove-attachment (X) works; 3-image cap enforced.
