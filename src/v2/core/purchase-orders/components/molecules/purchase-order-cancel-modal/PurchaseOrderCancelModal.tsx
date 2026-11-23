import { V2ConfirmModal } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import "../../../purchaseOrders.locale";

export interface PurchaseOrderCancelModalProps {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Xác nhận hủy đơn mua hàng; dùng chung giữa drawer và trang danh sách */
export function PurchaseOrderCancelModal({
  open,
  loading,
  onConfirm,
  onClose,
}: PurchaseOrderCancelModalProps) {
  const { t } = useV2Translation();
  return (
    <V2ConfirmModal
      open={open}
      title={t("v2.purchaseOrders.cancelConfirm.title", "Xác nhận hủy đơn")}
      message={t(
        "v2.purchaseOrders.cancelConfirm.message",
        "Bạn có chắc chắn muốn hủy đơn mua hàng này? Hành động này không hoàn tác.",
      )}
      confirmLabel={t("v2.purchaseOrders.actions.cancel", "Hủy đơn")}
      cancelLabel={t("v2.common.cancel", "Hủy")}
      variant="danger"
      isLoading={loading}
      onConfirm={onConfirm}
      onCancel={onClose}
      onOpenChange={(next) => !next && onClose()}
    />
  );
}
