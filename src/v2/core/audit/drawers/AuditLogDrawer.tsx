import { V2StandardDrawer } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { AuditLogRow } from "../api/dtos/audit-log.dto";
import { AuditLogView } from "../components/organisms/audit-log-view";
import { AuditStatusBadge } from "../components/molecules/audit-status-badge";

export interface AuditLogDrawerProps {
  open: boolean;
  row: AuditLogRow | null;
  onClose: () => void;
}

/** Drawer nhật ký: chỉ xem, render thông tin (không có chế độ sửa) */
export function AuditLogDrawer({ open, row, onClose }: AuditLogDrawerProps) {
  const { t } = useV2Translation();
  return (
    <V2StandardDrawer
      id={`audit-log-${row?.id ?? "none"}`}
      open={open}
      onClose={onClose}
      mode="view"
      title={t("v2.audit.detail.title", "Chi tiết nhật ký")}
      subtitle={row?.actionType}
      titleExtra={row ? <AuditStatusBadge status={row.status} /> : undefined}
      layout="1-column"
      size="md"
      actions={[
        {
          label: t("v2.common.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ]}
    >
      {row && <AuditLogView row={row} t={t} />}
    </V2StandardDrawer>
  );
}
