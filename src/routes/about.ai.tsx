import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import {
  Brain,
  Database,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export const Route = createFileRoute("/about/ai")({
  head: () => ({
    meta: [
      { title: "Why AI? · LifeLine+" },
      {
        name: "description",
        content:
          "How LifeLine+ uses AI for emergency triage in Zimbabwe, why a rules-only system is not enough, and the guardrails around every model call.",
      },
      { property: "og:title", content: "Why AI? · LifeLine+" },
      {
        property: "og:description",
        content:
          "Multimodal, multilingual triage that a SQL query cannot deliver - and the safety rails around it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutAi,
});

function AboutAi() {
  const t = useT();
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
          <LifeLineLogo />
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.backHome")}
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 md:px-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI justification
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Why AI, and not just a form?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          LifeLine+ is submitted under the AI4I Development track. The Challenge explicitly
          penalises "AI as a label". This page documents where AI is doing real work and where
          simpler logic is deliberately used instead.
        </p>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">The three problems AI solves here</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card
              icon={<Layers className="h-5 w-5" />}
              title="Multimodal severity"
              body="A patient can upload a photo of a wound or a short video. A rules engine cannot judge if a burn is second- or third-degree; Gemini vision can, and it feeds that observation into the severity score."
            />
            <Card
              icon={<Brain className="h-5 w-5" />}
              title="Free-text symptoms"
              body="Patients describe symptoms in English, Shona and Ndebele, often mixing languages. Keyword matching misses 'inhliziyo iyaphimisela' but the model reads intent, negation and colloquialisms."
            />
            <Card
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Structured handoff"
              body="Hospitals receive a clinical summary, red flags and recommended specialty in English, generated from the patient's local-language description. That translation-plus-summarisation task is what LLMs do best."
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">
            Rules-only vs LifeLine+ (side by side)
          </h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Task</th>
                  <th className="px-4 py-3 font-semibold">Rules / SQL baseline</th>
                  <th className="px-4 py-3 font-semibold">LifeLine+ with AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ROWS.map((r) => (
                  <tr key={r.task}>
                    <td className="px-4 py-3 font-medium">{r.task}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--alert)]" />
                        <span>{r.baseline}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
                        <span>{r.ai}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">Where we deliberately do NOT use AI</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
              <span>
                <strong className="text-foreground">Hospital ranking</strong> is a scored SQL query
                over haversine distance, specialty match and bed availability - no model needed.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
              <span>
                <strong className="text-foreground">Status transitions</strong> (dispatched,
                en_route, arrived) are a plain state machine.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
              <span>
                <strong className="text-foreground">Offline fallback triage</strong> is rule-based
                on-device, so a patient still gets a severity band when the AI Gateway is
                unreachable.
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Database className="h-4 w-4" /> Model &amp; data
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold">Model</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Google Gemini 3.6 Flash via the Lovable AI Gateway. Chosen for native vision, sub-2s
                latency and multilingual coverage of Bantu languages. Temperature 0.3 with a strict
                JSON schema to constrain output.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold">Data used at inference</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Only the current SOS payload: selected symptom tags, free-text description, pain
                score, age, optional photos/video frames. No training on patient data, no PII shared
                beyond the active request.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 flex justify-center">
          <Link to="/">
            <Button size="lg">Back to LifeLine+</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

const ROWS: Array<{ task: string; baseline: string; ai: string }> = [
  {
    task: "Assess a wound from a photo",
    baseline: "Impossible - no visual understanding.",
    ai: "Gemini vision reads bleeding, swelling, depth and colour into the severity score.",
  },
  {
    task: "Understand Shona/Ndebele free text",
    baseline: "Requires per-phrase keyword lists that break on typos or code-switching.",
    ai: "Handles negation, mixed languages and colloquialisms out of the box.",
  },
  {
    task: "Generate a clinical hospital handoff",
    baseline: "Templated string with slot-filling - no reasoning about what the ED needs to know.",
    ai: "Structured English report with red flags and specialty, ready for the receiving team.",
  },
  {
    task: "Real-time first-aid guidance",
    baseline: "Static decision tree, hard to keep current across every symptom combination.",
    ai: "Instructions tailored to the exact reported symptoms and history in the patient's language.",
  },
];

function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}