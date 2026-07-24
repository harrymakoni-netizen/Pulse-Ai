import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HeartPulse, Loader2 } from "lucide-react";
import { LanguagePill, useT } from "@/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · LifeLine+" },
      { name: "description", content: "Access your LifeLine+ emergency healthcare account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const t = useT();
  const [mode, setMode] = useState<"sign-in" | "forgot">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // If already signed in, bounce to dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.toast.welcome"));
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success(t("auth.toast.reset"));
        setMode("sign-in");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("auth.toast.fail"));
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-dvh gradient-hero">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-8">
        <Link to="/"><LifeLineLogo /></Link>
        <div className="flex items-center gap-3">
          <LanguagePill />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← {t("common.backHome")}</Link>
        </div>
      </header>
      <div className="mx-auto flex max-w-md flex-col px-4 pb-16 pt-4 md:pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass elevated rounded-3xl border p-6 md:p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">
              {mode === "sign-in" && t("auth.welcome")}
              {mode === "forgot" && t("auth.reset")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "sign-in" && t("auth.sub.signin")}
              {mode === "forgot" && t("auth.sub.forgot")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  {mode === "sign-in" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">{t("auth.forgot")}</button>
                  )}
                </div>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}
            <Button type="submit" className="mt-2 w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "sign-in" ? t("auth.action.signin") : t("auth.action.reset")}
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "forgot" && (
              <button className="text-primary hover:underline" onClick={() => setMode("sign-in")}>{t("auth.switch.backSignin")}</button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
