import { createFileRoute } from "@tanstack/react-router";
import { streamChat, type ChatMessage } from "@/lib/ai-gateway.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: ChatMessage[]; language?: "en"|"sn"|"nd" };
        const lang = body.language ?? "en";
        const langName = { en: "English", sn: "Shona (chiShona)", nd: "Ndebele (isiNdebele)" }[lang];
        const system: ChatMessage = {
          role: "system",
          content: `You are LifeLine+ AI, a calm, professional emergency healthcare assistant for Zimbabwe.
You help users understand symptoms, provide first-aid guidance, and coordinate emergency care.
Always respond in ${langName}. Ask focused questions one at a time. Use short paragraphs and clear bullet points.
If symptoms sound critical (chest pain with radiation, stroke signs FAST, severe bleeding, unresponsive, anaphylaxis, active seizure), tell the user to press the SOS button immediately and call 999 or 112.
Be honest about your limits. You do not replace a clinician.`,
        };
        const messages = [system, ...(body.messages ?? [])];
        const upstream = await streamChat({ messages });
        if (!upstream.ok || !upstream.body) {
          return new Response("AI unavailable", { status: 502 });
        }
        // Transform OpenAI SSE stream to plain text token stream
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            let buf = "";
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                let idx;
                while ((idx = buf.indexOf("\n")) !== -1) {
                  const line = buf.slice(0, idx).trim(); buf = buf.slice(idx + 1);
                  if (!line.startsWith("data:")) continue;
                  const payload = line.slice(5).trim();
                  if (payload === "[DONE]") { controller.close(); return; }
                  try {
                    const json = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: string } }> };
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(encoder.encode(delta));
                  } catch { /* ignore */ }
                }
              }
            } catch (e) { controller.error(e); }
            controller.close();
          },
        });
        return new Response(stream, { headers: { "content-type": "text/plain; charset=utf-8" } });
      },
    },
  },
});