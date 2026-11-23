import {
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms/v2-badge";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { isRoleInactive } from "../../../domain/rules/roleRules";

export interface RoleStatusBadgeProps {
  status: string;
  className?: string;
}

/** Nhãn trạng thái dùng chung giữa cột bảng và tiêu đề drawer */
export function RoleStatusBadge({ status, className }: RoleStatusBadgeProps) {
  const { t } = useV2Translation();
  const inactive = isRoleInactive(status);

  return (
    <V2Badge
      variant={inactive ? V2BadgeVariant.SECONDARY : V2BadgeVariant.DEFAULT}
      size={V2BadgeSize.SM}
      className={cn("font-medium transition-colors", className)}
    >
      {inactive
        ? t("v2.rbacRoles.status.inactive", "Ngưng hoạt động")
        : t("v2.rbacRoles.status.active", "Hoạt động")}
    </V2Badge>
  );
}
