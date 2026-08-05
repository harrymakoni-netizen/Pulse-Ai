import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { EcgLoader } from "./components/lifeline/ecg-loader";

function RouterPending() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <EcgLoader label="Loading…" />
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RouterPending,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  });

  return router;
};
