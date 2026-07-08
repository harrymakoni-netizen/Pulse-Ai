import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/lifeline/app-shell";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderHeart, Plus, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useT } from "@/i18n";

const TYPES = [
  { key: "history", label: "History" },
  { key: "prescription", label: "Prescriptions" },
  { key: "vaccination", label: "Vaccinations" },
  { key: "lab", label: "Lab Results" },
  { key: "radiology", label: "Radiology" },
  { key: "insurance", label: "Insurance" },
];

export const Route = createFileRoute("/_authenticated/records")({
  head: () => ({ meta: [{ title: "Medical Records · LifeLine+" }] }),
  component: RecordsPage,
});

function RecordsPage() {
  const t = useT();
  const qc = useQueryClient();
  const [tab, setTab] = useState("history");
  const records = useQuery({
    queryKey: ["records"],
    queryFn: async () => (await supabase.from("medical_records").select("*").order("record_date", { ascending: false })).data ?? [],
  });
  const [title, setTitle] = useState(""); const [notes, setNotes] = useState("");
  const add = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("medical_records").insert({
        user_id: userData.user.id, record_type: tab, title, details: { notes },
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Record added"); setTitle(""); setNotes(""); qc.invalidateQueries({ queryKey: ["records"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const filtered = (records.data ?? []).filter(r => r.record_type === tab);

  return (
    <AppShell>
      <div className="mb-6 flex items-center gap-2 text-primary"><FolderHeart className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-widest">{t("records.title")}</span></div>
      <h1 className="mb-6 font-display text-2xl font-semibold md:text-3xl">{t("records.title")}</h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap">
          {TYPES.map(t => <TabsTrigger key={t.key} value={t.key}>{t.label}</TabsTrigger>)}
        </TabsList>
        {TYPES.map(t => (
          <TabsContent key={t.key} value={t.key}>
            <div className="grid gap-6 md:grid-cols-[1fr_320px] mt-4">
              <div className="space-y-3">
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No {t.label.toLowerCase()} yet.</div>
                ) : filtered.map(r => (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.record_date ? format(new Date(r.record_date), "PP") : ""}</div>
                      </div>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    {(r.details && typeof r.details === "object" && "notes" in (r.details as object)) ? (
                      <p className="mt-2 text-sm text-muted-foreground">{(r.details as { notes: string }).notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium"><Plus className="h-4 w-4" /> Add {t.label.slice(0,-1).toLowerCase()}</div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ttl">Title</Label>
                    <Input id="ttl" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Annual physical" />
                  </div>
                  <div>
                    <Label htmlFor="nts">Notes</Label>
                    <Textarea id="nts" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={() => add.mutate()} disabled={!title || add.isPending}>Save record</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}