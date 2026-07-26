import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Shield } from "lucide-react";
import { useI18n, useT } from "@/i18n";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · LifeLine+" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const t = useT();
  const { lang: appLang, setLang: setAppLang } = useI18n();
  const qc = useQueryClient();
  const profile = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", userData.user.id).maybeSingle();
      return data;
    },
  });
  const contacts = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => (await supabase.from("emergency_contacts").select("*").order("created_at")).data ?? [],
  });

  const [fullName, setFullName] = useState(""); const [phone, setPhone] = useState(""); const [blood, setBlood] = useState("");
  const [allergies, setAllergies] = useState(""); const [meds, setMeds] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (profile.data) {
      const displayName = typeof window !== "undefined" ? window.localStorage.getItem("lifeline.displayName") : null;
      setFullName(profile.data.full_name || displayName || "");
      setPhone(profile.data.phone ?? ""); setBlood(profile.data.blood_type ?? "");
      setAllergies((profile.data.allergies ?? []).join(", ")); setMeds((profile.data.medications ?? []).join(", "));
    }
  }, [profile.data]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("profiles").update({
        full_name: fullName, phone, blood_type: blood,
        allergies: allergies.split(",").map(s => s.trim()).filter(Boolean),
        medications: meds.split(",").map(s => s.trim()).filter(Boolean),
        language: appLang,
      }).eq("id", userData.user.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(t("common.save")); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : t("auth.toast.fail")),
  });

  const [cName, setCName] = useState(""); const [cRel, setCRel] = useState(""); const [cPhone, setCPhone] = useState("");
  const addContact = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("emergency_contacts").insert({ user_id: userData.user.id, name: cName, relation: cRel, phone: cPhone });
      if (error) throw error;
    },
    onSuccess: () => { setCName(""); setCRel(""); setCPhone(""); qc.invalidateQueries({ queryKey: ["contacts"] }); toast.success("Contact added"); },
  });
  const delContact = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("emergency_contacts").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] }),
  });

  return (
    <AppShell>
      <h1 className="mb-6 font-display text-2xl font-semibold md:text-3xl">{t("settings.title")}</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-medium">{t("settings.medical")}</h2>
          <div className="grid gap-3">
            <div><Label>{t("auth.fullName")}</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
            <div><Label>{t("auth.phone")}</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>{t("dash.bloodType")}</Label><Input value={blood} onChange={(e) => setBlood(e.target.value)} placeholder="O+" /></div>
              <div>
                <Label>{t("settings.language")}</Label>
                <div className="mt-1.5 flex gap-1">
                  {(["en","sn","nd"] as const).map(l => (
                    <button key={l} type="button" onClick={() => setAppLang(l)} className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${appLang === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{l.toUpperCase()}</button>
                  ))}
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">{t("settings.language.sub")}</p>
              </div>
            </div>
            <div><Label>{t("dash.allergies")}</Label><Textarea rows={2} value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="Penicillin, peanuts" /></div>
            <div><Label>{t("dash.meds")}</Label><Textarea rows={2} value={meds} onChange={(e) => setMeds(e.target.value)} placeholder="Metformin, Amlodipine" /></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>{t("common.save")}</Button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 font-medium">{t("settings.contacts")}</h2>
          <ul className="space-y-2">
            {contacts.data?.map(c => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.relation} · {c.phone}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => delContact.mutate(c.id)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Input placeholder="Name" value={cName} onChange={(e) => setCName(e.target.value)} />
            <Input placeholder="Relation" value={cRel} onChange={(e) => setCRel(e.target.value)} />
            <Input placeholder="Phone" value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
          </div>
          <Button className="mt-2 w-full" variant="outline" onClick={() => addContact.mutate()} disabled={!cName || !cPhone}><Plus className="mr-1 h-4 w-4" /> Add contact</Button>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-medium">Preferences & security</h2>
          <div className="space-y-4">
            <Row label="Dark mode" desc="Softer palette for low-light environments"><Switch checked={darkMode} onCheckedChange={setDarkMode} /></Row>
            <Row label="Push notifications" desc="Emergency alerts and hospital acceptance"><Switch defaultChecked /></Row>
            <Row label="SMS fallback" desc="Send SMS when data is unavailable"><Switch defaultChecked /></Row>
            <Row label="Two-factor authentication" desc="Coming soon — extra layer for your account"><Button variant="outline" size="sm" disabled><Shield className="mr-1 h-4 w-4" /> Set up</Button></Row>
            <Row label="Delete account" desc="Permanently remove your LifeLine+ account and data"><Button variant="destructive" size="sm" disabled>Delete</Button></Row>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div><div className="text-sm font-medium">{label}</div>{desc && <div className="text-xs text-muted-foreground">{desc}</div>}</div>
      {children}
    </div>
  );
}