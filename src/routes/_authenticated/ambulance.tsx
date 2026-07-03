import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { Ambulance, MapPin, Navigation, PlayCircle } from "lucide-react";
import { SeverityBadge } from "@/components/lifeline/severity-badge";

export const Route = createFileRoute("/_authenticated/ambulance")({
  head: () => ({ meta: [{ title: "Ambulance dispatch · LifeLine+" }] }),
  component: () => (
    <AppShell>
      <div className="mb-6 flex items-center gap-2"><Ambulance className="h-5 w-5 text-primary" /><h1 className="font-display text-2xl font-semibold md:text-3xl">Ambulance Dispatch</h1></div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { id: 1, severity: "critical" as const, dest: "Parirenyatwa · Cardiology", eta: 6, note: "Chest pain, radiating, sweating." },
          { id: 2, severity: "high" as const, dest: "Sally Mugabe · Trauma", eta: 12, note: "RTA, conscious, lower-limb fracture." },
          { id: 3, severity: "medium" as const, dest: "Avenues · General", eta: 18, note: "Abdominal pain, no red flags." },
        ].map(c => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
            <SeverityBadge severity={c.severity} />
            <div className="mt-3 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /> {c.dest}</div>
            <div className="mt-1 text-xs text-muted-foreground">ETA {c.eta} min</div>
            <p className="mt-3 text-sm text-muted-foreground">{c.note}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-md border border-border px-3 py-2 text-xs hover:bg-secondary flex items-center justify-center gap-1"><Navigation className="h-3 w-3" /> Navigate</button>
              <button className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1"><PlayCircle className="h-3 w-3" /> Accept</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  ),
});