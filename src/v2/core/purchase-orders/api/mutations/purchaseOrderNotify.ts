import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";

/** Báo lỗi thao tác PO qua toast; bỏ qua lỗi "chứng từ đang được dùng" vì đã có thông báo riêng */
export const notifyPurchaseOrderError = (error: unknown, fallback: string) => {
  if (isDocumentInUseError(error)) return;
  useV2ToastStore.getState().showToast({
    variant: "destructive",
    title: fallback,
    description: extractV2ApiError(error, fallback),
  });
};

/** Báo thành công thao tác PO qua toast */
export const notifyPurchaseOrderSuccess = (title: string) =>
  useV2ToastStore.getState().showToast({ variant: "success", title });
