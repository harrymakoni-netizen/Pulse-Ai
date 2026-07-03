import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/lifeline/app-shell";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Siren, HeartPulse, Phone, Pill, Droplets, ShieldAlert, ArrowRight, MapPin, CalendarClock, User, ChevronRight } from "lucide-react";
import { SeverityBadge } from "@/components/lifeline/severity-badge";
import { EcgLoader } from "@/components/lifeline/ecg-loader";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · LifeLine+" }] }),
  component: Dashboard,
});

function Dashboard() {
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
      return { ...data, email: userData.user.email } as (typeof data & { email: string | undefined }) | null;
    },
  });
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => (await supabase.from("emergency_contacts").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const requests = useQuery({
    queryKey: ["requests"],
    queryFn: async () => (await supabase.from("emergency_requests").select("id,severity,status,created_at,location_label,eta_minutes").order("created_at", { ascending: false }).limit(6)).data ?? [],
  });

  const active = requests.data?.find((r) => !["completed","cancelled"].includes(r.status));

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Welcome back</div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">
            {profile.data?.full_name ?? profile.data?.email ?? "Patient"}
          </h1>
        </div>
        {active ? (
          <Link to="/emergency/$id" params={{ id: active.id }} className="rounded-2xl border border-[color:var(--alert)]/30 bg-[color:var(--alert)]/5 px-4 py-3 pr-3">
            <div className="flex items-center gap-3">
              <span className="pulse-alert h-3 w-3 rounded-full bg-[color:var(--alert)]" />
              <div>
                <div className="text-xs font-medium uppercase tracking-wider text-[color:var(--alert)]">Active emergency</div>
                <div className="text-sm">ETA {active.eta_minutes ?? "—"} min · view live status</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[color:var(--alert)]" />
            </div>
          </Link>
        ) : null}
      </div>

      {/* SOS card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="glass elevated relative overflow-hidden rounded-3xl border p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--alert)]/30 bg-[color:var(--alert)]/5 px-3 py-1 text-xs font-medium text-[color:var(--alert)]">
                <span className="pulse-alert h-2 w-2 rounded-full bg-[color:var(--alert)]" /> Emergency ready
              </div>
              <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">Need urgent help?</h2>
              <p className="mt-2 text-sm text-muted-foreground md:max-w-md">
                Press SOS to start AI triage, share your location, and dispatch the nearest ambulance.
              </p>
            </div>
            <Button asChild size="lg" className="h-20 w-full gap-3 bg-[color:var(--alert)] text-white hover:bg-[color:var(--alert)]/90 md:h-24 md:w-56">
              <Link to="/emergency/new">
                <Siren className="h-6 w-6" />
                <span className="font-display text-xl">SOS</span>
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Medical profile" icon={<User className="h-4 w-4" />} action={<Link to="/settings" className="text-xs text-primary hover:underline">Edit</Link>}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Blood type" value={profile.data?.blood_type ?? "—"} icon={<Droplets className="h-4 w-4 text-[color:var(--alert)]" />} />
              <Stat label="Allergies" value={profile.data?.allergies?.length ? `${profile.data.allergies.length} logged` : "None"} icon={<ShieldAlert className="h-4 w-4 text-amber-500" />} />
              <Stat label="Medications" value={profile.data?.medications?.length ? `${profile.data.medications.length} logged` : "None"} icon={<Pill className="h-4 w-4 text-primary" />} />
              <Stat label="Contacts" value={`${contacts.data?.length ?? 0}`} icon={<Phone className="h-4 w-4 text-[color:var(--emerald-brand)]" />} />
            </div>
          </Card>

          <Card title="Recent emergencies" icon={<HeartPulse className="h-4 w-4" />}>
            {requests.isLoading ? <EcgLoader label="Loading..." /> : requests.data?.length ? (
              <ul className="divide-y divide-border">
                {requests.data.map((r) => (
                  <li key={r.id}>
                    <Link to="/emergency/$id" params={{ id: r.id }} className="flex items-center justify-between gap-3 py-3 hover:bg-secondary/40 rounded-md px-2 -mx-2">
                      <div className="flex items-center gap-3">
                        <SeverityBadge severity={r.severity ?? "medium"} />
                        <div>
                          <div className="text-sm font-medium capitalize">{r.status.replace(/_/g, " ")}</div>
                          <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <Empty title="No emergencies yet" body="When you request help, it will show here with a live status timeline." />}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Emergency contacts" icon={<Phone className="h-4 w-4" />} action={<Link to="/settings" className="text-xs text-primary hover:underline">Manage</Link>}>
            {contacts.data?.length ? (
              <ul className="space-y-2">
                {contacts.data.slice(0, 3).map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.relation ?? "Contact"}</div>
                    </div>
                    <a href={`tel:${c.phone}`} className="text-sm text-primary">Call</a>
                  </li>
                ))}
              </ul>
            ) : <Empty title="Add contacts" body="Add family and next-of-kin who will be alerted." />}
          </Card>

          <Card title="Quick access" icon={<ArrowRight className="h-4 w-4" />}>
            <div className="space-y-2">
              <QuickLink to="/hospitals" icon={<MapPin className="h-4 w-4" />} label="Find hospitals near me" />
              <QuickLink to="/assistant" icon={<HeartPulse className="h-4 w-4" />} label="Ask the AI assistant" />
              <QuickLink to="/appointments" icon={<CalendarClock className="h-4 w-4" />} label="Upcoming appointments" />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Card({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">{icon}{title}</div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}
function QuickLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-secondary/50">
      <span className="flex items-center gap-2 text-sm">{icon}{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}