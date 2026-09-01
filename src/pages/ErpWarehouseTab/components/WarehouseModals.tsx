import { useT } from "@/core/i18n";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";

export interface WarehouseModalsProps {
  deleteTarget: WarehouseRow | null;
  setDeleteTarget: (target: WarehouseRow | null) => void;
  deleting: boolean;
  onDeleteConfirm: () => Promise<void>;
  cancelTarget: WarehouseRow | null;
  setCancelTarget: (target: WarehouseRow | null) => void;
  onCancelConfirm: () => Promise<void>;
  grCancelId?: string | null;
}

export function WarehouseModals({
  deleteTarget,
  setDeleteTarget,
  deleting,
  onDeleteConfirm,
  cancelTarget,
  setCancelTarget,
  onCancelConfirm,
  grCancelId,
}: WarehouseModalsProps) {
  const t = useT();

  const getDeleteTypeLabel = () => {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "receipt")
      return t("inventory.receiptVoucher", "phiếu nhập");
    if (deleteTarget.type === "issue")
      return t("inventory.issueVoucher", "phiếu xuất");
    return t("inventory.adjustmentVoucher", "phiếu điều chỉnh");
  };

  const getCancelTypeLabel = () => {
    if (!cancelTarget) return "";
    if (cancelTarget.type === "receipt")
      return t("inventory.receiptVoucher", "phiếu nhập");
    if (cancelTarget.type === "issue")
      return t("inventory.issueVoucher", "phiếu xuất");
    return t("inventory.adjustmentVoucher", "phiếu điều chỉnh");
  };

  return (
    <>
      <ConfirmModal
        open={!!deleteTarget}
        title={t("confirmModal.deleteTitle", "Xác nhận xóa")}
        message={
          deleteTarget
            ? `${t("common.delete", "Xóa")} ${getDeleteTypeLabel()} "${deleteTarget.voucherNo}"? ${t(
                "inventory.confirmDeleteVoucherDesc",
                "Hành động này sẽ ẩn phiếu này khỏi danh sách.",
              )}`
            : ""
        }
        confirmLabel={t("common.delete", "Xóa")}
        cancelLabel={t("common.cancel", "Hủy")}
        onConfirm={() => void onDeleteConfirm()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!cancelTarget}
        title={t("inventory.confirmCancelTitle", "Xác nhận hủy phiếu")}
        message={
          cancelTarget
            ? `${t("inventory.cancelVoucher", "Hủy phiếu")} ${getCancelTypeLabel()} "${cancelTarget.voucherNo}"? ${t(
                "inventory.confirmCancelVoucherDesc",
                "Hệ thống sẽ tạo một bút toán đảo để cân bằng giá trị.",
              )}`
            : ""
        }
        confirmLabel={t("inventory.cancelVoucher", "Hủy phiếu")}
        cancelLabel={t("common.close", "Đóng")}
        onConfirm={() => void onCancelConfirm()}
        onCancel={() => {
          if (!grCancelId) setCancelTarget(null);
        }}
        loading={!!grCancelId}
        danger
      />
    </>
  );
}
