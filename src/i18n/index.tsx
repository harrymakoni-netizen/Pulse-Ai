import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICT, LANG_META, type Lang } from "./translations";
import { Globe, Check } from "lucide-react";

const STORAGE_KEY = "lifeline.lang";
const STORAGE_CHOSEN_KEY = "lifeline.hasChosen";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  locale: string;
  hasChosen: boolean;
};

const LanguageContext = createContext<Ctx | null>(null);

function isLang(v: unknown): v is Lang {
  return v === "en" || v === "sn" || v === "nd";
}

function interpolate(template: string, vars?: Record<string, string>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR-safe: default en, hydrate real value on mount.
  const [lang, setLangState] = useState<Lang>("en");
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const chosen = window.localStorage.getItem(STORAGE_CHOSEN_KEY);
      if (isLang(stored)) setLangState(stored);
      if (chosen === "true") setHasChosen(true);
    } catch { /* ignore */ }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setHasChosen(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
      window.localStorage.setItem(STORAGE_CHOSEN_KEY, "true");
    } catch { /* ignore */ }
    if (typeof document !== "undefined") document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string>) => {
      const s = DICT[lang][key] ?? DICT.en[key] ?? key;
      return interpolate(s, vars);
    },
    [lang],
  );

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t, locale: LANG_META[lang].locale, hasChosen }),
    [lang, setLang, t, hasChosen],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

// Language selector: globe trigger that expands to reveal all languages.
export function LanguagePill({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative inline-block text-xs ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-medium text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="uppercase tracking-wide">{lang}</span>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 z-50 mt-2 min-w-[9rem] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
        >
          {(["en", "sn", "nd"] as const).map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={lang === l}
                onClick={() => { setLang(l); setOpen(false); }}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary ${
                  lang === l ? "text-primary" : "text-foreground"
                }`}
              >
                <span className="flex flex-col">
                  <span className="font-medium">{LANG_META[l].native}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</span>
                </span>
                {lang === l ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// One-time welcome modal shown when localStorage has no language yet.
export function LanguageWelcome() {
  const { hasChosen, setLang, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || hasChosen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-welcome-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <div className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="font-display text-lg font-semibold">L+</span>
          </div>
          <h2 id="lang-welcome-title" className="mt-4 font-display text-2xl font-semibold">
            {t("welcome.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("welcome.subtitle")}</p>
        </div>
        <div className="mt-6 grid gap-3">
          {(["en", "sn", "nd"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div>
                <div className="font-display text-lg font-semibold">{LANG_META[l].native}</div>
                <div className="text-xs text-muted-foreground">{LANG_META[l].tagline}</div>
              </div>
              <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium">
                {l.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { Lang };
export { LANG_META };