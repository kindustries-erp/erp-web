import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { V2AppLayout } from "@/v2/app/layouts/v2-app-layout";
import { type V2SidebarNavItem } from "@/v2/shared/components/organisms/v2-sidebar";
import { V2WelcomePage } from "@/v2/app/pages/V2WelcomePage";
import { V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui";
import { Clock } from "lucide-react";
import { PermissionGuard } from "./guards";
import { V2_DEFAULT_ROUTE_ID, resolveV2Route } from "./v2RouteConfig";

export const V2RouterView: React.FC = () => {
  const { employee, profile } = useAuthStore();
  const [currentPath, setCurrentPath] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.pathname : "/v2",
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = useCallback((item: V2SidebarNavItem) => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", item.href);
      setCurrentPath(item.href);
    }
  }, []);

  const activeRoute = resolveV2Route(currentPath);
  const activeNavId = activeRoute?.id ?? V2_DEFAULT_ROUTE_ID;
  const userName = employee?.full_name || profile?.email || "Người dùng";
  const userRole = profile?.role?.name || "Thành viên";

  const renderContent = () => {
    if (!activeRoute) {
      return <V2WelcomePage />;
    }

    return (
      <PermissionGuard permission={activeRoute.permission}>
        <div className="mx-auto max-w-4xl space-y-4 py-8">
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
              <Clock size={24} />
            </div>
            <Badge variant="outline" className="text-xs">
              Đang quy hoạch Phase 3
            </Badge>
            <V2Text as="h2" variant="h3" weight="bold">
              {activeRoute.title}
            </V2Text>
            <V2Text
              variant="body-sm"
              color="muted"
              className="max-w-md mx-auto"
            >
              Module này sẽ được triển khai cuốn chiếu (Rolling Migration) theo
              chuẩn Atomic Design 5 tầng và Pure Domain Rules ở giai đoạn kế
              tiếp.
            </V2Text>
          </div>
        </div>
      </PermissionGuard>
    );
  };

  return (
    <V2AppLayout
      activeNavId={activeNavId}
      userName={userName}
      userRole={userRole}
      onNavigate={handleNavigate}
    >
      {renderContent()}
    </V2AppLayout>
  );
};
