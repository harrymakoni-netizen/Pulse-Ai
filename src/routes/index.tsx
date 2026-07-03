import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeLineLogo } from "@/components/lifeline/logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Ambulance,
  Sparkles,
  Hospital,
  Timer,
  HeartPulse,
  Languages,
  Activity,
  MapPinned,
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
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <LifeLineLogo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#ai" className="text-sm text-muted-foreground hover:text-foreground">AI technology</a>
          <a href="#partners" className="text-sm text-muted-foreground hover:text-foreground">Partners</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
          <Button asChild size="sm" className="hidden md:inline-flex"><Link to="/auth" search={{ mode: "sign-up" } as never}>Get started</Link></Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 md:px-8 md:pb-32 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <span className="pulse-calm inline-block h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            AI for Impact · Zimbabwe
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Every second counts.<br />
            <span className="text-gradient-brand">AI-powered emergency healthcare.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            LifeLine+ connects patients, hospitals, and ambulances using artificial intelligence to reduce emergency response times and improve patient outcomes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 w-full gap-2 bg-[color:var(--alert)] text-white hover:bg-[color:var(--alert)]/90 sm:w-auto">
              <Link to="/auth">
                <HeartPulse className="h-5 w-5" />
                Request emergency assistance
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 w-full sm:w-auto">
              <a href="#how">Learn more <ArrowRight className="ml-1 h-4 w-4" /></a>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <Stat kpi="< 8 min" label="Avg response" />
            <Stat kpi="12+" label="Partner hospitals" />
            <Stat kpi="3" label="Languages" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mx-auto mt-14 max-w-4xl">
          <div className="glass elevated relative rounded-3xl border p-2">
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-background to-emerald-500/5 p-8">
              <div className="grid gap-6 md:grid-cols-3">
                <PreviewCard icon={<Sparkles className="h-4 w-4" />} title="AI Triage" body="Severity assessed in seconds from your symptoms." />
                <PreviewCard icon={<MapPinned className="h-4 w-4" />} title="Nearest Hospital" body="Matched to specialty, distance, and bed availability." />
                <PreviewCard icon={<Ambulance className="h-4 w-4" />} title="Live Dispatch" body="Track your ambulance from dispatch to arrival." />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
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

function PreviewCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div className="font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{body}</div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      {sub ? <p className="mt-3 text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { icon: HeartPulse, title: "Request help", body: "Press the SOS button. Share symptoms with the AI in English, Shona or Ndebele." },
    { icon: Sparkles, title: "AI triage", body: "The assistant assesses severity, gives first aid, and generates a hospital handoff." },
    { icon: Ambulance, title: "Coordinated response", body: "The nearest suitable hospital is notified and the ambulance is dispatched with your report." },
  ];
  return (
    <section id="how" className="border-t border-border py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="How it works" title="From distress to dispatch in seconds" sub="Three coordinated steps, powered by AI and connected to the network." />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6 elevated">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mb-1 text-sm font-medium text-muted-foreground">Step {i + 1}</div>
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
  const items = [
    { icon: Sparkles, title: "AI Emergency Assistant", body: "Conversational triage in English, Shona and Ndebele." },
    { icon: Ambulance, title: "Live Ambulance Tracking", body: "Real-time ETA and route updates from dispatch to arrival." },
    { icon: Hospital, title: "Smart Hospital Matching", body: "Chosen by distance, specialty, and current bed availability." },
    { icon: ShieldCheck, title: "Secure Medical Records", body: "Blood type, allergies and history shared only when needed." },
    { icon: Radio, title: "Multi-channel Alerts", body: "In-app, SMS and voice channels for care coordination." },
    { icon: Activity, title: "Health Analytics", body: "National-scale insights for public health authorities." },
  ];
  return (
    <section id="features" className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="Features" title="A complete emergency care platform" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
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
  const items = [
    { title: "For patients", body: "Faster help, in your language, with the hospital that fits your case.", icon: HeartPulse },
    { title: "For hospitals", body: "Structured handoff reports arrive before the patient does.", icon: Hospital },
    { title: "For ambulances", body: "AI-prioritized queues and turn-by-turn navigation.", icon: Ambulance },
    { title: "For authorities", body: "National dashboards and disease trend analytics.", icon: ShieldCheck },
  ];
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="Benefits" title="Built for everyone in the emergency chain" />
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
  return (
    <section id="ai" className="border-t border-border bg-gradient-to-b from-background to-secondary/30 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">AI Technology</div>
            <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Triage that thinks like a clinician.</h2>
            <p className="mt-4 text-muted-foreground">
              Our AI is trained to ask the right questions, weigh red flags, and produce a structured handoff. It works alongside human dispatchers, not instead of them.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Severity classification (Low → Critical)",
                "First-aid instructions while help is on the way",
                "Structured hospital handoff (vitals, allergies, timeline)",
                "Multi-lingual: English · Shona · Ndebele",
                "Predictive analytics for outbreak signals",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--emerald-brand)]" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass elevated rounded-3xl border p-2">
            <div className="rounded-2xl bg-card p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="pulse-calm h-2 w-2 rounded-full bg-primary" /> Assistant · live
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <ChatBubble role="user">Chest pain for 20 minutes, sweating.</ChatBubble>
                <ChatBubble role="ai">Severity: <strong className="text-[color:var(--alert)]">Critical</strong>. Sit upright, chew aspirin if not allergic, stay still. Dispatching to Parirenyatwa Cardiology in 6 min.</ChatBubble>
                <ChatBubble role="user">Handizivi kuti ndoita sei.</ChatBubble>
                <ChatBubble role="ai">Zvakanaka. Gara pasi, iva wakadzikama. Ambulance yatouya. Handeyi tione zvatinofanira kuita.</ChatBubble>
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
      <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{children}</div>
    </div>
  );
}

function PartnerHospitals() {
  const hospitals = ["Parirenyatwa", "Sally Mugabe", "Mpilo", "Chitungwiza", "Avenues Clinic", "Mater Dei", "UBH", "Mutare Provincial", "Gweru", "Masvingo", "West End", "Victoria Falls"];
  return (
    <section id="partners" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="Partner Hospitals" title="Connected to Zimbabwe's leading emergency centres" />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {hospitals.map((h) => (
            <span key={h} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">{h}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Dr. Tendai M.", role: "Emergency Physician, Parirenyatwa", quote: "The AI handoff report saves us critical minutes. Patients arrive with context already documented." },
    { name: "Rutendo S.", role: "Patient, Harare", quote: "When my father collapsed, LifeLine+ dispatched an ambulance and matched us with the right hospital in minutes." },
    { name: "Blessing N.", role: "Paramedic, Bulawayo", quote: "AI-prioritized calls mean I know exactly what to prepare for on the way." },
  ];
  return (
    <section className="border-t border-border bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <SectionHeading eyebrow="Testimonials" title="Trusted across the emergency chain" />
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex gap-0.5 text-[color:var(--emerald-brand)]">
                {Array.from({ length: 5 }).map((_, i) => (<Star key={i} className="h-4 w-4 fill-current" />))}
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
  const items = [
    { q: "Is LifeLine+ available across Zimbabwe?", a: "We are onboarding hospitals city by city. Today we cover Harare, Bulawayo, Mutare, Gweru, Masvingo and Victoria Falls with more coming." },
    { q: "Does the AI replace medical professionals?", a: "No. The AI supports dispatchers and hospital staff with faster triage and structured handoffs. All care decisions remain human." },
    { q: "How is my data protected?", a: "Records are encrypted, access is scoped by role, and you control what is shared during an emergency." },
    { q: "Which languages are supported?", a: "English, Shona (chiShona) and Ndebele (isiNdebele)." },
    { q: "Do I need a smartphone?", a: "LifeLine+ works on any modern browser, and we support SMS fallback for low-bandwidth areas." },
  ];
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
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
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <LifeLineLogo />
            <p className="mt-3 text-sm text-muted-foreground">AI-powered emergency healthcare coordination. Care · Support · Hope.</p>
          </div>
          <FooterCol title="Product" items={[["How it works", "#how"], ["Features", "#features"], ["AI technology", "#ai"], ["FAQ", "#faq"]]} />
          <FooterCol title="Company" items={[["Partner hospitals", "#partners"], ["Privacy policy", "#"], ["Terms", "#"], ["Contact", "mailto:hello@lifeline.co.zw"]]} />
          <FooterCol title="Emergency" items={[["Zimbabwe: 999", "tel:999"], ["Ambulance: 112", "tel:112"], ["LifeLine+ dispatch", "/dashboard"]]} />
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} LifeLine+ · Built for the Zimbabwe AI for Impact Challenge.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Twitter</a>
            <a href="#" className="hover:text-foreground">LinkedIn</a>
            <a href="#" className="hover:text-foreground">GitHub</a>
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
          <li key={label}><a href={href} className="hover:text-foreground">{label}</a></li>
        ))}
      </ul>
    </div>
  );
}
