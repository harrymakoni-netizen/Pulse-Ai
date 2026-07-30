import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password · LifeLine+" },
      {
        name: "description",
        content: "Set a new password for your LifeLine+ account.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-dvh gradient-hero">
      <div className="mx-auto max-w-md p-8">
        <LifeLineLogo />
        <div className="glass elevated mt-8 rounded-3xl border p-6">
          <h1 className="font-display text-2xl font-semibold">Set a new password</h1>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <Label htmlFor="pwd">New password</Label>
            <Input
              id="pwd"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={busy}>
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
