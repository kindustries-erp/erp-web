import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  extractV2ApiError,
  isDocumentInUseError,
} from "@/v2/shared/utils/v2ApiError";
import type {
  PurchaseOrderFormValue,
  PurchaseOrderRecord,
} from "../../domain/purchaseOrder";
import type { PurchaseOrderApi } from "../purchaseOrderApi.type";
import type { PurchaseOrderKeys } from "../purchaseOrderKeys";

type Translate = (key: string, fallback?: string) => string;

export interface SavePurchaseOrderInput {
  id: string | null;
  form: PurchaseOrderFormValue;
}

export interface UsePurchaseOrderMutationsParams {
  api: PurchaseOrderApi;
  keys: PurchaseOrderKeys;
  t: Translate;
  onSaved?: () => void;
  /** Gọi sau khi duyệt, xác nhận hoặc hủy thành công (để làm mới chi tiết đang mở) */
  onActed?: () => void;
  onRemoved?: () => void;
}

/**
 * Năm thao tác ghi của PO: lưu, duyệt, xác nhận, hủy, xóa mềm.
 * Thành công: làm mới toàn bộ khóa của họ PO, báo toast và gọi callback tương ứng.
 * Lỗi: báo toast (trừ lỗi "chứng từ đang được dùng" đã có thông báo riêng).
 */
export function usePurchaseOrderMutations({
  api,
  keys,
  t,
  onSaved,
  onActed,
  onRemoved,
}: UsePurchaseOrderMutationsParams) {
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
    mutationFn: ({ id, form }: SavePurchaseOrderInput) =>
      id ? api.update(id, form) : api.create(form),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t("v2.purchaseOrders.form.saveSuccess", "Đã lưu thành công"),
      );
      onSaved?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t("v2.purchaseOrders.form.saveError", "Không thể lưu dữ liệu"),
      ),
  });

  const approve = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.approve(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t("v2.purchaseOrders.actions.approveSuccess", "Đã duyệt đơn mua hàng"),
      );
      onActed?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t("v2.purchaseOrders.actions.approveError", "Không thể duyệt đơn"),
      ),
  });

  const confirm = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.confirm(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t(
          "v2.purchaseOrders.actions.confirmSuccess",
          "Đã xác nhận đơn mua hàng",
        ),
      );
      onActed?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t("v2.purchaseOrders.actions.confirmError", "Không thể xác nhận đơn"),
      ),
  });

  const cancel = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.cancel(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(
        t("v2.purchaseOrders.actions.cancelSuccess", "Đã hủy đơn mua hàng"),
      );
      onActed?.();
    },
    onError: (error) =>
      notifyError(
        error,
        t("v2.purchaseOrders.actions.cancelError", "Không thể hủy đơn"),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.remove(id),
    onSuccess: async () => {
      await refresh();
      notifySuccess(t("v2.purchaseOrders.delete.success", "Đã xóa"));
      onRemoved?.();
    },
    onError: (error) =>
      notifyError(error, t("v2.purchaseOrders.delete.error", "Không thể xóa")),
  });

  return { save, approve, confirm, cancel, remove };
}
