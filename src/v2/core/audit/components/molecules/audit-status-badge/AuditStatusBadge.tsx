import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { isAuditFailed } from "../../../domain/rules/auditRules";

/** Nhãn trạng thái nhật ký dùng chung giữa cột bảng và drawer */
export function AuditStatusBadge({ status }: { status: string }) {
  const { t } = useV2Translation();
  const failed = isAuditFailed(status);
  return (
    <Badge variant={failed ? "destructive" : "success"}>
      {failed
        ? t("v2.audit.status.failed", "Lỗi")
        : t("v2.audit.status.success", "Thành công")}
    </Badge>
  );
}
