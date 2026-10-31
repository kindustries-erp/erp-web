import * as React from "react";
import { ShieldAlert, ArrowLeftRight, Briefcase } from "lucide-react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Button } from "@/v2/shared/ui/button";
import { Badge } from "@/v2/shared/ui/badge";
import { V2WorkspaceMode } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import type { V2WorkspaceModeToggleProps } from "./V2WorkspaceModeToggle.type";

export const V2WorkspaceModeToggle: React.FC<V2WorkspaceModeToggleProps> = ({
  className,
  onModeChange,
}) => {
  const { t } = useV2Translation();
  const profileEmail = useAuthStore((s) => s.profile?.email);
  const employeeEmail = useAuthStore((s) => s.employee?.email);

  const isSuperAdmin =
    profileEmail === "admin@liouni.com" || employeeEmail === "admin@liouni.com";

  const [isAdminMode, setIsAdminMode] = React.useState<boolean>(() => {
    return typeof window !== "undefined"
      ? window.location.pathname.startsWith("/v2/admin")
      : false;
  });

  React.useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminMode(window.location.pathname.startsWith("/v2/admin"));
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  if (!isSuperAdmin) return null;

  const handleToggle = () => {
    const targetPath = isAdminMode ? "/v2" : "/v2/admin/dashboard";
    const targetMode = isAdminMode
      ? V2WorkspaceMode.OPS
      : V2WorkspaceMode.ADMIN;

    if (typeof window !== "undefined") {
      window.history.pushState(null, "", targetPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
    setIsAdminMode(!isAdminMode);
    onModeChange?.(targetMode);
  };

  return (
    <Button
      type="button"
      data-testid="workspace-mode-toggle"
      variant="outline"
      size="xs"
      onClick={handleToggle}
      aria-label={
        isAdminMode
          ? t("v2.workspace.switchToOps", "Chuyển sang Nhập liệu")
          : t("v2.workspace.switchToAdmin", "Chuyển sang Quản trị")
      }
      className={cn(
        "h-7 gap-1.5 px-2.5 rounded-full font-medium transition-all duration-150 select-none shadow-sm",
        isAdminMode
          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
          : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        className,
      )}
    >
      {isAdminMode ? (
        <>
          <Briefcase size={13} className="shrink-0" />
          <span className="text-xs">
            {t("v2.workspace.opsMode", "Không gian Nhập liệu")}
          </span>
          <ArrowLeftRight size={11} className="opacity-70 ml-0.5" />
        </>
      ) : (
        <>
          <ShieldAlert size={13} className="shrink-0" />
          <span className="text-xs">
            {t("v2.workspace.adminMode", "Cổng Quản trị")}
          </span>
          <Badge
            variant="warning"
            className="ml-1 h-4 px-1 py-0 text-[10px] uppercase font-bold leading-none"
          >
            Pro
          </Badge>
          <ArrowLeftRight size={11} className="opacity-70 ml-0.5" />
        </>
      )}
    </Button>
  );
};
