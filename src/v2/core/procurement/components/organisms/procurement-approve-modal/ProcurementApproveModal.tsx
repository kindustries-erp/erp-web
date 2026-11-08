import * as React from "react";
import { V2Button, V2Modal, V2Text } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { ProcurementDocSummaryCard } from "../../molecules/procurement-doc-summary-card";

export interface ProcurementApproveModalProps {
  open: boolean;
  rowLabel: string;
  target?: any | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onViewDetail?: () => void;
}

/**
 * Modal duyệt chứng từ procurement (PR / PO):
 * Hiển thị thẻ tóm tắt thông tin cơ bản của phiếu kèm icon mở Drawer xem chi tiết.
 * Khi bấm icon xem Drawer thì modal sẽ đóng.
 */
export function ProcurementApproveModal({
  open,
  rowLabel,
  target,
  loading = false,
  onConfirm,
  onCancel,
  onViewDetail,
}: ProcurementApproveModalProps) {
  const { t } = useV2Translation();
  const docNo = target?.requestNo || target?.orderNo || rowLabel;

  return (
    <V2Modal
      open={open}
      onOpenChange={(next) => !next && onCancel()}
      size="md"
      title={t("v2.procurement.approveModal.title", "Duyệt đề nghị mua hàng")}
      description={target ? undefined : rowLabel}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <V2Button variant="outline" onClick={onCancel} disabled={loading}>
            {t("v2.common.cancel", "Hủy")}
          </V2Button>
          <V2Button isLoading={loading} disabled={loading} onClick={onConfirm}>
            {t("v2.procurement.actions.approve", "Duyệt")}
          </V2Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {target && (
          <ProcurementDocSummaryCard
            documentNo={docNo}
            title={target.title || target.remarks}
            date={target.requestDate || target.orderDate || target.createdAt}
            branchName={target.branchName}
            estimatedTotal={target.estimatedTotal ?? target.totalAmount}
            createdByEmail={target.createdByEmail}
            onViewDetail={onViewDetail}
          />
        )}

        <V2Text variant="body" className="text-muted-fg">
          {t(
            "v2.procurement.approveModal.message",
            "Bạn có chắc chắn muốn duyệt phiếu này không? Sau khi duyệt, phiếu sẽ chuyển sang trạng thái Đã duyệt.",
          )}
        </V2Text>
      </div>
    </V2Modal>
  );
}
