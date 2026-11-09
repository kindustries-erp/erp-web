import * as React from "react";
import { V2Button, V2Modal, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementAlreadyDecidedTarget } from "../../../hooks/useProcurementAlreadyDecided";

export interface ProcurementAlreadyDecidedModalProps {
  target: ProcurementAlreadyDecidedTarget | null;
  onClose: () => void;
}

/**
 * Thông báo chứng từ đã được xử lý (đã duyệt, từ chối...) khi người dùng
 * bấm lại thông báo duyệt hoặc bấm Duyệt trên chứng từ đã đổi trạng thái.
 */
export function ProcurementAlreadyDecidedModal({
  target,
  onClose,
}: ProcurementAlreadyDecidedModalProps) {
  const { t } = useV2Translation();
  const statusLabel = target?.status
    ? t(`v2.procurement.status.${target.status}`, target.status)
    : "";

  return (
    <V2Modal
      open={Boolean(target)}
      onOpenChange={(next) => !next && onClose()}
      size="sm"
      title={t("v2.procurementAlreadyDecided.title", "Chứng từ đã được xử lý")}
      footer={
        <div className="flex w-full justify-end">
          <V2Button onClick={onClose}>
            {t("v2.procurementAlreadyDecided.acknowledge", "Đã hiểu")}
          </V2Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {target?.rowLabel && (
          <V2Text variant="body" weight="semibold" className="text-foreground">
            {target.rowLabel}
          </V2Text>
        )}
        <V2Text variant="body" className="text-muted-fg">
          {t(
            "v2.procurementAlreadyDecided.message",
            "Chứng từ này đã được xử lý trước đó, không thể duyệt lại. Vui lòng kiểm tra lại trạng thái trên danh sách.",
          )}
        </V2Text>
        {statusLabel && (
          <V2Text variant="body-sm" color="muted">
            {t(
              "v2.procurementAlreadyDecided.currentStatus",
              "Trạng thái hiện tại",
            )}
            : {statusLabel}
          </V2Text>
        )}
      </div>
    </V2Modal>
  );
}
