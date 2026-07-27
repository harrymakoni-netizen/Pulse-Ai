import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/lifeline/app-shell";
import { advanceEmergency } from "@/lib/emergency.functions";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/lifeline/severity-badge";
import { EcgLoader } from "@/components/lifeline/ecg-loader";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Ambulance, ArrowLeft, CheckCircle2, Hospital, Timer, X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { enUS } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/emergency/$id")({
  head: () => ({ meta: [{ title: "Emergency status · LifeLine+" }] }),
  component: EmergencyDetail,
});

const FLOW = [
  "requested",
  "assessed",
  "hospital_notified",
  "dispatched",
  "en_route",
  "arrived",
  "transporting",
  "completed",
] as const;

function EmergencyDetail() {
  const { id } = useParams({ from: "/_authenticated/emergency/$id" });
  const qc = useQueryClient();
  const advanceFn = useServerFn(advanceEmergency);
  const { t } = useI18n();

  const req = useQuery({
    queryKey: ["emergency", id],
    queryFn: async () => {
      const [{ data: r }, { data: events }] = await Promise.all([
        supabase
          .from("emergency_requests")
          .select("*, hospital:hospitals(name,city,phone,address)")
          .eq("id", id)
          .single(),
        supabase.from("emergency_events").select("*").eq("request_id", id).order("created_at"),
      ]);
      return { request: r, events: events ?? [] };
    },
    refetchInterval: 5000,
  });

  const advance = useMutation({
    mutationFn: (
      status: "dispatched" | "en_route" | "arrived" | "transporting" | "completed" | "cancelled",
    ) => advanceFn({ data: { id, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["emergency", id] }),
  });

  // Auto-progress simulation for demo realism
  const [autoAt] = useState(() => Date.now());
  useEffect(() => {
    const r = req.data?.request;
    if (!r) return;
    const idx = FLOW.indexOf(r.status as (typeof FLOW)[number]);
    if (idx < 0 || idx >= FLOW.indexOf("completed")) return;
    const nextStatuses = [
      "dispatched",
      "en_route",
      "arrived",
      "transporting",
      "completed",
    ] as const;
    const currentIdx = nextStatuses.findIndex((s) => s === r.status);
    // if just hospital_notified -> dispatch after 4s
    const delay =
      r.status === "hospital_notified"
        ? 4000
        : r.status === "dispatched"
          ? 6000
          : r.status === "en_route"
            ? 10000
            : r.status === "arrived"
              ? 6000
              : r.status === "transporting"
                ? 8000
                : 0;
    if (delay === 0) return;
    const next = r.status === "hospital_notified" ? "dispatched" : nextStatuses[currentIdx + 1];
    if (!next) return;
    const t = setTimeout(() => {
      advance.mutate(next);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req.data?.request?.status]);

  if (req.isLoading || !req.data?.request) {
    return (
      <AppShell>
        <EcgLoader label={t("emergency.detail.loading")} />
      </AppShell>
    );
  }
  const r = req.data.request;
  const events = req.data.events;
  const isDone = r.status === "completed" || r.status === "cancelled";
  const statusLabel = (s: string) => t(`emergency.status.${s}`);

  return (
    <AppShell>
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> {t("emergency.detail.back")}
      </Link>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={
                r.status === "completed" || r.status === "cancelled"
                  ? "h-2 w-2 rounded-full bg-muted-foreground"
                  : "pulse-alert h-2 w-2 rounded-full bg-[color:var(--alert)]"
              }
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {statusLabel(r.status)}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold">
            {t("emergency.detail.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("emergency.detail.started", {
              when: formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: enUS }),
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SeverityBadge
            severity={(r.severity ?? "medium") as "low" | "medium" | "high" | "critical"}
          />
          {!isDone && (
            <Button variant="outline" size="sm" onClick={() => advance.mutate("cancelled")}>
              <X className="mr-1 h-4 w-4" /> {t("emergency.detail.cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Timeline */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-4 font-medium">{t("emergency.detail.timeline")}</h2>
            <ol className="space-y-4">
              {FLOW.map((step) => {
                const ev = events.find((e) => e.status === step);
                const done = !!ev;
                const isCurrent = r.status === step;
                return (
                  <li key={step} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${done ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"} ${isCurrent ? "pulse-calm" : ""}`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="mt-1 h-6 w-px bg-border last:hidden" />
                    </div>
                    <div>
                      <div className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>
                        {statusLabel(step)}
                      </div>
                      {ev ? (
                        <div className="text-xs text-muted-foreground">
                          {ev.note} ·{" "}
                          {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* AI report */}
          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> {t("emergency.detail.ai")}
            </div>
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-sm whitespace-pre-wrap">
              {r.ai_report ?? "..."}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <motion.div layout className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Ambulance className="h-4 w-4 text-primary" /> {t("emergency.detail.ambulance")}
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">
              {t("emergency.detail.eta", { min: String(r.eta_minutes ?? "-") })}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("emergency.detail.statusLabel")}: <span>{statusLabel(r.status)}</span>
            </div>
          </motion.div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Hospital className="h-4 w-4 text-primary" /> {t("emergency.detail.receiving")}
            </div>
            {r.hospital ? (
              <div className="mt-2 text-sm">
                <div className="font-medium">{r.hospital.name}</div>
                <div className="text-xs text-muted-foreground">{r.hospital.address}</div>
                <a
                  className="mt-2 inline-block text-xs text-primary"
                  href={`tel:${r.hospital.phone ?? ""}`}
                >
                  {r.hospital.phone}
                </a>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground mt-2">
                {t("emergency.detail.assigning")}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
              <Timer className="h-4 w-4" /> {t("emergency.detail.live")}
            </div>
            {t("emergency.detail.demo")}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
