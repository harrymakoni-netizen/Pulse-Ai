import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  BedDouble,
  Building2,
  Flame,
  MapPin,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_authenticated/ministry")({
  head: () => ({ meta: [{ title: "National Operations · Ministry of Health · LifeLine+" }] }),
  component: MinistryDashboard,
});

// -------- Mock national dataset (illustrative, deterministic) --------
const provinces = [
  { name: "Harare", active: 42, beds: 78, ambulances: 12, avgEta: 6.2, risk: "high" },
  { name: "Bulawayo", active: 28, beds: 64, ambulances: 9, avgEta: 7.8, risk: "medium" },
  { name: "Manicaland", active: 18, beds: 52, ambulances: 6, avgEta: 11.4, risk: "medium" },
  { name: "Mash. Central", active: 11, beds: 48, ambulances: 4, avgEta: 14.1, risk: "low" },
  { name: "Mash. East", active: 15, beds: 55, ambulances: 5, avgEta: 12.6, risk: "medium" },
  { name: "Mash. West", active: 13, beds: 51, ambulances: 5, avgEta: 13.2, risk: "low" },
  { name: "Midlands", active: 21, beds: 60, ambulances: 7, avgEta: 9.5, risk: "medium" },
  { name: "Masvingo", active: 16, beds: 58, ambulances: 6, avgEta: 10.7, risk: "medium" },
  { name: "Mat. North", active: 9, beds: 46, ambulances: 4, avgEta: 15.8, risk: "low" },
  { name: "Mat. South", active: 12, beds: 50, ambulances: 4, avgEta: 14.9, risk: "high" },
];

const trendData = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  emergencies: 120 + Math.round(Math.sin(i / 2) * 30) + i * 3,
  responded: 110 + Math.round(Math.sin(i / 2) * 28) + i * 3,
}));

const diseaseTrend = [
  { month: "Jan", respiratory: 82, cardiac: 41, trauma: 58, obstetric: 22 },
  { month: "Feb", respiratory: 74, cardiac: 45, trauma: 61, obstetric: 24 },
  { month: "Mar", respiratory: 88, cardiac: 39, trauma: 55, obstetric: 26 },
  { month: "Apr", respiratory: 96, cardiac: 44, trauma: 63, obstetric: 27 },
  { month: "May", respiratory: 112, cardiac: 47, trauma: 66, obstetric: 25 },
  { month: "Jun", respiratory: 128, cardiac: 51, trauma: 60, obstetric: 28 },
  { month: "Jul", respiratory: 141, cardiac: 49, trauma: 58, obstetric: 30 },
];

const severitySplit = [
  { key: "critical", value: 14, color: "#E11D48" },
  { key: "high", value: 27, color: "#F97316" },
  { key: "medium", value: 38, color: "#F59E0B" },
  { key: "low", value: 21, color: "#10B981" },
];

const aiInsights = [
  { id: 1 as const },
  { id: 2 as const },
  { id: 3 as const },
];

function MinistryDashboard() {
  const t = useT();
  const totalActive = provinces.reduce((s, p) => s + p.active, 0);
  const totalBeds = provinces.reduce((s, p) => s + p.beds, 0);
  const totalAmbulances = provinces.reduce((s, p) => s + p.ambulances, 0);
  const avgEta = (provinces.reduce((s, p) => s + p.avgEta, 0) / provinces.length).toFixed(1);

  const kpis = [
    { icon: Activity, label: "Active emergencies", value: totalActive, sub: "+8% vs 24h" },
    { icon: BedDouble, label: "Beds available", value: totalBeds, sub: "national capacity" },
    { icon: Ambulance, label: "Ambulances on duty", value: totalAmbulances, sub: "12 in transit" },
    { icon: Timer, label: "Avg response", value: `${avgEta} min`, sub: "national median" },
  ];

  return (
    <AppShell>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t("ministry.title")}
          </div>
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{t("ministry.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("ministry.sub")}</p>
      </motion.div>

      {/* KPIs */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl border p-4"
          >
            <k.icon className="h-4 w-4 text-primary" />
            <div className="mt-2 font-display text-2xl font-semibold">{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
            <div className="mt-1 text-xs text-[color:var(--emerald-brand)]">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Heat map / provinces */}
        <Panel
          className="lg:col-span-2"
          icon={<MapPin className="h-4 w-4" />}
          title="National emergency heat map"
          sub="Active emergencies by province"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {provinces.map((p) => {
              const intensity = Math.min(1, p.active / 45);
              const bg = `color-mix(in oklab, var(--alert) ${Math.round(intensity * 70)}%, transparent)`;
              return (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-border p-3 transition-colors hover:border-primary/40"
                  style={{ backgroundColor: bg }}
                >
                  <div>
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.ambulances} ambulances · {p.beds} beds · {p.avgEta} min ETA
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-semibold">{p.active}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">active</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Severity pie */}
        <Panel icon={<Flame className="h-4 w-4" />} title="Severity distribution" sub="Last 24 hours">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severitySplit}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {severitySplit.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Trend line */}
        <Panel
          className="lg:col-span-2"
          icon={<TrendingUp className="h-4 w-4" />}
          title="Emergencies over time"
          sub="14-day request vs response volume"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="req" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1565C0" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#1565C0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                <Area type="monotone" dataKey="emergencies" stroke="#1565C0" fill="url(#req)" strokeWidth={2} />
                <Area type="monotone" dataKey="responded" stroke="#10B981" fill="url(#resp)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Response bars */}
        <Panel icon={<Timer className="h-4 w-4" />} title="Avg response by province" sub="Minutes (lower is better)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinces} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                <Bar dataKey="avgEta" radius={[0, 6, 6, 0]}>
                  {provinces.map((p) => (
                    <Cell key={p.name} fill={p.avgEta > 12 ? "#E11D48" : p.avgEta > 9 ? "#F59E0B" : "#10B981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Disease trends */}
        <Panel
          className="lg:col-span-2"
          icon={<Activity className="h-4 w-4" />}
          title="Disease category trends"
          sub="Monthly incident counts by category"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diseaseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "var(--border)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="respiratory" stroke="#1565C0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cardiac" stroke="#E11D48" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="trauma" stroke="#F59E0B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="obstetric" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* AI Insights */}
        <Panel icon={<Sparkles className="h-4 w-4" />} title="AI operational insights" sub="Generated from live data">
          <ul className="space-y-3">
            {aiInsights.map((insight) => (
              <li key={insight.title} className="rounded-xl border border-border bg-background/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{insight.title}</div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                    {insight.tag}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{insight.body}</p>
              </li>
            ))}
          </ul>
        </Panel>

        {/* Fleet overview */}
        <Panel
          className="lg:col-span-3"
          icon={<Building2 className="h-4 w-4" />}
          title="Hospital capacity & fleet"
          sub="Live snapshot across national partners"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Parirenyatwa", beds: 28, occupancy: 82, incoming: 4 },
              { name: "Sally Mugabe", beds: 21, occupancy: 74, incoming: 3 },
              { name: "Mpilo", beds: 19, occupancy: 68, incoming: 2 },
              { name: "Chitungwiza", beds: 16, occupancy: 71, incoming: 3 },
              { name: "Mutare Prov.", beds: 12, occupancy: 63, incoming: 1 },
              { name: "Gweru Prov.", beds: 14, occupancy: 59, incoming: 2 },
              { name: "Masvingo Prov.", beds: 11, occupancy: 66, incoming: 1 },
              { name: "UBH", beds: 17, occupancy: 77, incoming: 2 },
            ].map((h) => (
              <div key={h.name} className="rounded-xl border border-border bg-background/50 p-3">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <div className="text-sm font-medium">{h.name}</div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div>
                    <div className="font-display text-lg font-semibold">{h.beds}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">beds free</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{h.incoming}</div>
                    <div className="text-[10px] uppercase text-muted-foreground">incoming</div>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${h.occupancy}%`,
                      background: h.occupancy > 80 ? "var(--alert)" : h.occupancy > 70 ? "#F59E0B" : "var(--emerald-brand)",
                    }}
                  />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{h.occupancy}% occupancy</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}

function Panel({
  icon,
  title,
  sub,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border border-border bg-card p-5 elevated ${className ?? ""}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <div className="text-sm font-medium">{title}</div>
          {sub ? <div className="text-xs text-muted-foreground">{sub}</div> : null}
        </div>
      </div>
      {children}
    </motion.section>
  );
}