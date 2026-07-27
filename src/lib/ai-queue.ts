// Client-side queue + retry with exponential backoff for AI Gateway calls.
// Smooths bursts (e.g. many users triaging at once) so the visible UI shows a
// short wait instead of raw 429 errors. Lives per-tab (module scope).

const MAX_CONCURRENT = 2;
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1000;

let inFlight = 0;
const waiting: Array<() => void> = [];

function acquire(): Promise<void> {
  return new Promise((resolve) => {
    if (inFlight < MAX_CONCURRENT) {
      inFlight++;
      resolve();
    } else {
      waiting.push(() => {
        inFlight++;
        resolve();
      });
    }
  });
}

function release() {
  inFlight = Math.max(0, inFlight - 1);
  const next = waiting.shift();
  if (next) next();
}

function isRetryable(err: unknown): { retry: true; delayMs?: number } | { retry: false } {
  if (err && typeof err === "object" && "__retryable" in err) {
    const e = err as { __retryable?: boolean; retryAfterMs?: number };
    if (e.__retryable) return { retry: true, delayMs: e.retryAfterMs };
  }
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/429|rate.?limit|load failed|failed to fetch|network|timeout|503|temporarily/i.test(msg)) {
    return { retry: true };
  }
  return { retry: false };
}

function backoff(attempt: number, hintMs?: number): number {
  if (hintMs && hintMs > 0) return Math.min(hintMs, 10_000);
  const base = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 400;
  return Math.min(base + jitter, 10_000);
}

export type QueueEvents = {
  onQueued?: (position: number) => void;
  onRetry?: (attempt: number, delayMs: number) => void;
};

/**
 * Run an AI call through the queue. Retries transient failures (429/503/network)
 * with exponential backoff. Non-retryable errors bubble up immediately.
 */
export async function runAi<T>(fn: () => Promise<T>, events?: QueueEvents): Promise<T> {
  const position = waiting.length + Math.max(0, inFlight - MAX_CONCURRENT) + 1;
  if (inFlight >= MAX_CONCURRENT) events?.onQueued?.(position);
  await acquire();
  try {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        const check = isRetryable(err);
        if (!check.retry || attempt === MAX_RETRIES) throw err;
        const delay = backoff(attempt, "delayMs" in check ? check.delayMs : undefined);
        events?.onRetry?.(attempt + 1, delay);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
    throw lastErr;
  } finally {
    release();
  }
}

/**
 * Fetch wrapper for streaming endpoints. Retries only if the response headers
 * indicate a transient failure (before any body is consumed).
 */
export async function fetchAi(input: RequestInfo | URL, init?: RequestInit, events?: QueueEvents): Promise<Response> {
  return runAi(async () => {
    const res = await fetch(input, init);
    if (res.status === 429 || res.status === 503) {
      const ra = Number(res.headers.get("retry-after"));
      const retryAfterMs = Number.isFinite(ra) && ra > 0 ? ra * 1000 : undefined;
      const err = new Error(`AI busy (${res.status})`) as Error & { __retryable: boolean; retryAfterMs?: number };
      err.__retryable = true;
      err.retryAfterMs = retryAfterMs;
      throw err;
    }
    return res;
  }, events);
}