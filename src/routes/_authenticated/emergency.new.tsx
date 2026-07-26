import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/lifeline/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { HeartPulse, MapPin, ShieldAlert, Sparkles, Hospital, Loader2, Check, ChevronRight } from "lucide-react";
import { SeverityBadge } from "@/components/lifeline/severity-badge";
import { EcgLoader } from "@/components/lifeline/ecg-loader";
import { listHospitals } from "@/lib/hospitals.functions";
import { assessEmergency, createEmergencyRequest, type AiAssessment } from "@/lib/emergency.functions";
import { useServerFn as tanUseServerFn } from "@tanstack/react-start";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_authenticated/emergency/new")({
  head: () => ({ meta: [{ title: "SOS · LifeLine+" }] }),
  component: NewEmergency,
});

const SYMPTOM_TAGS: Array<{ id: string; key: string }> = [
  { id: "Chest pain", key: "emerg.sym.chestPain" },
  { id: "Shortness of breath", key: "emerg.sym.shortness" },
  { id: "Severe bleeding", key: "emerg.sym.bleeding" },
  { id: "Head injury", key: "emerg.sym.head" },
  { id: "Unconscious", key: "emerg.sym.unconscious" },
  { id: "Broken bone", key: "emerg.sym.broken" },
  { id: "Severe burn", key: "emerg.sym.burn" },
  { id: "Seizure", key: "emerg.sym.seizure" },
  { id: "Allergic reaction", key: "emerg.sym.allergy" },
  { id: "Stroke signs", key: "emerg.sym.stroke" },
  { id: "Abdominal pain", key: "emerg.sym.abdominal" },
  { id: "Pregnancy", key: "emerg.sym.pregnancy" },
  { id: "High fever", key: "emerg.sym.fever" },
  { id: "Poisoning", key: "emerg.sym.poisoning" },
  { id: "Vomiting", key: "emerg.sym.vomiting" },
  { id: "Difficulty breathing", key: "emerg.sym.difficulty" },
];

type Step = 1 | 2 | 3 | 4 | 5;

function NewEmergency() {
  const t = useT();
  const [step, setStep] = useState<Step>(1);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomsText, setSymptomsText] = useState("");
  const [painLevel, setPainLevel] = useState(5);
  const [age, setAge] = useState<number | "">("");
  const [history, setHistory] = useState("");
  const [coords, setCoords] = useState<{ lat?: number; lng?: number; label?: string }>({});
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [language, setLanguage] = useState<"en"|"sn"|"nd">("en");
  const [assessment, setAssessment] = useState<AiAssessment | null>(null);
  const navigate = useNavigate();

  const hospitals = useQuery({ queryKey: ["hospitals"], queryFn: () => listHospitals() });
  const assessFn = tanUseServerFn(assessEmergency);
  const createFn = tanUseServerFn(createEmergencyRequest);

  const assess = useMutation({
    mutationFn: async () => {
      const payload = {
        symptoms, symptomsText, painLevel, age: typeof age === "number" ? age : undefined, medicalHistory: history, language,
      };
      let lastErr: unknown;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          return await assessFn({ data: payload });
        } catch (e) {
          lastErr = e;
          const msg = e instanceof Error ? e.message : String(e);
          // Only retry transient network errors (Safari says "Load failed", others "Failed to fetch")
          if (!/load failed|failed to fetch|network|timeout/i.test(msg)) throw e;
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        }
      }
      throw lastErr instanceof Error ? lastErr : new Error("Network error");
    },
    onSuccess: (data) => { setAssessment(data); setStep(5); },
    onError: (e) => {
      const msg = e instanceof Error ? e.message : "";
      const friendly = /load failed|failed to fetch|network|timeout/i.test(msg)
        ? t("emerg.new.toastNetwork")
        : msg || t("emerg.new.toastFail");
      toast.error(friendly);
      setStep(3);
    },
  });

  const submit = useMutation({
    mutationFn: async (hospitalId: string) => {
      if (!assessment) throw new Error("Missing assessment");
      return await createFn({ data: {
        symptoms, symptomsText, painLevel, age: typeof age === "number" ? age : undefined, medicalHistory: history,
        lat: coords.lat, lng: coords.lng, locationLabel: coords.label,
        contactName, contactPhone,
        severity: assessment.severity, aiSummary: assessment, aiReport: assessment.hospitalReport, hospitalId,
      }});
    },
    onSuccess: ({ id }) => { toast.success(t("emerg.new.toastConfirmed")); navigate({ to: "/emergency/$id", params: { id } }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("emerg.new.toastCreateFail")),
  });

  // Auto-fill contact + geolocation on step 3
  useEffect(() => {
    if (step === 3 && !coords.lat) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "My current location" }),
        () => {},
        { timeout: 8000, enableHighAccuracy: true }
      );
    }
  }, [step, coords.lat]);

  // Pull default contact
  useEffect(() => {
    supabase.from("emergency_contacts").select("name,phone").limit(1).maybeSingle().then(({ data }) => {
      if (data && !contactName) { setContactName(data.name); setContactPhone(data.phone); }
    });
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata as { full_name?: string } | undefined;
      if (meta?.full_name && !contactName) setContactName(meta.full_name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommended = useMemo(() => {
    if (!hospitals.data || !coords.lat || !coords.lng) return hospitals.data?.slice(0, 3) ?? [];
    const scored = hospitals.data.map((h) => {
      const d = haversine(coords.lat!, coords.lng!, h.lat, h.lng);
      const specMatch = assessment?.recommendedSpecialty && h.specialties.some(s => s.toLowerCase().includes(assessment.recommendedSpecialty.toLowerCase().split(" ")[0])) ? -8 : 0;
      const emergencyBoost = h.has_emergency ? -3 : 0;
      const beds = h.available_beds > 0 ? -2 : 4;
      return { ...h, distanceKm: d, score: d + specMatch + emergencyBoost + beds };
    }).sort((a,b) => a.score - b.score);
    return scored.slice(0, 3);
  }, [hospitals.data, coords, assessment]);

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <span className="pulse-alert h-3 w-3 rounded-full bg-[color:var(--alert)]" />
          <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--alert)]">{t("emerg.new.eyebrow")}</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold">{t("emerg.new.heading")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("emerg.new.step", { n: String(step), total: "5" })}</p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(step/5)*100}%` }} />
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
        {step === 1 && (
          <StepWrap title={t("emerg.new.happening")} icon={<HeartPulse className="h-5 w-5" />}>
            <div className="mb-4 flex flex-wrap gap-2">
              {SYMPTOM_TAGS.map((s) => (
                <button key={s.id} onClick={() => setSymptoms((prev) => prev.includes(s.id) ? prev.filter(x=>x!==s.id) : [...prev, s.id])}
                  className={`rounded-full border px-3 py-1.5 text-xs ${symptoms.includes(s.id) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                  {t(s.key)}
                </button>
              ))}
            </div>
            <Label htmlFor="txt">{t("emerg.new.describe")}</Label>
            <Textarea id="txt" rows={4} placeholder={t("emerg.new.describePh")} value={symptomsText} onChange={(e) => setSymptomsText(e.target.value)} className="mt-1.5" />
            <Footer t={t} next={() => setStep(2)} nextDisabled={symptoms.length === 0 && !symptomsText.trim()} />
          </StepWrap>
        )}

        {step === 2 && (
          <StepWrap title={t("emerg.new.severity")} icon={<ShieldAlert className="h-5 w-5" />}>
            <Label>{t("emerg.new.pain")} <span className="ml-2 text-lg font-semibold">{painLevel}/10</span></Label>
            <Slider min={0} max={10} step={1} value={[painLevel]} onValueChange={(v) => setPainLevel(v[0] ?? 0)} className="mt-4" />
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div>
                <Label htmlFor="age">{t("emerg.new.age")}</Label>
                <Input id="age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("emerg.new.agePh")} />
              </div>
            </div>
            <div className="mt-3">
              <Label htmlFor="hist">{t("emerg.new.history")}</Label>
              <Textarea id="hist" rows={3} placeholder={t("emerg.new.historyPh")} value={history} onChange={(e) => setHistory(e.target.value)} />
            </div>
            <Footer t={t} back={() => setStep(1)} next={() => setStep(3)} />
          </StepWrap>
        )}

        {step === 3 && (
          <StepWrap title={t("emerg.new.where")} icon={<MapPin className="h-5 w-5" />}>
            <p className="text-sm text-muted-foreground">{t("emerg.new.whereBody")}</p>
            <div className="mt-4 rounded-xl border border-border p-4">
              {coords.lat ? (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[color:var(--emerald-brand)]/15 text-[color:var(--emerald-brand)] flex items-center justify-center"><Check className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-medium">{t("emerg.new.captured")}</div>
                    <div className="text-xs text-muted-foreground">{coords.lat.toFixed(4)}, {coords.lng?.toFixed(4)}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <div className="text-sm text-muted-foreground">{t("emerg.new.waitingGps")}</div>
                </div>
              )}
              <div className="mt-3">
                <Label htmlFor="label">{t("emerg.new.orDescribe")}</Label>
                <Input id="label" placeholder={t("emerg.new.locPh")} value={coords.label ?? ""} onChange={(e) => setCoords((c) => ({ ...c, label: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cn">{t("emerg.new.contactName")}</Label>
                <Input id="cn" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cp">{t("emerg.new.contactPhone")}</Label>
                <Input id="cp" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
            </div>
            <Footer t={t} back={() => setStep(2)} next={() => { setStep(4); assess.mutate(); }} nextLabel={t("emerg.new.runTriage")} />
          </StepWrap>
        )}

        {step === 4 && (
          <StepWrap title={t("emerg.new.assessing")} icon={<Sparkles className="h-5 w-5" />}>
            {assess.isPending || !assessment ? (
              <div className="py-10">
                <EcgLoader label={t("emerg.new.analyzing")} />
              </div>
            ) : null}
          </StepWrap>
        )}

        {step === 5 && assessment && (
          <StepWrap title={t("emerg.new.complete")} icon={<Sparkles className="h-5 w-5" />}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4">
              <div className="rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <SeverityBadge severity={assessment.severity} />
                  <span className="text-xs text-muted-foreground">{assessment.recommendedSpecialty}</span>
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold">{assessment.headline}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{assessment.summary}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-border bg-secondary/30 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t("emerg.new.doNow")}</div>
                  <ul className="space-y-1.5 text-sm">
                    {assessment.firstAid.map((f, i) => (<li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />{f}</li>))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[color:var(--alert)]/30 bg-[color:var(--alert)]/5 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase text-[color:var(--alert)]">{t("emerg.new.redFlags")}</div>
                  <ul className="space-y-1.5 text-sm">
                    {assessment.redFlags.map((f, i) => (<li key={i} className="flex gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--alert)]" />{f}</li>))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Hospital className="h-4 w-4 text-primary" /> {t("emerg.new.recommended")}</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {recommended.map((h) => (
                    <button key={h.id} onClick={() => submit.mutate(h.id)} disabled={submit.isPending}
                      className="text-left rounded-xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition">
                      <div className="text-sm font-semibold">{h.name}</div>
                      <div className="text-xs text-muted-foreground">{h.city}{"distanceKm" in h && (h as { distanceKm?: number }).distanceKm !== undefined ? ` · ${((h as { distanceKm: number }).distanceKm).toFixed(1)} km` : ""}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {h.specialties.slice(0,3).map(s => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{s}</span>)}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className={h.available_beds > 0 ? "text-[color:var(--emerald-brand)]" : "text-muted-foreground"}>{t("emerg.new.bedsAvailable", { n: String(h.available_beds) })}</span>
                        <span className="text-primary inline-flex items-center gap-1">{t("emerg.new.confirm")} <ChevronRight className="h-3 w-3" /></span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </StepWrap>
        )}
      </div>
    </AppShell>
  );
}

function StepWrap({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-primary">{icon}<span className="text-sm font-medium">{title}</span></div>
      {children}
    </div>
  );
}
function Footer({ t, back, next, nextDisabled, nextLabel }: { t: (k: string) => string; back?: () => void; next?: () => void; nextDisabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-6 flex justify-between">
      {back ? <Button variant="ghost" onClick={back}>{t("emerg.new.back")}</Button> : <span />}
      {next ? <Button onClick={next} disabled={nextDisabled}>{nextLabel ?? t("emerg.new.continue")}</Button> : null}
    </div>
  );
}
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; const dLat = ((lat2-lat1)*Math.PI)/180; const dLon = ((lon2-lon1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
