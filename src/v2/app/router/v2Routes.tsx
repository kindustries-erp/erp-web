import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { V2AppLayout } from "@/v2/app/layouts/v2-app-layout";
import { V2AdminLayout } from "@/v2/app/layouts/v2-admin-layout";
import { V2Text, type V2SidebarNavItem } from "@/v2/shared/components";
import { V2WelcomePage } from "@/v2/app/pages/V2WelcomePage";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Badge } from "@/v2/shared/ui";
import { Clock } from "lucide-react";
import { PermissionGuard, AdminRouteGuard } from "./guards";
import {
  V2_DEFAULT_ROUTE_ID,
  V2_DEFAULT_ADMIN_ROUTE_ID,
  isAdminPath,
  resolveV2Route,
} from "./v2RouteConfig";
import { V2_PAGE_REGISTRY } from "./v2PageRegistry";

export const V2RouterView: React.FC = () => {
  const { t } = useV2Translation();
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

  const inAdminArea = isAdminPath(currentPath);
  const activeRoute = resolveV2Route(currentPath);
  const activeNavId =
    activeRoute?.id ??
    (inAdminArea ? V2_DEFAULT_ADMIN_ROUTE_ID : V2_DEFAULT_ROUTE_ID);
  const userName =
    employee?.full_name ||
    profile?.email ||
    t("v2.sidebar.userFallback", "Người dùng");
  const userRole = profile?.role?.name || "Thành viên";

  const renderContent = () => {
    if (!activeRoute) {
      return <V2WelcomePage />;
    }

    const page = V2_PAGE_REGISTRY[activeRoute.id]?.() ?? null;

    return (
      <PermissionGuard permission={activeRoute.permission}>
        {page ?? (
          <div className="mx-auto max-w-4xl space-y-4 py-8">
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
                <Clock size={24} />
              </div>
              <Badge variant="outline" className="text-xs">
                {inAdminArea
                  ? t("v2.routes.adminBadge", "Cổng Quản trị V2")
                  : t("v2.routes.opsBadge", "Không gian Nghiệp vụ V2")}
              </Badge>
              <V2Text as="h2" variant="h3" weight="bold">
                {activeRoute.title}
              </V2Text>
              <V2Text
                variant="body-sm"
                color="muted"
                className="max-w-md mx-auto"
              >
                {t(
                  "v2.routes.placeholderDesc",
                  "Module này đang được xây dựng theo chuẩn Atomic Design 5 tầng và Pure Domain Rules của ERP V2.",
                )}
              </V2Text>
            </div>
          </div>
        )}
      </PermissionGuard>
    );
  };

  if (inAdminArea) {
    return (
      <AdminRouteGuard>
        <V2AdminLayout
          activeNavId={activeNavId}
          userName={userName}
          userRole={userRole}
          onNavigate={handleNavigate}
        >
          {renderContent()}
        </V2AdminLayout>
      </AdminRouteGuard>
    );
  }

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
