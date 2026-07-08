import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SeverityBadge } from "@/components/lifeline/severity-badge";
import { BedDouble, Ambulance, Building2, Timer, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_authenticated/hospital")({
  head: () => ({ meta: [{ title: "Hospital dashboard · LifeLine+" }] }),
  component: HospitalDash,
});

function HospitalDash() {
  const t = useT();
  const q = useQuery({ queryKey: ["staff-requests"], queryFn: async () => (await supabase.from("emergency_requests").select("id,severity,status,created_at,eta_minutes,ai_report,symptoms").order("created_at", { ascending: false }).limit(20)).data ?? [] });
  const kpis = [
    { icon: Ambulance, label: "Incoming", value: q.data?.filter(r => ["hospital_notified","dispatched","en_route","transporting"].includes(r.status)).length ?? 0 },
    { icon: BedDouble, label: "Available beds", value: 142 },
    { icon: Timer, label: "Avg ETA", value: "8 min" },
    { icon: Users, label: "In triage", value: 6 },
  ];
  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h1 className="font-display text-2xl font-semibold md:text-3xl">{t("hospital.title")}</h1></div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(k => (
          <div key={k.label} className="rounded-2xl border border-border bg-card p-4">
            <k.icon className="h-4 w-4 text-primary" />
            <div className="mt-2 text-2xl font-display font-semibold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4 text-sm font-medium">Emergency queue</div>
        <ul className="divide-y divide-border">
          {(q.data ?? []).map(r => (
            <li key={r.id} className="flex items-start justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={(r.severity ?? "medium") as "low"|"medium"|"high"|"critical"} />
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
                </div>
                <div className="mt-1 text-sm">{r.symptoms?.slice(0,3).join(" · ") || "—"}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 max-w-xl">{r.ai_report ?? ""}</div>
              </div>
              <div className="text-right">
                <div className="text-xs capitalize text-muted-foreground">{r.status.replace(/_/g," ")}</div>
                <div className="mt-1 text-sm font-medium">{r.eta_minutes ?? "—"} min ETA</div>
              </div>
            </li>
          ))}
          {(!q.data || q.data.length === 0) && <li className="p-8 text-center text-sm text-muted-foreground">No emergencies in queue.</li>}
        </ul>
      </div>
    </AppShell>
  );
}