import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { isEmployeeInactive } from "../../../domain/rules/employeeRules";

export interface EmployeeStatusBadgeProps {
  status: string;
}

/** Nhãn trạng thái nhân viên dùng chung giữa cột bảng và tiêu đề drawer */
export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  const { t } = useV2Translation();
  const inactive = isEmployeeInactive(status);
  return (
    <Badge variant={inactive ? "secondary" : "default"}>
      {inactive
        ? t("v2.employees.status.inactive", "Nghỉ việc")
        : t("v2.employees.status.active", "Đang làm")}
    </Badge>
  );
}
