import { createFileRoute } from "@tanstack/react-router";

// Lovable AI Gateway text-to-speech proxy. Streams SSE with base64 PCM chunks
// that the client decodes and plays progressively via Web Audio.
export const Route = createFileRoute("/api/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        let body: { text?: string; lang?: "en" | "sn" | "nd" };
        try {
          body = (await request.json()) as { text?: string; lang?: "en" | "sn" | "nd" };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const text = (body.text ?? "").trim();
        if (!text) return new Response("Missing text", { status: 400 });
        // Cap input to stay well under model limits.
        const input = text.slice(0, 3500);
        const lang = body.lang ?? "en";
        const langName = { en: "English", sn: "Shona (chiShona)", nd: "Ndebele (isiNdebele)" }[
          lang
        ];
        const instructions = `Speak in ${langName} with a calm, warm, clearly-paced clinical tone suitable for an emergency care assistant.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-4o-mini-tts",
            input,
            voice: "alloy",
            instructions,
            stream_format: "sse",
            response_format: "pcm",
          }),
          signal: request.signal,
        });
        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          return new Response(errText || "TTS unavailable", { status: upstream.status || 502 });
        }
        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});