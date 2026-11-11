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
  const [discardOpen, setDiscardOpen] = React.useState(false);

  const data = useGoodsReceiptDrawerData({
    config,
    open: state.open,
    recordId: state.recordId,
    prefill: state.prefill,
  });
  const { form, initial, setField, creating } = data;

  const onRefreshDetail = async () => {
    if (state.recordId) {
      await queryClient.invalidateQueries({
        queryKey: config.keys.detail(state.recordId),
      });
    }
  };

  /** Lưu xong: phiếu cũ về chế độ xem; phiếu mới đóng drawer */
  const handleSaved = () => {
    if (creating) state.onClose();
    else setMode("view");
  };

  const { save, post, cancel } = useGoodsReceiptMutations({
    api: config.api,
    keys: config.keys,
    t,
    onSaved: handleSaved,
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
    save.mutate({
      id: state.recordId,
      form: { ...form, status: GoodsReceiptStatus.DRAFT },
    });
  };

  const postRecord = () => {
    if (state.recordId) post.mutate(state.recordId);
  };

  const cancelRecord = () => {
    if (state.recordId) cancel.mutate(state.recordId);
  };

  /** Hủy sửa: tạo mới thì đóng; phiếu cũ có thay đổi thì hỏi trước, rồi về chế độ xem */
  const cancelEdit = () => {
    if (creating) state.onClose();
    else if (isGoodsReceiptFormDirty(form, initial)) setDiscardOpen(true);
    else setMode("view");
  };

  const confirmDiscard = () => {
    data.resetForm();
    setErrorField(null);
    setDiscardOpen(false);
    setMode("view");
  };

  // Phiếu cũ: chỉ coi là nháp/đã ghi sổ khi đã tải xong; trước đó form còn status mặc định
  const isLoadedRecord = Boolean(state.recordId) && data.loaded;
  const canEdit =
    state.canUpdate &&
    isLoadedRecord &&
    form.status === GoodsReceiptStatus.DRAFT;
  const canPost = canEdit;
  const canCancel =
    state.canUpdate &&
    isLoadedRecord &&
    form.status === GoodsReceiptStatus.POSTED;

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
    cancelEdit,
    discardOpen,
    closeDiscard: () => setDiscardOpen(false),
    confirmDiscard,
    post: postRecord,
    cancel: cancelRecord,
    canEdit,
    canPost,
    canCancel,
    regenerateCode: data.regenerateCode,
  };
}
