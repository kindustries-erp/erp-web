import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import type { InvoiceDebtFormValue } from "../../domain/entities/invoiceDebt";
import { invoiceDebtsV2Api } from "../invoiceDebtsApi";
import { invoiceDebtsKeys } from "../queries/invoiceDebtsKeys";

type Translate = (key: string, fallback?: string) => string;

export interface SaveInvoiceDebtInput {
  id: string | null;
  form: InvoiceDebtFormValue;
}

/** Tạo mới hoặc cập nhật; thành công làm mới danh sách và chạy `onSaved` */
export function useSaveInvoiceDebtMutation(t: Translate, onSaved: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: SaveInvoiceDebtInput) =>
      id ? invoiceDebtsV2Api.update(id, form) : invoiceDebtsV2Api.create(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoiceDebtsKeys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.invoiceDebts.form.saveSuccess", "Đã lưu thành công"),
      });
      onSaved();
    },
    onError: (error) => {
      // Chứng từ đang tham chiếu đã được modal DOCUMENT_IN_USE giải thích
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.invoiceDebts.form.saveError",
        "Không thể lưu dữ liệu",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}

/** Xóa mềm; thành công làm mới danh sách và chạy `onRemoved` */
export function useRemoveInvoiceDebtMutation(
  t: Translate,
  onRemoved: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceDebtsV2Api.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: invoiceDebtsKeys.all });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.invoiceDebts.delete.success", "Đã xóa"),
      });
      onRemoved();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t("v2.invoiceDebts.delete.error", "Không thể xóa");
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}
