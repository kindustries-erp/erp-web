import {
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms/v2-badge";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { RoleSystemBadgeProps } from "./RoleSystemBadge.type";

export function RoleSystemBadge({ isSystem, className }: RoleSystemBadgeProps) {
  const { t } = useV2Translation();

  return (
    <V2Badge
      variant={isSystem ? V2BadgeVariant.SECONDARY : V2BadgeVariant.OUTLINE}
      size={V2BadgeSize.SM}
      className={cn(
        "font-medium transition-colors",
        isSystem
          ? "border-transparent bg-secondary text-secondary-foreground"
          : "border-border text-foreground/80 bg-muted/20 hover:bg-muted/30 dark:text-foreground/90 dark:bg-muted/10",
        className,
      )}
    >
      {isSystem
        ? t("v2.rbacRoles.systemType.system", "Hệ thống")
        : t("v2.rbacRoles.systemType.custom", "Tùy biến")}
    </V2Badge>
  );
}
