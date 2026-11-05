import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { isRoleInactive } from "../../../domain/rules/roleRules";

export interface RoleStatusBadgeProps {
  status: string;
}

/** Nhãn trạng thái dùng chung giữa cột bảng và tiêu đề drawer */
export function RoleStatusBadge({ status }: RoleStatusBadgeProps) {
  const { t } = useV2Translation();
  const inactive = isRoleInactive(status);

  return (
    <Badge variant={inactive ? "secondary" : "default"}>
      {inactive
        ? t("v2.rbacRoles.status.inactive", "Ngưng hoạt động")
        : t("v2.rbacRoles.status.active", "Hoạt động")}
    </Badge>
  );
}
