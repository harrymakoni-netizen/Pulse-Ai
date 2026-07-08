import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/lifeline/app-shell";
import { listHospitals } from "@/lib/hospitals.functions";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Phone, BedDouble, Star, HeartPulse } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { EcgLoader } from "@/components/lifeline/ecg-loader";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_authenticated/hospitals")({
  head: () => ({ meta: [{ title: "Hospitals · LifeLine+" }] }),
  component: HospitalsPage,
});

function HospitalsPage() {
  const t = useT();
  const hospitals = useQuery({ queryKey: ["hospitals"], queryFn: () => listHospitals() });
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [maxKm, setMaxKm] = useState(200);
  const [onlyER, setOnlyER] = useState(false);
  const [minBeds, setMinBeds] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLoc({ lat: -17.8252, lng: 31.0335 }), // Harare fallback
      { timeout: 6000 }
    );
  }, []);

  const list = useMemo(() => {
    const base = hospitals.data ?? [];
    return base
      .map((h) => ({ ...h, distanceKm: loc ? haversine(loc.lat, loc.lng, h.lat, h.lng) : null }))
      .filter((h) => (!onlyER || h.has_emergency) && h.available_beds >= minBeds && (h.distanceKm === null || h.distanceKm <= maxKm) && (q === "" || h.name.toLowerCase().includes(q.toLowerCase()) || h.city.toLowerCase().includes(q.toLowerCase())))
      .sort((a,b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
  }, [hospitals.data, loc, maxKm, onlyER, minBeds, q]);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold md:text-3xl">{t("hosp.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("hosp.sub")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div>
            <Label>{t("hosp.search")}</Label>
            <Input placeholder={t("hosp.searchPh")} value={q} onChange={(e) => setQ(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>{t("hosp.maxDistance")}: {maxKm} km</Label>
            <Slider min={5} max={500} step={5} value={[maxKm]} onValueChange={(v) => setMaxKm(v[0] ?? 200)} className="mt-3" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="er">{t("hosp.emergencyCapable")}</Label>
            <Switch id="er" checked={onlyER} onCheckedChange={setOnlyER} />
          </div>
          <div>
            <Label>{t("hosp.minBeds")}: {minBeds}</Label>
            <Slider min={0} max={100} step={5} value={[minBeds]} onValueChange={(v) => setMinBeds(v[0] ?? 0)} className="mt-3" />
          </div>
        </aside>

        <div className="space-y-4">
          <HospitalMap items={list} center={loc} />
          {hospitals.isLoading ? <EcgLoader label={t("hosp.loading")} /> : (
            <ul className="grid gap-3 md:grid-cols-2">
              {list.map((h) => (
                <li key={h.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{h.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.city}{h.distanceKm !== null ? ` · ${h.distanceKm.toFixed(1)} km` : ""}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-500"><Star className="h-3 w-3 fill-current" /> {h.rating}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {h.specialties.slice(0,4).map(s => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{s}</span>)}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><BedDouble className="h-3 w-3" /> {h.available_beds}/{h.total_beds} {t("hosp.beds")}</span>
                    {h.has_emergency && <span className="inline-flex items-center gap-1 text-[color:var(--alert)]"><HeartPulse className="h-3 w-3" /> ER</span>}
                    {h.phone && <a className="text-primary flex items-center gap-1" href={`tel:${h.phone}`}><Phone className="h-3 w-3" /> {t("common.call")}</a>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; const dLat = ((lat2-lat1)*Math.PI)/180; const dLon = ((lon2-lon1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

// Client-only map (Leaflet uses window)
import { lazy, Suspense } from "react";
const LeafletMap = lazy(() => import("@/components/lifeline/hospital-map"));
function HospitalMap({ items, center }: { items: Array<{ id: string; name: string; lat: number; lng: number; city: string; has_emergency: boolean; available_beds: number }>; center: { lat: number; lng: number } | null }) {
  const t = useT();
  return (
    <div className="h-72 overflow-hidden rounded-2xl border border-border md:h-96">
      <Suspense fallback={<EcgLoader label={t("hosp.mapLoading")} />}>
        <LeafletMap items={items} center={center} />
      </Suspense>
    </div>
  );
}