import * as React from "react";
import { V2ConfirmModal } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export interface ProcurementDiscardModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Xác nhận bỏ thay đổi chưa lưu khi bấm Hủy sửa. Nằm trên drawer (z-[700]). */
export function ProcurementDiscardModal({
  open,
  onConfirm,
  onCancel,
}: ProcurementDiscardModalProps) {
  const { t } = useV2Translation();
  return (
    <V2ConfirmModal
      open={open}
      title={t("v2.procurement.drawer.discardTitle", "Bỏ thay đổi?")}
      message={t(
        "v2.procurement.drawer.discardMessage",
        "Các thay đổi chưa lưu sẽ bị bỏ. Bạn có chắc không?",
      )}
      confirmLabel={t("v2.procurement.drawer.discardConfirm", "Bỏ thay đổi")}
      cancelLabel={t("v2.common.cancel", "Hủy")}
      variant="danger"
      className="z-[700]"
      overlayClassName="z-[699]"
      onConfirm={onConfirm}
      onCancel={onCancel}
      onOpenChange={(next) => !next && onCancel()}
    />
  );
}
