import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import type {
  GoodsReceiptFormValue,
  GoodsReceiptRecord,
} from "../../domain/goodsReceipt";
import type { GoodsReceiptApi } from "../goodsReceiptApi.type";
import type { GoodsReceiptKeys } from "../goodsReceiptKeys";

type Translate = (key: string, fallback?: string) => string;

export interface SaveGoodsReceiptInput {
  id: string | null;
  form: GoodsReceiptFormValue;
}

export interface UseGoodsReceiptMutationsParams {
  api: GoodsReceiptApi;
  keys: GoodsReceiptKeys;
  t: Translate;
  onSaved?: () => void;
  onPosted?: () => void;
  onCancelled?: () => void;
  onRemoved?: () => void;
}

/**
 * Bốn thao tác ghi của phiếu nhập: lưu, ghi sổ, hủy, xóa mềm.
 * Thành công: làm mới toàn bộ khóa của họ phiếu, báo toast và gọi callback tương ứng.
 * Lỗi: báo toast (trừ lỗi "chứng từ đang được dùng" đã có thông báo riêng).
 */
export function useGoodsReceiptMutations({
  api,
  keys,
  t,
  onSaved,
  onPosted,
  onCancelled,
  onRemoved,
}: UseGoodsReceiptMutationsParams) {
  const queryClient = useQueryClient();

  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.all });

  const notifyError = (error: unknown, fallback: string) => {
    if (isDocumentInUseError(error)) return;
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(error, fallback),
    });
  };

  const notifySuccess = (title: string) =>
    useV2ToastStore.getState().showToast({ variant: "success", title });

  const save = useMutation({
    mutationFn: ({ id, form }: SaveGoodsReceiptInput) =>
      id ? api.update(id, form) : api.create(form),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t("v2.goodsReceipts.form.saveSuccess", "Đã lưu thành công"),
      );
      onSaved?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t("v2.goodsReceipts.form.saveError", "Không thể lưu dữ liệu"),
      ),
  });

  const post = useMutation({
    mutationFn: (id: string): Promise<GoodsReceiptRecord> => api.post(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t("v2.goodsReceipts.actions.postSuccess", "Ghi sổ nhập kho thành công"),
      );
      onPosted?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t("v2.goodsReceipts.actions.postError", "Không thể ghi sổ nhập kho"),
      ),
  });

  const cancel = useMutation({
    mutationFn: (id: string): Promise<GoodsReceiptRecord> => api.cancel(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t(
          "v2.goodsReceipts.actions.cancelSuccess",
          "Hủy phiếu nhập kho thành công",
        ),
      );
      onCancelled?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t(
          "v2.goodsReceipts.actions.cancelError",
          "Không thể hủy phiếu nhập kho",
        ),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string): Promise<GoodsReceiptRecord> => api.remove(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(t("v2.goodsReceipts.delete.success", "Đã xóa"));
      onRemoved?.();
    },
    onError: (error) =>
      notifyError(error, t("v2.goodsReceipts.delete.error", "Không thể xóa")),
  });

  return { save, post, cancel, remove };
}
