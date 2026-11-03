import * as React from "react";
import { ShieldX } from "lucide-react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Text, V2Button } from "@/v2/shared/components";
import type { AdminRouteGuardProps } from "./AdminRouteGuard.type";

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({
  children,
  fallback,
}) => {
  const { t } = useV2Translation();
  const profileEmail = useAuthStore((s) => s.profile?.email);
  const employeeEmail = useAuthStore((s) => s.employee?.email);

  const isSuperAdmin =
    profileEmail === "admin@liouni.com" || employeeEmail === "admin@liouni.com";

  if (isSuperAdmin) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;

  const handleBackToOps = () => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/v2");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <div
      role="alert"
      data-testid="admin-guard-forbidden"
      className="mx-auto max-w-md space-y-4 py-16 text-center"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldX size={28} />
      </div>
      <div className="space-y-1">
        <V2Text as="h2" variant="h3" weight="bold">
          {t("v2.guard.adminForbidden", "Khu vực giới hạn Quản trị")}
        </V2Text>
        <V2Text variant="body-sm" color="muted">
          {t(
            "v2.guard.adminForbiddenHint",
            "Tài khoản của bạn không có thẩm quyền truy cập cổng quản trị. Vui lòng quay lại không gian nghiệp vụ.",
          )}
        </V2Text>
      </div>
      <V2Button variant="outline" size="sm" onClick={handleBackToOps}>
        {t("v2.guard.backToOps", "Quay lại không gian làm việc")}
      </V2Button>
    </div>
  );
};

AdminRouteGuard.displayName = "AdminRouteGuard";
