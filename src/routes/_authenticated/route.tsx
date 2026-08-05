import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { EcgLoader } from "@/components/lifeline/ecg-loader";

function AuthPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <EcgLoader label="Loading…" />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  pendingComponent: AuthPending,
  pendingMs: 0,
  pendingMinMs: 0,
  component: () => <Outlet />,
});
