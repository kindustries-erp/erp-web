import * as React from "react";
import { ShieldAlert, ArrowLeftRight, Briefcase } from "lucide-react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import {
  V2Button,
  V2Text,
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms";
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
    <V2Button
      type="button"
      data-testid="workspace-mode-toggle"
      variant="ghost"
      size="xs"
      onClick={handleToggle}
      aria-label={
        isAdminMode
          ? t("v2.workspace.switchToOps", "Chuyển sang Nhập liệu")
          : t("v2.workspace.switchToAdmin", "Chuyển sang Quản trị")
      }
      className={cn(
        "v2-workspace-mode-toggle flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium select-none transition-all shadow-2xs cursor-pointer",
        isAdminMode
          ? "border border-amber-500/30 dark:border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 dark:hover:bg-amber-500/25"
          : "border border-border dark:border-white/[0.08] bg-surface dark:bg-white/[0.05] text-muted-fg dark:text-zinc-300 hover:text-foreground dark:hover:text-white hover:bg-surface-hover dark:hover:bg-white/[0.1] hover:border-foreground/20",
        className,
      )}
    >
      {isAdminMode ? (
        <>
          <Briefcase
            size={12}
            className="shrink-0 text-amber-600 dark:text-amber-400"
          />
          <V2Text
            as="span"
            variant="caption"
            className="font-medium text-inherit"
          >
            {t("v2.workspace.opsMode", "Không gian Nhập liệu")}
          </V2Text>
          <ArrowLeftRight size={10} className="opacity-60 ml-0.5 shrink-0" />
        </>
      ) : (
        <>
          <ShieldAlert size={12} className="shrink-0 text-primary opacity-80" />
          <V2Text
            as="span"
            variant="caption"
            className="font-medium text-inherit"
          >
            {t("v2.workspace.adminMode", "Cổng Quản trị")}
          </V2Text>
          <V2Badge
            variant={V2BadgeVariant.PRO}
            size={V2BadgeSize.XS}
            className="ml-0.5"
          >
            Pro
          </V2Badge>
          <ArrowLeftRight size={10} className="opacity-60 ml-0.5 shrink-0" />
        </>
      )}
    </V2Button>
  );
};
