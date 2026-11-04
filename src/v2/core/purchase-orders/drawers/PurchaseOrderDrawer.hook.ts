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

/** Hành động của drawer (lưu, duyệt, xác nhận, hủy) và trạng thái hiển thị; dữ liệu nằm ở data hook */
export function usePurchaseOrderDrawer({
  config,
  state,
}: UsePurchaseOrderDrawerParams) {
  const { t } = useV2Translation();
  const [mode, setMode] = React.useState(state.mode);
  const [errorField, setErrorField] =
    React.useState<PurchaseOrderFormField | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  const data = usePurchaseOrderDrawerData({
    config,
    open: state.open,
    recordId: state.recordId,
  });
  const { form, initial, setField, creating } = data;

  const { save, approve, confirm, cancel } = usePurchaseOrderMutations({
    api: config.api,
    keys: config.keys,
    t,
    onSaved: state.onClose,
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

  const submit = () => {
    const missing = validatePurchaseOrderForm(form, config.requiredFields);
    if (missing) {
      setErrorField(missing);
      const label = t(`v2.purchaseOrders.columns.${missing}`, missing);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.purchaseOrders.form.missingInfo", "Thiếu thông tin"),
        description: `${label}: ${required}`,
      });
      return;
    }
    setErrorField(null);
    save.mutate({ id: state.recordId, form });
  };

  const id = state.recordId;
  const status = form.status;
  const canEdit = state.canUpdate && canEditPurchaseOrder(status);
  const canApprove =
    state.canUpdate && Boolean(id) && canApprovePurchaseOrder(status);
  const canConfirm =
    state.canUpdate && Boolean(id) && canConfirmPurchaseOrder(status);
  const canCancel =
    state.canUpdate && Boolean(id) && canCancelPurchaseOrder(status);

  return {
    form,
    setField,
    mode,
    setMode,
    creating,
    codeEditable: creating,
    viewing: mode === "view" && !creating,
    loading: data.loading,
    saving: save.isPending,
    approving: approve.isPending,
    confirming: confirm.isPending,
    cancelling: cancel.isPending,
    dirty: isPurchaseOrderFormDirty(form, initial),
    errorField,
    errorMessage,
    submit,
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
    regenerateNo: data.regenerateNo,
    canEdit,
    canApprove,
    canConfirm,
    canCancel,
  };
}

export type PurchaseOrderDrawerHook = ReturnType<typeof usePurchaseOrderDrawer>;
