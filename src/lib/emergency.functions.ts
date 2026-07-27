import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { callChat } from "./ai-gateway.server";

const AssessInput = z.object({
  symptoms: z.array(z.string()).default([]),
  symptomsText: z.string().optional().default(""),
  painLevel: z.number().min(0).max(10).optional(),
  age: z.number().optional(),
  medicalHistory: z.string().optional().default(""),
  language: z.enum(["en", "sn", "nd"]).default("en"),
  images: z
    .array(z.string().startsWith("data:"))
    .max(3)
    .optional()
    .default([]),
});

export type AiAssessment = {
  severity: "low" | "medium" | "high" | "critical";
  headline: string;
  summary: string;
  recommendedSpecialty: string;
  firstAid: string[];
  redFlags: string[];
  hospitalReport: string;
};

const langNames = { en: "English", sn: "Shona (chiShona)", nd: "Ndebele (isiNdebele)" } as const;

export const assessEmergency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AssessInput.parse(input))
  .handler(async ({ data }): Promise<AiAssessment> => {
    const system = `You are LifeLine+ AI Triage, a medical emergency triage assistant for Zimbabwe. You are calm, precise, and safety-first.
If the user attaches photos, examine them for visible bleeding, swelling, burns, rash, deformity, wound depth, discoloration, or other clinical signs and factor those observations into severity, firstAid, redFlags, and hospitalReport. If image quality is poor or the image is unrelated to the reported symptoms, note that briefly in the summary but still assess based on the text.
Return ONLY a valid JSON object matching this TypeScript type:
{
  "severity": "low" | "medium" | "high" | "critical",
  "headline": string,
  "summary": string,
  "recommendedSpecialty": string,
  "firstAid": string[],
  "redFlags": string[],
  "hospitalReport": string
}
User-facing fields language: ${langNames[data.language]}.
"hospitalReport" is always in English (clinical).
Severity rules: critical = airway/breathing compromise, severe bleed, unresponsive, stroke, active seizure, anaphylaxis; high = significant injury, pain 8-10, altered mental status; medium = pain 4-7, moderate injury; low = pain <=3.
Zimbabwe emergency number is 999 or 112. No markdown. Raw JSON only.`;

    const userMsg = `Symptoms tags: ${data.symptoms.join(", ") || "none"}
Free-text symptoms: ${data.symptomsText || "n/a"}
Pain level (0-10): ${data.painLevel ?? "n/a"}
Age: ${data.age ?? "n/a"}
Medical history: ${data.medicalHistory || "n/a"}`;

    const userContent = data.images.length
      ? [
          { type: "text" as const, text: userMsg },
          ...data.images.map((url) => ({ type: "image_url" as const, image_url: { url } })),
        ]
      : userMsg;

    const raw = await callChat({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      responseFormat: { type: "json_object" },
      temperature: 0.3,
    });

    let parsed: AiAssessment;
    try {
      parsed = JSON.parse(raw) as AiAssessment;
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid response");
      parsed = JSON.parse(match[0]) as AiAssessment;
    }
    return parsed;
  });

const CreateInput = z.object({
  symptoms: z.array(z.string()).default([]),
  symptomsText: z.string().optional(),
  painLevel: z.number().optional(),
  age: z.number().optional(),
  medicalHistory: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  locationLabel: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  aiSummary: z.any(),
  aiReport: z.string().optional(),
  hospitalId: z.string().uuid().optional(),
});

export const createEmergencyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("emergency_requests")
      .insert({
        patient_id: userId,
        symptoms: data.symptoms,
        symptoms_text: data.symptomsText,
        pain_level: data.painLevel,
        age: data.age,
        medical_history: data.medicalHistory,
        lat: data.lat,
        lng: data.lng,
        location_label: data.locationLabel,
        contact_name: data.contactName,
        contact_phone: data.contactPhone,
        severity: data.severity,
        ai_summary: data.aiSummary,
        ai_report: data.aiReport,
        hospital_id: data.hospitalId ?? null,
        status: data.hospitalId ? "hospital_notified" : "assessed",
        eta_minutes: Math.floor(6 + Math.random() * 14),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const events: Array<{ request_id: string; status: "requested" | "assessed" | "hospital_notified"; note: string }> = [
      { request_id: row.id, status: "requested", note: "Emergency requested by patient" },
      { request_id: row.id, status: "assessed", note: `AI triage complete: severity ${data.severity}` },
    ];
    if (data.hospitalId) events.push({ request_id: row.id, status: "hospital_notified", note: "Nearest hospital notified" });
    await supabase.from("emergency_events").insert(events);

    return { id: row.id as string };
  });

const AdvanceInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["dispatched", "en_route", "arrived", "transporting", "completed", "cancelled"]),
});
export const advanceEmergency = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AdvanceInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const noteMap: Record<string, string> = {
      dispatched: "Ambulance dispatched from nearest station",
      en_route: "Ambulance en route to your location",
      arrived: "Ambulance arrived on scene",
      transporting: "Transporting patient to hospital",
      completed: "Patient handed off to hospital care",
      cancelled: "Emergency cancelled by patient",
    };
    const { error: updErr } = await supabase
      .from("emergency_requests")
      .update({ status: data.status })
      .eq("id", data.id)
      .eq("patient_id", userId);
    if (updErr) throw new Error(updErr.message);
    await supabase.from("emergency_events").insert({ request_id: data.id, status: data.status, note: noteMap[data.status] });
    return { ok: true };
  });