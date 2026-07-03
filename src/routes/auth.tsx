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

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in · LifeLine+" },
      { name: "description", content: "Access your LifeLine+ emergency healthcare account." },
    ],
  }),
  component: AuthPage,
});

type Role = "patient" | "hospital_staff" | "ambulance" | "admin";

function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up" | "forgot">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("patient");
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
        toast.success("Welcome back");
        navigate({ to: "/dashboard", replace: true });
      } else if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, phone, role },
          },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in...");
        // Auto sign in (email confirm is disabled for demo)
        const { error: sErr } = await supabase.auth.signInWithPassword({ email, password });
        if (sErr) { setMode("sign-in"); return; }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Reset link sent. Check your inbox.");
        setMode("sign-in");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Authentication failed");
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-dvh gradient-hero">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-8">
        <Link to="/"><LifeLineLogo /></Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back home</Link>
      </header>
      <div className="mx-auto flex max-w-md flex-col px-4 pb-16 pt-4 md:pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass elevated rounded-3xl border p-6 md:p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-semibold">
              {mode === "sign-in" && "Welcome back"}
              {mode === "sign-up" && "Create your account"}
              {mode === "forgot" && "Reset your password"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "sign-in" && "Sign in to access your emergency dashboard."}
              {mode === "sign-up" && "Every second counts. Let's get you set up."}
              {mode === "forgot" && "We'll email you a secure link."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "sign-up" && (
              <>
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tendai Moyo" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+263 77 000 0000" />
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(["patient","hospital_staff","ambulance","admin"] as Role[]).map((r) => (
                      <button type="button" key={r} onClick={() => setRole(r)}
                        className={`rounded-md border px-3 py-2 text-xs font-medium ${role === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                        {r === "hospital_staff" ? "Hospital" : r === "patient" ? "Patient" : r === "ambulance" ? "Ambulance" : "Admin"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "sign-in" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-xs text-primary hover:underline">Forgot?</button>
                  )}
                </div>
                <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            )}
            <Button type="submit" className="mt-2 w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "sign-in" && (
              <>New to LifeLine+? <button className="text-primary hover:underline" onClick={() => setMode("sign-up")}>Create account</button></>
            )}
            {mode === "sign-up" && (
              <>Already have an account? <button className="text-primary hover:underline" onClick={() => setMode("sign-in")}>Sign in</button></>
            )}
            {mode === "forgot" && (
              <button className="text-primary hover:underline" onClick={() => setMode("sign-in")}>Back to sign in</button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
