import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LanguagePill, useT } from "@/i18n";
import heroImage from "@/assets/hero-emergency-v2.png.asset.json";
import {
  ShieldCheck,
  Ambulance,
  Sparkles,
  Hospital,
  Timer,
  HeartPulse,
  Languages,
  Activity,
  Radio,
  ArrowRight,
  Star,
  ChevronDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Benefits />
        <AiTechnology />
        <PartnerHospitals />
        <Testimonials />
        <Faq />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const t = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <LifeLineLogo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">
            {t("landing.nav.how")}
          </a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
            {t("landing.nav.features")}
          </a>
          <a href="#ai" className="text-sm text-muted-foreground hover:text-foreground">
            {t("landing.nav.ai")}
          </a>
          <a href="#partners" className="text-sm text-muted-foreground hover:text-foreground">
            {t("landing.nav.partners")}
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
            {t("landing.nav.faq")}
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguagePill />
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">{t("common.signIn")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      {/* Cinematic hero image */}
      <div className="absolute inset-0">
        <img
          src={heroImage.url}
          alt="Emergency response team with AI-powered heads-up display at night"
          className="h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
        {/* Layered scrims for legibility over any part of the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center text-white"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            <span
              className="inline-block h-2 w-2 rounded-full bg-[color:var(--alert)]"
              aria-hidden="true"
            />
            {t("landing.hero.badge")}
          </span>
          <h1
            className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.55)" }}
          >
            {t("landing.hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-white via-[#93c5fd] to-[#5eead4] bg-clip-text text-transparent">
              {t("landing.hero.title2")}
            </span>
          </h1>
          <p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
          >
            {t("landing.hero.body")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 w-full gap-2 bg-[color:var(--alert)] text-white shadow-[0_10px_40px_-10px_rgba(225,29,72,0.7)] hover:bg-[color:var(--alert)]/90 sm:w-auto"
            >
              <Link to="/auth">
                <HeartPulse className="h-5 w-5" />
                {t("landing.hero.cta.sos")}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full border-white/30 bg-white/5 text-white backdrop-blur-md hover:bg-white/15 hover:text-white sm:w-auto"
            >
              <a href="#how">
                {t("landing.hero.cta.more")} <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <HeroStat kpi="< 8 min" label={t("landing.hero.stat.response")} />
            <HeroStat kpi="12+" label={t("landing.hero.stat.hospitals")} />
            <HeroStat kpi="3" label={t("landing.hero.stat.languages")} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroStat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div>
      <div
        className="font-display text-2xl font-semibold text-white md:text-3xl"
        style={{ textShadow: "0 2px 14px rgba(0,0,0,0.6)" }}
      >
        {kpi}
      </div>
      <div className="text-xs text-white/75">{label}</div>
    </div>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-foreground md:text-3xl">{kpi}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {sub ? <p className="mt-3 text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function HowItWorks() {
  const t = useT();
  const steps = [
    { icon: HeartPulse, title: t("landing.how.s1.title"), body: t("landing.how.s1.body") },
    { icon: Sparkles, title: t("landing.how.s2.title"), body: t("landing.how.s2.body") },
    { icon: Ambulance, title: t("landing.how.s3.title"), body: t("landing.how.s3.body") },
  ];
  return (
    <section id="how" className="border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t("landing.how.eyebrow")}
          title={t("landing.how.title")}
          sub={t("landing.how.sub")}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6 elevated"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">
                {t("landing.how.step")} {i + 1}
              </div>
              <h3 className="font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const t = useT();
  const items = [
    { icon: Sparkles, title: t("landing.features.f1.title"), body: t("landing.features.f1.body") },
    { icon: Ambulance, title: t("landing.features.f2.title"), body: t("landing.features.f2.body") },
    { icon: Hospital, title: t("landing.features.f3.title"), body: t("landing.features.f3.body") },
    {
      icon: ShieldCheck,
      title: t("landing.features.f4.title"),
      body: t("landing.features.f4.body"),
    },
    { icon: Radio, title: t("landing.features.f5.title"), body: t("landing.features.f5.body") },
    { icon: Activity, title: t("landing.features.f6.title"), body: t("landing.features.f6.body") },
  ];
  return (
    <section id="features" className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t("landing.features.eyebrow")}
          title={t("landing.features.title")}
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-emerald-500/15 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const t = useT();
  const items = [
    {
      title: t("landing.benefits.b1.title"),
      body: t("landing.benefits.b1.body"),
      icon: HeartPulse,
    },
    { title: t("landing.benefits.b2.title"), body: t("landing.benefits.b2.body"), icon: Hospital },
    { title: t("landing.benefits.b3.title"), body: t("landing.benefits.b3.body"), icon: Ambulance },
    {
      title: t("landing.benefits.b4.title"),
      body: t("landing.benefits.b4.body"),
      icon: ShieldCheck,
    },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t("landing.benefits.eyebrow")}
          title={t("landing.benefits.title")}
        />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((b) => (
            <div key={b.title} className="rounded-2xl border border-border bg-card p-6">
              <b.icon className="mb-4 h-6 w-6 text-primary" />
              <h3 className="font-medium">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiTechnology() {
  const t = useT();
  const points = [
    t("landing.ai.p1"),
    t("landing.ai.p2"),
    t("landing.ai.p3"),
    t("landing.ai.p4"),
    t("landing.ai.p5"),
  ];
  return (
    <section
      id="ai"
      className="border-t border-border bg-gradient-to-b from-background to-secondary/30 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              {t("landing.ai.eyebrow")}
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
              {t("landing.ai.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("landing.ai.body")}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {points.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--emerald-brand)]" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass elevated rounded-3xl border p-2">
            <div className="rounded-2xl bg-card p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="pulse-calm h-2 w-2 rounded-full bg-primary" />{" "}
                {t("landing.ai.live")}
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <ChatBubble role="user">{t("landing.ai.chat.u1")}</ChatBubble>
                <ChatBubble role="ai">
                  {t("landing.ai.chat.a1.pre")}
                  <strong className="text-[color:var(--alert)]">
                    {t("landing.ai.chat.a1.sev")}
                  </strong>
                  {t("landing.ai.chat.a1.post")}
                </ChatBubble>
                <ChatBubble role="user">{t("landing.ai.chat.u2")}</ChatBubble>
                <ChatBubble role="ai">{t("landing.ai.chat.a2")}</ChatBubble>
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                <Languages className="h-4 w-4" /> EN · SN · ND
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ role, children }: { role: "user" | "ai"; children: React.ReactNode }) {
  return (
    <div className={role === "user" ? "flex justify-end" : "flex"}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
      >
        {children}
      </div>
    </div>
  );
}

function PartnerHospitals() {
  const t = useT();
  const hospitals = [
    "Parirenyatwa",
    "Sally Mugabe",
    "Mpilo",
    "Chitungwiza",
    "Avenues Clinic",
    "Mater Dei",
    "UBH",
    "Mutare Provincial",
    "Gweru",
    "Masvingo",
    "West End",
    "Victoria Falls",
  ];
  return (
    <section id="partners" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={t("landing.partners.eyebrow")}
          title={t("landing.partners.title")}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {hospitals.map((h) => (
            <span
              key={h}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const tr = useT();
  const items = [
    {
      name: tr("landing.tst.1.name"),
      role: tr("landing.tst.1.role"),
      quote: tr("landing.tst.1.quote"),
    },
    {
      name: tr("landing.tst.2.name"),
      role: tr("landing.tst.2.role"),
      quote: tr("landing.tst.2.quote"),
    },
    {
      name: tr("landing.tst.3.name"),
      role: tr("landing.tst.3.role"),
      quote: tr("landing.tst.3.quote"),
    },
  ];
  return (
    <section className="border-t border-border bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading
          eyebrow={tr("landing.testimonials.eyebrow")}
          title={tr("landing.testimonials.title")}
        />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-[color:var(--emerald-brand)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm">"{t.quote}"</p>
              <div className="mt-4 text-xs">
                <div className="font-medium">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const t = useT();
  const items = [
    { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
    { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
    { q: t("landing.faq.q3"), a: t("landing.faq.a3") },
    { q: t("landing.faq.q4"), a: t("landing.faq.a4") },
    { q: t("landing.faq.q5"), a: t("landing.faq.a5") },
  ];
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <SectionHeading eyebrow={t("landing.faq.eyebrow")} title={t("landing.faq.title")} />
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {items.map((item, i) => (
            <details key={i} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const t = useT();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <LifeLineLogo />
            <p className="mt-3 text-sm text-muted-foreground">{t("landing.footer.tagline")}</p>
          </div>
          <FooterCol
            title={t("landing.footer.product")}
            items={[
              [t("landing.nav.how"), "#how"],
              [t("landing.nav.features"), "#features"],
              [t("landing.nav.ai"), "#ai"],
              ["Why AI?", "/about/ai"],
              [t("landing.nav.faq"), "#faq"],
            ]}
          />
          <FooterCol
            title={t("landing.footer.company")}
            items={[
              [t("landing.partners.eyebrow"), "#partners"],
              [t("landing.footer.privacy"), "#"],
              [t("landing.footer.terms"), "#"],
              [t("landing.footer.contact"), "mailto:hello@lifeline.co.zw"],
            ]}
          />
          <FooterCol
            title={t("landing.footer.emergency")}
            items={[
              ["Zimbabwe: 999", "tel:999"],
              ["Ambulance: 112", "tel:112"],
              ["LifeLine+ dispatch", "/dashboard"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <div>
            © {new Date().getFullYear()} LifeLine+ · {t("landing.footer.rights")}
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">
              Twitter
            </a>
            <a href="#" className="hover:text-foreground">
              LinkedIn
            </a>
            <a href="#" className="hover:text-foreground">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="hover:text-foreground">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
