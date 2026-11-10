import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";

/** Hiện lỗi API của thao tác chứng từ; `fallback` dùng khi không đọc được thông điệp. */
export function showProcurementError(error: unknown, fallback: string): void {
  useV2ToastStore.getState().showToast({
    variant: "destructive",
    title: fallback,
    description: extractV2ApiError(error, fallback),
  });
}

export function showProcurementSuccess(title: string): void {
  useV2ToastStore.getState().showToast({ variant: "success", title });
}

export function showProcurementWarning(
  title: string,
  description: string,
): void {
  useV2ToastStore.getState().showToast({
    variant: "destructive",
    title,
    description,
  });
}
