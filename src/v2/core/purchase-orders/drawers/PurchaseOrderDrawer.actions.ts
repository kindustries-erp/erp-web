import type { DrawerAction } from "@/v2/shared/components";
import { PurchaseOrderStatus } from "../domain/purchaseOrderConstants";
import type { PurchaseOrderDrawerHook } from "./PurchaseOrderDrawer.hook";

type Translate = (key: string, fallback?: string) => string;

export interface BuildPurchaseOrderDrawerActionsParams {
  t: Translate;
  state: PurchaseOrderDrawerHook;
  onClose: () => void;
  /** Hủy sửa: về chế độ xem (có xác nhận nếu đã đổi) */
  onCancelEdit: () => void;
}

/** Nút chế độ xem: Đóng cùng các hành động chuyển trạng thái theo quyền và trạng thái */
const buildViewingActions = ({
  t,
  state,
  onClose,
}: BuildPurchaseOrderDrawerActionsParams): DrawerAction[] => {
  const busy = state.approving || state.confirming || state.cancelling;
  const actions: DrawerAction[] = [
    {
      label: t("v2.common.close", "Đóng"),
      onClick: onClose,
      variant: "outline",
    },
  ];
  if (state.canCancel) {
    actions.unshift({
      label: t("v2.purchaseOrders.actions.cancel", "Hủy đơn"),
      onClick: () => state.setCancelOpen(true),
      variant: "outline",
      loading: state.cancelling,
      disabled: busy,
    });
  }
  if (state.canConfirm) {
    actions.unshift({
      label: t("v2.purchaseOrders.actions.confirm", "Xác nhận"),
      onClick: state.confirm,
      variant: "outline",
      loading: state.confirming,
      disabled: busy,
    });
  }
  if (state.canApprove) {
    actions.unshift({
      label: t("v2.purchaseOrders.actions.approve", "Duyệt đơn"),
      onClick: state.approve,
      primary: true,
      loading: state.approving,
      disabled: busy,
    });
  }
  return actions;
};

/**
 * Nút chế độ sửa/tạo. Đơn còn NHÁP: [Hủy, Lưu nháp, Lưu (lưu rồi duyệt)].
 * Đơn đã duyệt trở đi: [Hủy, Lưu] (chỉ lưu nội dung, không đổi trạng thái).
 */
const buildEditingActions = ({
  t,
  state,
  onCancelEdit,
}: BuildPurchaseOrderDrawerActionsParams): DrawerAction[] => {
  const cancel: DrawerAction = {
    label: t("v2.common.cancel", "Hủy"),
    onClick: onCancelEdit,
    variant: "outline",
    disabled: state.saving,
  };
  const saveDisabled = state.saving || state.loading;
  if (state.form.status !== PurchaseOrderStatus.DRAFT) {
    return [
      cancel,
      {
        label: t("v2.purchaseOrders.actions.save", "Lưu"),
        onClick: state.saveDraft,
        primary: true,
        loading: state.saving,
        disabled: saveDisabled,
      },
    ];
  }
  const saveDraft: DrawerAction = {
    label: t("v2.purchaseOrders.actions.saveDraft", "Lưu nháp"),
    onClick: state.saveDraft,
    variant: "outline",
    loading: state.saving,
    disabled: saveDisabled,
  };
  if (!state.canSaveAndApprove) {
    return [cancel, { ...saveDraft, variant: undefined, primary: true }];
  }
  return [
    cancel,
    saveDraft,
    {
      label: t("v2.purchaseOrders.actions.save", "Lưu"),
      onClick: state.saveAndApproveDraft,
      primary: true,
      loading: state.saving,
      disabled: saveDisabled,
    },
  ];
};

/** Chọn bộ nút của drawer theo chế độ đang xem hay đang sửa */
export const buildPurchaseOrderDrawerActions = (
  params: BuildPurchaseOrderDrawerActionsParams,
): DrawerAction[] =>
  params.state.viewing
    ? buildViewingActions(params)
    : buildEditingActions(params);
