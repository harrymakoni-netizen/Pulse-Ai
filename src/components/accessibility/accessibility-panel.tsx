import { useCallback, useEffect, useRef, useState } from "react";
import {
  Accessibility,
  X,
  Plus,
  Minus,
  Sun,
  Moon,
  Contrast,
  Type,
  RotateCcw,
  PauseCircle,
  MousePointer2,
  Link as LinkIcon,
  Eye,
  BookOpenText,
} from "lucide-react";

const STORAGE_KEY = "lifeline.a11y";

type Settings = {
  textScale: number; // 1.0..1.8
  letterSpacing: number; // 0..0.15em
  lineHeight: number; // 1.4..2.2
  highContrast: boolean;
  darkMode: boolean;
  dyslexiaFont: boolean;
  reduceMotion: boolean;
  highlightLinks: boolean;
  bigCursor: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  colorFilter: "none" | "protanopia" | "deuteranopia" | "tritanopia";
};

const DEFAULTS: Settings = {
  textScale: 1,
  letterSpacing: 0,
  lineHeight: 1.55,
  highContrast: false,
  darkMode: false,
  dyslexiaFont: false,
  reduceMotion: false,
  highlightLinks: false,
  bigCursor: false,
  readingGuide: false,
  readingMask: false,
  colorFilter: "none",
};

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function applyToDom(s: Settings) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.style.setProperty("--a11y-text-scale", String(s.textScale));
  html.style.setProperty("--a11y-letter-spacing", `${s.letterSpacing}em`);
  html.style.setProperty("--a11y-line-height", String(s.lineHeight));
  html.classList.toggle("a11y-high-contrast", s.highContrast);
  html.classList.toggle("dark", s.darkMode);
  html.classList.toggle("a11y-dyslexia", s.dyslexiaFont);
  html.classList.toggle("a11y-reduce-motion", s.reduceMotion);
  html.classList.toggle("a11y-highlight-links", s.highlightLinks);
  html.classList.toggle("a11y-big-cursor", s.bigCursor);
  html.classList.toggle("a11y-reading-mask", s.readingMask);
  html.setAttribute("data-a11y-filter", s.colorFilter);
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [guideY, setGuideY] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const s = load();
    setSettings(s);
    applyToDom(s);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    applyToDom(settings);
  }, [settings]);

  useEffect(() => {
    if (!settings.readingGuide) return;
    function onMove(e: MouseEvent) {
      setGuideY(e.clientY);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [settings.readingGuide]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = () => setSettings(DEFAULTS);

  return (
    <>
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-[color:var(--alert)] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      {settings.readingGuide ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 z-[150] h-10"
          style={{
            top: guideY - 20,
            background: "rgba(225,29,72,0.12)",
            borderTop: "2px solid rgba(225,29,72,0.6)",
            borderBottom: "2px solid rgba(225,29,72,0.6)",
          }}
        />
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open accessibility menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-3 right-3 z-[140] inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-xl ring-2 ring-white/40 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--alert)] md:bottom-6 md:right-6 md:h-14 md:w-14"
      >
        <Accessibility className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[color:var(--alert)] ring-2 ring-white md:h-3 md:w-3" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Accessibility settings"
          className="fixed inset-0 z-[160] flex items-end justify-end bg-black/40 backdrop-blur-sm md:items-center md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-background text-foreground shadow-2xl md:max-h-[85vh] md:max-w-md md:rounded-3xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-2">
                <Accessibility className="h-5 w-5 text-[color:var(--alert)]" aria-hidden="true" />
                <h2 className="font-display text-lg font-semibold">Accessibility</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close accessibility menu"
                className="rounded-full p-2 hover:bg-secondary"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-6 px-5 py-5">
              <Group title="Reading">
                <Stepper
                  icon={<Type className="h-4 w-4" />}
                  label={`Text size · ${Math.round(settings.textScale * 100)}%`}
                  onDec={() =>
                    update("textScale", Math.max(0.85, +(settings.textScale - 0.1).toFixed(2)))
                  }
                  onInc={() =>
                    update("textScale", Math.min(1.8, +(settings.textScale + 0.1).toFixed(2)))
                  }
                />
                <Stepper
                  label={`Letter spacing · ${settings.letterSpacing.toFixed(2)}em`}
                  onDec={() =>
                    update(
                      "letterSpacing",
                      Math.max(0, +(settings.letterSpacing - 0.02).toFixed(2)),
                    )
                  }
                  onInc={() =>
                    update(
                      "letterSpacing",
                      Math.min(0.2, +(settings.letterSpacing + 0.02).toFixed(2)),
                    )
                  }
                />
                <Stepper
                  label={`Line spacing · ${settings.lineHeight.toFixed(2)}`}
                  onDec={() =>
                    update("lineHeight", Math.max(1.2, +(settings.lineHeight - 0.1).toFixed(2)))
                  }
                  onInc={() =>
                    update("lineHeight", Math.min(2.4, +(settings.lineHeight + 0.1).toFixed(2)))
                  }
                />
              </Group>

              <Group title="Display">
                <Toggle
                  icon={<Contrast className="h-4 w-4" />}
                  label="High contrast"
                  checked={settings.highContrast}
                  onChange={(v) => update("highContrast", v)}
                />
                <Toggle
                  icon={
                    settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
                  }
                  label="Dark mode"
                  checked={settings.darkMode}
                  onChange={(v) => update("darkMode", v)}
                />
                <Toggle
                  icon={<Type className="h-4 w-4" />}
                  label="Dyslexia-friendly font"
                  checked={settings.dyslexiaFont}
                  onChange={(v) => update("dyslexiaFont", v)}
                />
                <Toggle
                  icon={<LinkIcon className="h-4 w-4" />}
                  label="Highlight links & buttons"
                  checked={settings.highlightLinks}
                  onChange={(v) => update("highlightLinks", v)}
                />
                <Toggle
                  icon={<MousePointer2 className="h-4 w-4" />}
                  label="Larger cursor"
                  checked={settings.bigCursor}
                  onChange={(v) => update("bigCursor", v)}
                />
              </Group>

              <Group title="Motion & focus">
                <Toggle
                  icon={<PauseCircle className="h-4 w-4" />}
                  label="Pause animations"
                  checked={settings.reduceMotion}
                  onChange={(v) => update("reduceMotion", v)}
                />
                <Toggle
                  icon={<BookOpenText className="h-4 w-4" />}
                  label="Reading guide (follows cursor)"
                  checked={settings.readingGuide}
                  onChange={(v) => update("readingGuide", v)}
                />
                <Toggle
                  icon={<Eye className="h-4 w-4" />}
                  label="Reading mask (dim edges)"
                  checked={settings.readingMask}
                  onChange={(v) => update("readingMask", v)}
                />
              </Group>

              <Group title="Colour blindness filter">
                <div className="grid grid-cols-2 gap-2">
                  {(["none", "protanopia", "deuteranopia", "tritanopia"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => update("colorFilter", f)}
                      aria-pressed={settings.colorFilter === f}
                      className={`rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                        settings.colorFilter === f
                          ? "border-[color:var(--alert)] bg-[color:var(--alert)]/10 text-[color:var(--alert)]"
                          : "border-border bg-card text-foreground hover:bg-secondary"
                      }`}
                    >
                      {f === "none" ? "Off" : f}
                    </button>
                  ))}
                </div>
              </Group>

              <button
                type="button"
                onClick={reset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium hover:bg-secondary/70"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset to defaults
              </button>

              <p className="text-center text-[11px] text-muted-foreground">
                Preferences follow WCAG 2.2 AA and are saved on this device.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Inline SVG filters for colour-blindness simulation */}
      <svg
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", width: 0, height: 0 }}
      >
        <defs>
          <filter id="a11y-protanopia">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="a11y-deuteranopia">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="a11y-tritanopia">
            <feColorMatrix
              type="matrix"
              values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title}>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Stepper({
  icon,
  label,
  onInc,
  onDec,
}: {
  icon?: React.ReactNode;
  label: string;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onDec}
          aria-label={`Decrease ${label}`}
          className="rounded-md border border-border p-1.5 hover:bg-secondary"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onInc}
          aria-label={`Increase ${label}`}
          className="rounded-md border border-border p-1.5 hover:bg-secondary"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Toggle({
  icon,
  label,
  checked,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-[color:var(--alert)]" : "bg-border"}`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
    </button>
  );
}
