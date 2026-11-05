import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface RoleSystemBadgeProps {
  isSystem?: boolean;
}

export function RoleSystemBadge({ isSystem }: RoleSystemBadgeProps) {
  const { t } = useV2Translation();

  return (
    <Badge variant={isSystem ? "secondary" : "outline"}>
      {isSystem
        ? t("v2.rbacRoles.systemType.system", "Hệ thống")
        : t("v2.rbacRoles.systemType.custom", "Tùy biến")}
    </Badge>
  );
}
