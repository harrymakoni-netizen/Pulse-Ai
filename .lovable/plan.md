# Read-Aloud + SOS Voice Recording

Add two capabilities so the app is accessible and hands-free during emergencies.

## 1. Read-aloud (TTS) for AI messages

Applies to both the AI Assistant (`src/routes/_authenticated/assistant.tsx`) and the SOS AI triage result (`src/routes/_authenticated/emergency.new.tsx` + `emergency.$id.tsx` where AI report is shown).

- New server route `src/routes/api/speak.ts` that proxies Lovable AI Gateway `/v1/audio/speech` using `openai/gpt-4o-mini-tts`, streaming SSE with `response_format: "pcm"`. Keeps `LOVABLE_API_KEY` server-side.
- New client helper `src/lib/tts.ts` exposing `speak(text, lang)` and `stopSpeech()`. Uses Web Audio API to play PCM chunks progressively (see ai-text-to-speech guide). Voice choice `alloy`; language steering via `instructions` field ("Speak in Shona/Ndebele/English, warm and calm").
- UI: small speaker icon button next to every AI-authored message (assistant chat bubbles) and next to the AI triage summary/recommendation card in SOS. Toggles play/stop. Auto-stops when a new message plays or on unmount.
- Chunk long text with the sentence-splitter from the TTS guide so triage reports never hit the input cap.

## 2. Voice recording in SOS

The Assistant already records via `MediaRecorder` → `/api/transcribe`. Mirror that in SOS symptoms entry.

- In `src/routes/_authenticated/emergency.new.tsx`, add a mic button beside the symptoms textarea.
- Reuse existing `/api/transcribe` route (Whisper). On stop, append transcript to the symptoms field (localized "Listening…" indicator).
- Respect selected language: pass `language` hint to transcription.
- Extract the recorder logic from `assistant.tsx` into `src/lib/use-voice-recorder.ts` so both screens share one implementation.

## Technical details

- TTS server route uses `stream_format: "sse"`, forwards `response.body` unchanged; client decodes base64 PCM deltas at 24kHz mono.
- Guard against autoplay: only start `AudioContext` inside the user click on the speaker button.
- Cancel in-flight TTS fetch with `AbortController` when the user taps stop or navigates away.
- Recorder hook returns `{ isRecording, start, stop, transcript, error }` and handles mic permission errors with localized toasts.
- Add i18n keys: `tts.play`, `tts.stop`, `sos.record`, `sos.listening`, `sos.recordError` in English, Shona, Ndebele.

## Out of scope

- No auto-read on message arrival (user must tap the speaker) to avoid surprising audio in public.
- No voice cloning or non-default voices.
