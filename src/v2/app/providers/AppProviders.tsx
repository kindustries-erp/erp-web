import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Lock, LogIn } from "lucide-react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { Button } from "@/v2/shared/ui";
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

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-4 text-foreground">
        <div className="mx-auto max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Lock size={24} />
          </div>
          <h2 className="text-lg font-bold">Yêu cầu đăng nhập</h2>
          <p className="text-xs text-muted-foreground">
            Phiên làm việc của bạn đã hết hạn hoặc chưa được xác thực. Vui lòng
            đăng nhập vào ERP để tiếp tục.
          </p>
          <Button
            variant="default"
            onClick={() => {
              window.location.href = "/";
            }}
            className="w-full gap-2 text-xs"
          >
            <LogIn size={16} />
            <span>Đăng nhập hệ thống</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
