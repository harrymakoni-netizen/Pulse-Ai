import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { Ambulance, CheckCircle2, MapPin, Navigation, PlayCircle, Truck } from "lucide-react";
import { SeverityBadge } from "@/components/lifeline/severity-badge";
import { useT } from "@/i18n";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/ambulance")({
  head: () => ({ meta: [{ title: "Ambulance dispatch · LifeLine+" }] }),
  component: AmbulancePage,
});

type Status = "pending" | "accepted" | "enroute" | "arrived" | "completed";

const CASES = [
  { id: 1 as const, severity: "critical" as const, eta: 6, pickupLat: -17.8292, pickupLng: 31.0522, destLat: -17.8072, destLng: 31.0498 },
  { id: 2 as const, severity: "high" as const, eta: 12, pickupLat: -17.8380, pickupLng: 31.0459, destLat: -17.8195, destLng: 31.0355 },
  { id: 3 as const, severity: "medium" as const, eta: 18, pickupLat: -17.8199, pickupLng: 31.0447, destLat: -17.8149, destLng: 31.0431 },
];

function AmbulancePage() {
  const t = useT();
  const [statuses, setStatuses] = useState<Record<number, Status>>({ 1: "pending", 2: "pending", 3: "pending" });

  const next: Record<Status, Status | null> = {
    pending: "accepted",
    accepted: "enroute",
    enroute: "arrived",
    arrived: "completed",
    completed: null,
  };

  const advance = (id: 1 | 2 | 3, destLabel: string) => {
    const cur = statuses[id];
    const nxt = next[cur];
    if (!nxt) return;
    setStatuses((s) => ({ ...s, [id]: nxt }));
    const toastMap: Record<Status, string> = {
      pending: "amb.toast.accepted",
      accepted: "amb.toast.accepted",
      enroute: "amb.toast.enroute",
      arrived: "amb.toast.arrived",
      completed: "amb.toast.completed",
    };
    toast.success(t(toastMap[nxt], { dest: destLabel }));
  };

  const navigateTo = (c: (typeof CASES)[number], destLabel: string) => {
    toast.success(t("amb.toast.navigating", { dest: destLabel }));
    const url = `https://www.google.com/maps/dir/?api=1&origin=${c.pickupLat},${c.pickupLng}&destination=${c.destLat},${c.destLng}&travelmode=driving`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AppShell>
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <Ambulance className="h-4 w-4" /> {t("amb.eyebrow")}
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{t("amb.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("amb.sub")}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {CASES.map((c) => {
          const dest = t(`amb.case.${c.id}.dest`);
          const pickup = t(`amb.case.${c.id}.pickup`);
          const note = t(`amb.case.${c.id}.note`);
          const status = statuses[c.id];
          const nxt = next[status];
          const statusLabel = t(`amb.status.${status}`);
          const advanceLabel =
            status === "pending" ? t("amb.accept") :
            status === "accepted" ? t("amb.markEnroute") :
            status === "enroute" ? t("amb.markArrived") :
            status === "arrived" ? t("amb.markCompleted") : null;
          const StatusIcon = status === "completed" ? CheckCircle2 : status === "enroute" || status === "accepted" ? Truck : PlayCircle;
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 elevated">
              <div className="flex items-center justify-between">
                <SeverityBadge severity={c.severity} />
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  <StatusIcon className="h-3 w-3" /> {statusLabel}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {dest}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t("amb.pickup")}: {pickup}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t("dash.eta")} {c.eta} {t("dash.min")}</div>
              <p className="mt-3 text-sm text-muted-foreground">{note}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigateTo(c, dest)}
                  className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary flex items-center justify-center gap-1"
                >
                  <Navigation className="h-3 w-3" /> {t("amb.navigate")}
                </button>
                <button
                  disabled={!nxt}
                  onClick={() => advance(c.id, dest)}
                  className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                >
                  <PlayCircle className="h-3 w-3" /> {advanceLabel ?? statusLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}