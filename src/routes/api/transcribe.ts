import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        const inbound = await request.formData();
        const file = inbound.get("file");
        const language = (inbound.get("language") as string | null) ?? "";
        if (!(file instanceof Blob)) return new Response("Missing file", { status: 400 });
        if (file.size < 2048) return new Response("Recording too short", { status: 400 });

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-transcribe");
        // Name file for its container so the provider infers format
        const type = (file as Blob).type || "audio/webm";
        const ext = type.includes("wav")
          ? "wav"
          : type.includes("mp4")
            ? "mp4"
            : type.includes("mpeg")
              ? "mp3"
              : "webm";
        upstream.append("file", file, `recording.${ext}`);
        // Only pass bare ISO-639-1 codes; skip sn/nd (auto-detect works better).
        if (language === "en") upstream.append("language", "en");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });
        const text = await res.text();
        if (!res.ok) return new Response(text || "Transcription failed", { status: res.status });
        try {
          const json = JSON.parse(text) as { text?: string };
          return new Response(JSON.stringify({ text: json.text ?? "" }), {
            headers: { "content-type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ text }), {
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
