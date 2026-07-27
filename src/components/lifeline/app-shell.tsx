import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LifeLineLogo } from "./logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  MapPin,
  FolderHeart,
  CalendarCheck,
  Bell,
  Settings,
  Siren,
  Building2,
  Ambulance as AmbulanceIcon,
  Shield,
  LandPlot,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { LanguagePill, useT } from "@/i18n";

const navItems = [
  { to: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/emergency/new", key: "nav.sos", icon: Siren, emphasis: true },
  { to: "/assistant", key: "nav.assistant", icon: Sparkles },
  { to: "/hospitals", key: "nav.hospitals", icon: MapPin },
  { to: "/records", key: "nav.records", icon: FolderHeart },
  { to: "/appointments", key: "nav.appointments", icon: CalendarCheck },
  { to: "/notifications", key: "nav.notifications", icon: Bell },
  { to: "/settings", key: "nav.settings", icon: Settings },
] as const;

const roleNavItems = [
  { to: "/hospital", key: "nav.hospital", icon: Building2 },
  { to: "/ambulance", key: "nav.ambulance", icon: AmbulanceIcon },
  { to: "/ministry", key: "nav.ministry", icon: LandPlot },
  { to: "/admin", key: "nav.admin", icon: Shield },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const t = useT();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center justify-between px-6">
          <LifeLineLogo />
          <LanguagePill />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={t(item.key)}
              Icon={item.icon}
              emphasis={"emphasis" in item ? item.emphasis : false}
              active={path.startsWith(item.to)}
            />
          ))}
          <div className="mt-4 px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("nav.roleGroup")}
          </div>
          {roleNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={t(item.key)}
              Icon={item.icon}
              active={path.startsWith(item.to)}
            />
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> {t("common.signOut")}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur md:hidden">
        <LifeLineLogo />
        <div className="flex items-center gap-2">
          <LanguagePill />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.menu")}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-x-0 top-14 z-30 border-b border-border bg-background/95 p-3 backdrop-blur md:hidden">
          <nav className="space-y-0.5">
            {[...navItems, ...roleNavItems].map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                label={t(item.key)}
                Icon={item.icon}
                active={path.startsWith(item.to)}
              />
            ))}
            <button
              onClick={signOut}
              className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> {t("common.signOut")}
            </button>
          </nav>
        </div>
      ) : null}

      <main className="md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
          {title ? (
            <h1 className="mb-6 font-display text-2xl font-semibold md:text-3xl">{title}</h1>
          ) : null}
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  to,
  label,
  Icon,
  active,
  emphasis,
}: {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  emphasis?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-primary"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        emphasis && !active && "text-[color:var(--alert)]",
      )}
    >
      <Icon className={cn("h-4 w-4", emphasis && "text-[color:var(--alert)]")} />
      {label}
    </Link>
  );
}
