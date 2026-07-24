import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DICT, LANG_META, type Lang } from "./translations";

const STORAGE_KEY = "lifeline.lang";

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
      // Preload last chosen language for convenience, but always re-ask on load.
      if (isLang(stored)) setLangState(stored);
    } catch { /* ignore */ }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setHasChosen(true);
    try { window.localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
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

// Compact EN/SN/ND pill used in headers/nav.
export function LanguagePill({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs ${className}`}>
      {(["en", "sn", "nd"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
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