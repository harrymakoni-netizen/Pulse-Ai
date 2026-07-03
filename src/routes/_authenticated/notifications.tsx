import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, HeartPulse, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications · LifeLine+" }] }),
  component: () => {
    const q = useQuery({ queryKey: ["notifications"], queryFn: async () => (await supabase.from("notifications").select("*").order("created_at", { ascending: false })).data ?? [] });
    return (
      <AppShell>
        <div className="mb-6 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h1 className="font-display text-2xl font-semibold md:text-3xl">Notifications</h1></div>
        {q.data?.length ? (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {q.data.map(n => (
              <li key={n.id} className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${n.category === "emergency" ? "bg-[color:var(--alert)]/10 text-[color:var(--alert)]" : "bg-primary/10 text-primary"}`}>
                  {n.category === "emergency" ? <HeartPulse className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
                <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
              </li>
            ))}
          </ul>
        ) : <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">You're all caught up.</div>}
      </AppShell>
    );
  },
});