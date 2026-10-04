import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { V2AppLayout } from "@/v2/app/layouts/v2-app-layout";
import { type V2SidebarNavItem } from "@/v2/shared/components/organisms/v2-sidebar";
import { V2WelcomePage } from "@/v2/app/pages/V2WelcomePage";
import { Badge } from "@/v2/shared/ui/badge";
import { Clock } from "lucide-react";

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

  const getActiveNavId = (path: string): string => {
    if (path.startsWith("/v2/sales-orders")) return "sales-orders";
    if (path.startsWith("/v2/purchasing")) return "purchasing";
    if (path.startsWith("/v2/inventory")) return "inventory";
    if (path.startsWith("/v2/settings")) return "settings";
    return "dashboard";
  };

  const activeNavId = getActiveNavId(currentPath);
  const userName = employee?.full_name || profile?.email || "Người dùng";
  const userRole = profile?.role?.name || "Thành viên";

  const renderContent = () => {
    if (activeNavId === "dashboard") {
      return <V2WelcomePage />;
    }

    const titleMap: Record<string, string> = {
      "sales-orders": "Đơn bán hàng (Sales Orders)",
      purchasing: "Quản lý mua hàng (Purchasing)",
      inventory: "Kho vận (Inventory)",
      settings: "Cấu hình hệ thống (Settings)",
    };

    return (
      <div className="mx-auto max-w-4xl space-y-4 py-8">
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Clock size={24} />
          </div>
          <Badge variant="outline" className="text-xs">
            Đang quy hoạch Phase 3
          </Badge>
          <h2 className="text-lg font-bold text-foreground">
            {titleMap[activeNavId] || "Phân hệ V2"}
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Module này sẽ được triển khai cuốn chiếu (Rolling Migration) theo
            chuẩn Atomic Design 5 tầng và Pure Domain Rules ở giai đoạn kế tiếp.
          </p>
        </div>
      </div>
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
