// Server-only helper. Gateway calls happen inside handlers; keep this file out of the client bundle.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function getKey(): string {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return key;
}

export async function callChat(opts: {
  model?: string;
  messages: ChatMessage[];
  responseFormat?: { type: "json_object" };
  temperature?: number;
}): Promise<string> {
  const key = getKey();
  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
      temperature: opts.temperature ?? 0.4,
      ...(opts.responseFormat ? { response_format: opts.responseFormat } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429 || res.status === 503) {
      const ra = Number(res.headers.get("retry-after"));
      const err = new Error(`AI busy (${res.status})`) as Error & { __retryable: boolean; retryAfterMs?: number };
      err.__retryable = true;
      if (Number.isFinite(ra) && ra > 0) err.retryAfterMs = ra * 1000;
      throw err;
    }
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function streamChat(opts: {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
}): Promise<Response> {
  const key = getKey();
  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3-flash-preview",
      messages: opts.messages,
      temperature: opts.temperature ?? 0.5,
      stream: true,
    }),
  });
  return res;
}