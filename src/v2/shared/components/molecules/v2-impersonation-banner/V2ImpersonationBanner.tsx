import * as React from "react";
import { UserCheck, LogOut } from "lucide-react";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui/badge";
import { cn } from "@/v2/shared/utils/cn";
import type { V2ImpersonationBannerProps } from "./V2ImpersonationBanner.type";

export const V2ImpersonationBanner: React.FC<V2ImpersonationBannerProps> = ({
  className,
  compact = false,
}) => {
  const { t } = useV2Translation();
  const impersonation = useAuthStore((s) => s.impersonation);
  const employee = useAuthStore((s) => s.employee);
  const profile = useAuthStore((s) => s.profile);
  const stopImpersonationAction = useAuthStore(
    (s) => s.stopImpersonationAction,
  );

  if (!impersonation?.active) return null;

  const currentUserName =
    employee?.full_name ||
    profile?.email ||
    t("v2.impersonation.unknownUser", "Người dùng");
  const actorEmail = impersonation.actor?.email ?? "—";

  const handleStop = async () => {
    await stopImpersonationAction("manual");
  };

  if (compact) {
    return (
      <div
        data-testid="v2-impersonation-banner"
        className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs select-none shadow-xs",
          className,
        )}
      >
        <UserCheck size={13} className="shrink-0" />
        <V2Text
          as="span"
          variant="caption"
          weight="semibold"
          truncate
          className="max-w-[100px] text-inherit"
        >
          {currentUserName}
        </V2Text>
        <V2Button
          type="button"
          variant="danger"
          size="xs"
          onClick={handleStop}
          className="h-5 px-1.5 text-[10px] gap-1 shrink-0 ml-1 rounded"
          title={t("v2.impersonation.stopButton", "Quay lại tài khoản gốc")}
        >
          <LogOut size={10} />
          <V2Text
            as="span"
            variant="caption"
            className="text-[10px] text-inherit"
          >
            {t("v2.common.exit", "Thoát")}
          </V2Text>
        </V2Button>
      </div>
    );
  }

  return (
    <div
      data-testid="v2-impersonation-banner"
      className={cn(
        "flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs select-none shadow-xs",
        className,
      )}
    >
      <UserCheck
        size={14}
        className="shrink-0 text-amber-600 dark:text-amber-400"
      />
      <Badge
        variant="warning"
        className="h-4 px-1 text-[10px] font-bold uppercase shrink-0"
      >
        {t("v2.impersonation.bannerTitle", "Đang đăng nhập hộ")}
      </Badge>

      <V2Text
        as="span"
        variant="body-sm"
        weight="semibold"
        truncate
        className="max-w-[140px] sm:max-w-[200px] text-foreground"
      >
        {currentUserName}
      </V2Text>

      <V2Text
        variant="caption"
        className="text-amber-700/80 dark:text-amber-400/80 hidden md:inline truncate max-w-[160px]"
      >
        ({t("v2.impersonation.actorLabel", "Tài khoản gốc")}: {actorEmail})
      </V2Text>

      <V2Button
        type="button"
        variant="danger"
        size="xs"
        onClick={handleStop}
        data-testid="stop-impersonation-button"
        className="h-6 px-2 text-xs font-medium gap-1 shrink-0 ml-1 rounded-md"
      >
        <LogOut size={12} />
        <V2Text
          as="span"
          variant="caption"
          weight="medium"
          className="text-inherit"
        >
          {t("v2.impersonation.stopButton", "Quay lại tài khoản gốc")}
        </V2Text>
      </V2Button>
    </div>
  );
};

V2ImpersonationBanner.displayName = "V2ImpersonationBanner";
