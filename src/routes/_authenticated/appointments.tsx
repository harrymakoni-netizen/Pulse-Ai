import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({ meta: [{ title: "Appointments · LifeLine+" }] }),
  component: () => {
    const q = useQuery({ queryKey: ["appointments"], queryFn: async () => (await supabase.from("appointments").select("*, hospitals(name)").order("scheduled_at")).data ?? [] });
    return (
      <AppShell>
        <h1 className="mb-6 font-display text-2xl font-semibold md:text-3xl">Appointments</h1>
        {q.data?.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {q.data.map(a => (
              <li key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-primary"><CalendarClock className="h-4 w-4" /><span className="text-sm font-medium">{new Date(a.scheduled_at).toLocaleString()}</span></div>
                <div className="mt-1 text-sm">{a.doctor_name ?? "General practitioner"}</div>
                <div className="text-xs text-muted-foreground">{(a as { hospitals?: { name?: string } }).hospitals?.name ?? "—"}</div>
                {a.reason ? <div className="mt-2 text-sm text-muted-foreground">{a.reason}</div> : null}
              </li>
            ))}
          </ul>
        ) : <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No appointments scheduled.</div>}
      </AppShell>
    );
  },
});