import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import type { GoodsReceiptModuleConfig } from "../goodsReceipts.config.type";
import {
  isGoodsReceiptFormDirty,
  validateGoodsReceiptForm,
} from "../domain/goodsReceiptRules";
import {
  GoodsReceiptStatus,
  type GoodsReceiptFormField,
} from "../domain/goodsReceipt";
import { useGoodsReceiptMutations } from "../api/mutations/useGoodsReceiptMutations";
import type { GoodsReceiptDrawerState } from "./GoodsReceiptDrawer.type";
import { useGoodsReceiptDrawerData } from "./GoodsReceiptDrawer.data.hook";

export interface UseGoodsReceiptDrawerParams {
  config: GoodsReceiptModuleConfig;
  state: GoodsReceiptDrawerState;
}

/** Hành động của drawer (lưu, ghi sổ, hủy) và trạng thái hiển thị; dữ liệu nằm ở data hook */
export function useGoodsReceiptDrawer({
  config,
  state,
}: UseGoodsReceiptDrawerParams) {
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const [mode, setMode] = React.useState(state.mode);
  const [errorField, setErrorField] =
    React.useState<GoodsReceiptFormField | null>(null);

  const data = useGoodsReceiptDrawerData({
    config,
    open: state.open,
    recordId: state.recordId,
  });
  const { form, initial, setField, creating } = data;

  const onRefreshDetail = async () => {
    if (state.recordId) {
      await queryClient.invalidateQueries({
        queryKey: config.keys.detail(state.recordId),
      });
    }
  };

  const { save, post, cancel } = useGoodsReceiptMutations({
    api: config.api,
    keys: config.keys,
    t,
    onSaved: state.onClose,
    onPosted: onRefreshDetail,
    onCancelled: onRefreshDetail,
  });

  const required = t(
    "v2.goodsReceipts.form.required",
    "Trường này là bắt buộc",
  );
  const fieldLabel = errorField
    ? t(`v2.goodsReceipts.columns.${errorField}`, errorField)
    : "";
  const errorMessage = errorField ? `${fieldLabel}: ${required}` : required;

  const submit = () => {
    const missing = validateGoodsReceiptForm(form, config.requiredFields);
    if (missing) {
      setErrorField(missing);
      const label = t(`v2.goodsReceipts.columns.${missing}`, missing);
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: t("v2.goodsReceipts.form.missingInfo", "Thiếu thông tin"),
        description: `${label}: ${required}`,
      });
      return;
    }
    setErrorField(null);
    save.mutate({ id: state.recordId, form });
  };

  const postRecord = () => {
    if (state.recordId) post.mutate(state.recordId);
  };

  const cancelRecord = () => {
    if (state.recordId) cancel.mutate(state.recordId);
  };

  const canEdit = state.canUpdate && form.status === GoodsReceiptStatus.DRAFT;
  const canPost =
    state.canUpdate &&
    form.status === GoodsReceiptStatus.DRAFT &&
    Boolean(state.recordId);
  const canCancel =
    state.canUpdate &&
    form.status === GoodsReceiptStatus.POSTED &&
    Boolean(state.recordId);

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
    posting: post.isPending,
    cancelling: cancel.isPending,
    dirty: isGoodsReceiptFormDirty(form, initial),
    errorField,
    errorMessage,
    submit,
    post: postRecord,
    cancel: cancelRecord,
    canEdit,
    canPost,
    canCancel,
    regenerateCode: data.regenerateCode,
  };
}
