import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { Shield, TrendingUp, Users, Ambulance, Timer } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · LifeLine+" }] }),
  component: AdminPage,
});

function AdminPage() {
  const t = useT();
  const responseTimes = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    minutes: Math.round(10 + Math.random() * 6),
  }));
  const byRegion = [
    { region: "Harare", emergencies: 421 },
    { region: "Bulawayo", emergencies: 267 },
    { region: "Mutare", emergencies: 138 },
    { region: "Gweru", emergencies: 92 },
    { region: "Masvingo", emergencies: 71 },
    { region: "Vic Falls", emergencies: 38 },
  ];
  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="font-display text-2xl font-semibold md:text-3xl">{t("admin.title")}</h1>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<TrendingUp className="h-4 w-4 text-primary" />}
          value="1,027"
          label="Emergencies (30d)"
        />
        <Kpi
          icon={<Timer className="h-4 w-4 text-primary" />}
          value="8.4 min"
          label="Avg response"
        />
        <Kpi
          icon={<Ambulance className="h-4 w-4 text-primary" />}
          value="82%"
          label="Ambulance utilisation"
        />
        <Kpi
          icon={<Users className="h-4 w-4 text-primary" />}
          value="14,382"
          label="Registered users"
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 text-sm font-medium">Average response time (min)</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="var(--medical)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 text-sm font-medium">Emergencies by region</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="region" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="emergencies" fill="var(--emerald-brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      {icon}
      <div className="mt-2 text-2xl font-display font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
