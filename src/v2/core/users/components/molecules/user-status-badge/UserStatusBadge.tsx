import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { isUserInactive } from "../../../domain/rules/userRules";

export interface UserStatusBadgeProps {
  status: string;
}

/** Nhãn trạng thái tài khoản dùng chung giữa cột bảng và tiêu đề drawer */
export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useV2Translation();
  const inactive = isUserInactive(status);
  return (
    <Badge variant={inactive ? "secondary" : "default"}>
      {inactive
        ? t("v2.users.status.inactive", "Ngưng hoạt động")
        : t("v2.users.status.active", "Hoạt động")}
    </Badge>
  );
}
