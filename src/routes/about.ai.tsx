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
  Workflow,
  ScanEye,
  MessageSquareText,
  Stethoscope,
  MapPin,
  FileText,
  Lock,
  WifiOff,
  ServerOff,
  Activity,
  ArrowRight,
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
      { property: "og:url", content: "https://www.lifelineai.co.zw/about/ai" },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/5a0ecc2f-e750-4a58-b4d1-3322caa88a1c",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/5a0ecc2f-e750-4a58-b4d1-3322caa88a1c",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.lifelineai.co.zw/about/ai" }],
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
          {t("aboutAi.eyebrow")}
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {t("aboutAi.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {t("aboutAi.subtitle")}
        </p>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">
            {t("aboutAi.problems.title")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card
              icon={<Layers className="h-5 w-5" />}
              title={t("aboutAi.problems.1.title")}
              body={t("aboutAi.problems.1.body")}
            />
            <Card
              icon={<Brain className="h-5 w-5" />}
              title={t("aboutAi.problems.2.title")}
              body={t("aboutAi.problems.2.body")}
            />
            <Card
              icon={<ShieldCheck className="h-5 w-5" />}
              title={t("aboutAi.problems.3.title")}
              body={t("aboutAi.problems.3.body")}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">
            {t("aboutAi.pipeline.title")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Step
              n={1}
              icon={<MessageSquareText className="h-4 w-4" />}
              title={t("aboutAi.pipeline.1.title")}
              body={t("aboutAi.pipeline.1.body")}
            />
            <Step
              n={2}
              icon={<ScanEye className="h-4 w-4" />}
              title={t("aboutAi.pipeline.2.title")}
              body={t("aboutAi.pipeline.2.body")}
            />
            <Step
              n={3}
              icon={<Stethoscope className="h-4 w-4" />}
              title={t("aboutAi.pipeline.3.title")}
              body={t("aboutAi.pipeline.3.body")}
            />
            <Step
              n={4}
              icon={<MapPin className="h-4 w-4" />}
              title={t("aboutAi.pipeline.4.title")}
              body={t("aboutAi.pipeline.4.body")}
            />
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">{t("aboutAi.pipeline.5.title")}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("aboutAi.pipeline.5.body")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">
            {t("aboutAi.compare.title")}
          </h2>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("aboutAi.compare.task")}</th>
                  <th className="px-4 py-3 font-semibold">{t("aboutAi.compare.baseline")}</th>
                  <th className="px-4 py-3 font-semibold">{t("aboutAi.compare.ai")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    task: t("aboutAi.compare.rows.1.task"),
                    baseline: t("aboutAi.compare.rows.1.baseline"),
                    ai: t("aboutAi.compare.rows.1.ai"),
                  },
                  {
                    task: t("aboutAi.compare.rows.2.task"),
                    baseline: t("aboutAi.compare.rows.2.baseline"),
                    ai: t("aboutAi.compare.rows.2.ai"),
                  },
                  {
                    task: t("aboutAi.compare.rows.3.task"),
                    baseline: t("aboutAi.compare.rows.3.baseline"),
                    ai: t("aboutAi.compare.rows.3.ai"),
                  },
                  {
                    task: t("aboutAi.compare.rows.4.task"),
                    baseline: t("aboutAi.compare.rows.4.baseline"),
                    ai: t("aboutAi.compare.rows.4.ai"),
                  },
                ].map((r, i) => (
                  <tr key={i}>
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
          <h2 className="font-display text-2xl font-semibold">
            {t("aboutAi.notAi.title")}
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
              <span>
                <strong className="text-foreground">{t("aboutAi.notAi.1.title")}</strong>{" "}
                {t("aboutAi.notAi.1.body")}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
              <span>
                <strong className="text-foreground">{t("aboutAi.notAi.2.title")}</strong>{" "}
                {t("aboutAi.notAi.2.body")}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--emerald-brand)]" />
              <span>
                <strong className="text-foreground">{t("aboutAi.notAi.3.title")}</strong>{" "}
                {t("aboutAi.notAi.3.body")}
              </span>
            </li>
          </ul>
        </section>

        <section className="mt-14 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Database className="h-4 w-4" /> {t("aboutAi.model.title")}
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm font-semibold">{t("aboutAi.model.name")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("aboutAi.model.nameValue")}
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold">{t("aboutAi.model.data")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("aboutAi.model.dataValue")}
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold">{t("aboutAi.model.latency")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("aboutAi.model.latencyValue")}
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold">{t("aboutAi.model.temp")}</div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("aboutAi.model.tempValue")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">
            {t("aboutAi.safety.title")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <SafetyCard
              icon={<Lock className="h-5 w-5" />}
              title={t("aboutAi.safety.1.title")}
              body={t("aboutAi.safety.1.body")}
            />
            <SafetyCard
              icon={<Activity className="h-5 w-5" />}
              title={t("aboutAi.safety.2.title")}
              body={t("aboutAi.safety.2.body")}
            />
            <SafetyCard
              icon={<Workflow className="h-5 w-5" />}
              title={t("aboutAi.safety.3.title")}
              body={t("aboutAi.safety.3.body")}
            />
            <SafetyCard
              icon={<ServerOff className="h-5 w-5" />}
              title={t("aboutAi.safety.4.title")}
              body={t("aboutAi.safety.4.body")}
            />
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">{t("aboutAi.fallback.title")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("aboutAi.fallback.body")}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              {t("aboutAi.cta.try")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg">
              {t("common.backHome")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

export function Card({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
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

export function SafetyCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5">
      <div className="absolute -top-3 left-5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {n}
      </div>
      <div className="mt-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
