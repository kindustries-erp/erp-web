import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { V2LoginPage } from "@/v2/modules/auth/pages/login/V2LoginPage";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { V2DocumentDependencyModal, V2Toaster } from "@/v2/shared/components";
import { loadV2ServerPreferences } from "@/v2/shared/preferences/v2ServerPreferences";
import { TooltipProvider } from "@/v2/shared/ui";
import { AppProvidersProps } from "./AppProviders.type";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { accessToken } = useAuthStore();
  const isAuthenticated = Boolean(accessToken);

  React.useEffect(() => {
    if (isAuthenticated) void loadV2ServerPreferences();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <V2LoginPage />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        {children}
        <V2Toaster />
        <V2DocumentDependencyModal />
      </TooltipProvider>
    </QueryClientProvider>
  );
};
