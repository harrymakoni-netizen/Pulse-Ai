import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HeartPulse, Loader2 } from "lucide-react";
import { LanguagePill, useT } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · LifeLine+" },
      { name: "description", content: "Access your LifeLine+ emergency healthcare account." },
      { property: "og:title", content: "Sign in · LifeLine+" },
      {
        property: "og:description",
        content: "Access your LifeLine+ emergency healthcare account.",
      },
      { property: "og:url", content: "https://www.lifelineai.co.zw/auth" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: "https://www.lifelineai.co.zw/auth" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fresh session on every visit: sign out any lingering user and clear
    // profile info persisted from a previous demo run.
    (async () => {
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
      try {
        window.localStorage.removeItem("lifeline.displayName");
      } catch {
        /* ignore */
      }
    })();
  }, []);

  async function handleDemoSignIn() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t("auth.fullName"));
      return;
    }
    setBusy(true);
    const email = "demo@lifelineplus.app";
    const password = "lifeline-demo-2026";
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const signUp = await supabase.auth.signUp({ email, password });
        if (signUp.error && !/registered|exists/i.test(signUp.error.message)) throw signUp.error;
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error) throw retry.error;
      }
      try {
        window.localStorage.setItem("lifeline.displayName", trimmed);
      } catch {
        /* ignore */
      }
      // Fire-and-forget: don't block navigation on profile update or cleanup.
      void (async () => {
        try {
          await supabase.auth.updateUser({ data: { full_name: trimmed } });
        } catch {
          /* ignore */
        }
        try {
          const { data: u } = await supabase.auth.getUser();
          if (!u.user) return;
          const uid = u.user.id;
          await Promise.allSettled([
            supabase.from("emergency_requests").delete().eq("patient_id", uid),
            supabase
              .from("profiles")
              .update({
                full_name: trimmed,
                phone: null,
                blood_type: null,
                allergies: [],
                medications: [],
                dob: null,
              })
              .eq("id", uid),
            supabase.from("emergency_contacts").delete().eq("user_id", uid),
            supabase.from("medical_records").delete().eq("user_id", uid),
            supabase.from("appointments").delete().eq("user_id", uid),
            supabase.from("notifications").delete().eq("user_id", uid),
          ]);
        } catch {
          /* ignore */
        }
      })();
      toast.success(t("auth.toast.welcome"));
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.toast.fail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh gradient-hero">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-8">
        <Link to="/">
          <LifeLineLogo />
        </Link>
        <div className="flex items-center gap-3">
          <LanguagePill />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← {t("common.backHome")}
          </Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-md flex-col px-4 pb-16 pt-4 md:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass elevated rounded-3xl border p-6 md:p-8"
        >
          <div className="mb-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">{t("auth.welcome")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("auth.sub.signin")}</p>
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="fullName">{t("auth.fullName")}</Label>
            <Input
              id="fullName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("auth.fullName")}
              autoComplete="name"
              className="h-12"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDemoSignIn();
              }}
            />
          </div>
          <Button
            onClick={handleDemoSignIn}
            className="mt-4 h-12 w-full text-base"
            disabled={busy || !name.trim()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("auth.action.signin")}
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">{t("auth.demoNote")}</p>
        </motion.div>
      </div>
    </div>
  );
}
