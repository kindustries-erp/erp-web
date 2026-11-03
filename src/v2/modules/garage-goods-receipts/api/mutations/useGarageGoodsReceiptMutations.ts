import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import type { GarageGoodsReceiptFormValue } from "@/v2/modules/garage-goods-receipts/domain/entities/garageGoodsReceipt";
import { garageGoodsReceiptsV2Api } from "@/v2/modules/garage-goods-receipts/api/garageGoodsReceiptsApi";
import { garageGoodsReceiptsKeys } from "@/v2/modules/garage-goods-receipts/api/queries/garageGoodsReceiptsKeys";

type Translate = (key: string, fallback?: string) => string;

export interface SaveGarageGoodsReceiptInput {
  id: string | null;
  form: GarageGoodsReceiptFormValue;
}

/** Tạo mới hoặc cập nhật; thành công làm mới danh sách và chạy `onSaved` */
export function useSaveGarageGoodsReceiptMutation(
  t: Translate,
  onSaved: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: SaveGarageGoodsReceiptInput) =>
      id
        ? garageGoodsReceiptsV2Api.update(id, form)
        : garageGoodsReceiptsV2Api.create(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: garageGoodsReceiptsKeys.all,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t(
          "v2.garageGoodsReceipts.form.saveSuccess",
          "Đã lưu thành công",
        ),
      });
      onSaved();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.garageGoodsReceipts.form.saveError",
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

/** Ghi sổ nhập kho; thành công cập nhật trạng thái POSTED và tăng tồn kho */
export function usePostGarageGoodsReceiptMutation(
  t: Translate,
  onPosted: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => garageGoodsReceiptsV2Api.post(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: garageGoodsReceiptsKeys.all,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t(
          "v2.garageGoodsReceipts.actions.postSuccess",
          "Ghi sổ nhập kho thành công",
        ),
      });
      onPosted();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.garageGoodsReceipts.actions.postError",
        "Không thể ghi sổ nhập kho",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}

/** Hủy phiếu nhập kho */
export function useCancelGarageGoodsReceiptMutation(
  t: Translate,
  onCancelled: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => garageGoodsReceiptsV2Api.cancel(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: garageGoodsReceiptsKeys.all,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t(
          "v2.garageGoodsReceipts.actions.cancelSuccess",
          "Hủy phiếu nhập kho thành công",
        ),
      });
      onCancelled();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.garageGoodsReceipts.actions.cancelError",
        "Không thể hủy phiếu nhập kho",
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
export function useRemoveGarageGoodsReceiptMutation(
  t: Translate,
  onRemoved: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => garageGoodsReceiptsV2Api.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: garageGoodsReceiptsKeys.all,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.garageGoodsReceipts.delete.success", "Đã xóa"),
      });
      onRemoved();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.garageGoodsReceipts.delete.error",
        "Không thể xóa",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}
