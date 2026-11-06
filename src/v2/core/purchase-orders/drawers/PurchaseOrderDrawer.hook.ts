import * as React from "react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import { usePurchaseOrderMutations } from "../api/mutations/usePurchaseOrderMutations";
import {
  canApprovePurchaseOrder,
  canCancelPurchaseOrder,
  canConfirmPurchaseOrder,
  canEditPurchaseOrder,
  isPurchaseOrderFormDirty,
  validatePurchaseOrderForm,
} from "../domain/purchaseOrderRules";
import type { PurchaseOrderFormField } from "../domain/purchaseOrder";
import type { PurchaseOrderDrawerState } from "./PurchaseOrderDrawer.type";
import { usePurchaseOrderDrawerData } from "./PurchaseOrderDrawer.data.hook";

export interface UsePurchaseOrderDrawerParams {
  config: PurchaseOrderModuleConfig;
  state: PurchaseOrderDrawerState;
}

/** Hành động của drawer (lưu nháp, lưu và duyệt, duyệt, xác nhận, hủy) và trạng thái hiển thị; dữ liệu nằm ở data hook */
export function usePurchaseOrderDrawer({
  config,
  state,
}: UsePurchaseOrderDrawerParams) {
  const { t } = useV2Translation();
  const [mode, setMode] = React.useState(state.mode);
  const [errorField, setErrorField] =
    React.useState<PurchaseOrderFormField | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [discardOpen, setDiscardOpen] = React.useState(false);

  const data = usePurchaseOrderDrawerData({
    config,
    open: state.open,
    recordId: state.recordId,
  });
  const { form, initial, setField, creating } = data;

  /** Lưu xong: đơn cũ về chế độ xem; đơn mới đóng drawer */
  const handleSaved = () => {
    if (creating) state.onClose();
    else setMode("view");
  };

  const { save, saveAndApprove, approve, confirm, cancel } =
    usePurchaseOrderMutations({
      api: config.api,
      keys: config.keys,
      t,
      onSaved: handleSaved,
      onActed: () => setCancelOpen(false),
    });

  const required = t(
    "v2.purchaseOrders.form.required",
    "Trường này là bắt buộc",
  );
  const fieldLabel = errorField
    ? t(`v2.purchaseOrders.columns.${errorField}`, errorField)
    : "";
  const errorMessage = errorField ? `${fieldLabel}: ${required}` : required;

  /** Kiểm tra trước mọi lần lưu; trả về true nếu hợp lệ */
  const validate = (): boolean => {
    const missing = validatePurchaseOrderForm(form, config.requiredFields);
    if (!missing) {
      setErrorField(null);
      return true;
    }
    setErrorField(missing);
    const label = t(`v2.purchaseOrders.columns.${missing}`, missing);
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: t("v2.purchaseOrders.form.missingInfo", "Thiếu thông tin"),
      description: `${label}: ${required}`,
    });
    return false;
  };

  /** Lưu giữ nguyên trạng thái: đơn mới và đơn nháp vẫn là NHÁP */
  const saveDraft = () => {
    if (validate()) save.mutate({ id: state.recordId, form });
  };

  /** Lưu rồi duyệt: NHÁP → ĐÃ DUYỆT */
  const saveAndApproveDraft = () => {
    if (validate()) saveAndApprove.mutate({ id: state.recordId, form });
  };

  /** Hủy sửa: tạo mới thì đóng; đơn cũ có thay đổi thì hỏi trước, rồi về chế độ xem */
  const cancelEdit = () => {
    if (creating) state.onClose();
    else if (isPurchaseOrderFormDirty(form, initial)) setDiscardOpen(true);
    else setMode("view");
  };

  const confirmDiscard = () => {
    data.resetForm();
    setErrorField(null);
    setDiscardOpen(false);
    setMode("view");
  };

  const id = state.recordId;
  const status = form.status;
  // Đơn cũ: chỉ đánh giá trạng thái khi đã tải xong; trước đó form còn status mặc định
  const loadedOrNew = creating || data.loaded;
  const canEdit =
    state.canUpdate && loadedOrNew && canEditPurchaseOrder(status);
  const canSaveAndApprove =
    state.canUpdate && loadedOrNew && canApprovePurchaseOrder(status);
  const canApprove =
    state.canUpdate &&
    Boolean(id) &&
    data.loaded &&
    canApprovePurchaseOrder(status);
  const canConfirm =
    state.canUpdate &&
    Boolean(id) &&
    data.loaded &&
    canConfirmPurchaseOrder(status);
  const canCancel =
    state.canUpdate &&
    Boolean(id) &&
    data.loaded &&
    canCancelPurchaseOrder(status);

  return {
    form,
    setField,
    mode,
    setMode,
    creating,
    codeEditable: creating,
    viewing: mode === "view" && !creating,
    loading: data.loading,
    saving: save.isPending || saveAndApprove.isPending,
    approving: approve.isPending,
    confirming: confirm.isPending,
    cancelling: cancel.isPending,
    dirty: isPurchaseOrderFormDirty(form, initial),
    errorField,
    errorMessage,
    saveDraft,
    saveAndApproveDraft,
    approve: () => {
      if (id) approve.mutate(id);
    },
    confirm: () => {
      if (id) confirm.mutate(id);
    },
    confirmCancel: () => {
      if (id) cancel.mutate(id);
    },
    cancelOpen,
    setCancelOpen,
    cancelEdit,
    discardOpen,
    closeDiscard: () => setDiscardOpen(false),
    confirmDiscard,
    regenerateNo: data.regenerateNo,
    canEdit,
    canSaveAndApprove,
    canApprove,
    canConfirm,
    canCancel,
  };
}

export type PurchaseOrderDrawerHook = ReturnType<typeof usePurchaseOrderDrawer>;
