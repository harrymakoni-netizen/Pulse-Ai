import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderState = {
  isRecording: boolean;
  isTranscribing: boolean;
  elapsed: number;
  start: () => Promise<void>;
  stop: () => void;
  cancel: () => void;
  hasMic: boolean;
};

type Callbacks = {
  onTranscript: (text: string) => void;
  onError: (kind: "denied" | "unavailable" | "short" | "failed") => void;
  language: "en" | "sn" | "nd";
};

function pickMime(): string | undefined {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return undefined;
}

export function useVoiceRecorder(cb: Callbacks): RecorderState {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cancelledRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;

  const hasMic =
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  const transcribe = useCallback(async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "recording.webm");
      fd.append("language", cbRef.current.language);
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      if (!text) {
        cbRef.current.onError("failed");
        return;
      }
      cbRef.current.onTranscript(text);
    } catch {
      cbRef.current.onError("failed");
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const start = useCallback(async () => {
    if (!hasMic) {
      cbRef.current.onError("unavailable");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      cancelledRef.current = false;
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsRecording(false);
        if (cancelledRef.current) return;
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        if (blob.size < 2048) {
          cbRef.current.onError("short");
          return;
        }
        await transcribe(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((s) => s + 1), 1000);
      setIsRecording(true);
    } catch (err) {
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "SecurityError") cbRef.current.onError("denied");
      else cbRef.current.onError("unavailable");
      setIsRecording(false);
    }
  }, [hasMic, transcribe]);

  const stop = useCallback(() => {
    cancelledRef.current = false;
    try {
      recorderRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    try {
      recorderRef.current?.stop();
    } catch {
      /* noop */
    }
  }, []);

  return { isRecording, isTranscribing, elapsed, start, stop, cancel, hasMic };
}