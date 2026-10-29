import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import { cashVouchersV2Api } from "../cashVouchersApi";
import type { CreateCashVoucherDto } from "../dtos/cashVoucher.dto";
import { cashVouchersKeys } from "../queries/cashVouchersKeys";

type Translate = (key: string, fallback?: string) => string;

/** Tạo phiếu thu/chi; thành công làm mới sao kê và chạy `onCreated` */
export function useCreateCashVoucherMutation(
  t: Translate,
  onCreated: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCashVoucherDto) =>
      cashVouchersV2Api.createManual(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: cashVouchersKeys.transactions,
      });
      useV2ToastStore.getState().showToast({
        variant: "success",
        title: t("v2.cashVouchers.form.saveSuccess", "Đã lưu phiếu thu/chi"),
      });
      onCreated();
    },
    onError: (error) => {
      if (isDocumentInUseError(error)) return;
      const fallback = t(
        "v2.cashVouchers.form.saveError",
        "Không thể lưu phiếu",
      );
      useV2ToastStore.getState().showToast({
        variant: "destructive",
        title: fallback,
        description: extractV2ApiError(error, fallback),
      });
    },
  });
}
