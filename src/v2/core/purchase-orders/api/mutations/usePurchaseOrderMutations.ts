import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PurchaseOrderFormValue,
  PurchaseOrderRecord,
} from "../../domain/purchaseOrder";
import type { PurchaseOrderApi } from "../purchaseOrderApi.type";
import type { PurchaseOrderKeys } from "../purchaseOrderKeys";
import {
  notifyPurchaseOrderError,
  notifyPurchaseOrderSuccess,
} from "./purchaseOrderNotify";

type Translate = (key: string, fallback?: string) => string;

export interface SavePurchaseOrderInput {
  id: string | null;
  form: PurchaseOrderFormValue;
}

/** Đơn đã lưu nháp nhưng bước duyệt lỗi: giữ lại bản ghi để báo đúng trạng thái */
export class PurchaseOrderPartialApproveError extends Error {
  constructor(
    readonly saved: PurchaseOrderRecord,
    readonly cause: unknown,
  ) {
    super("PURCHASE_ORDER_SAVED_NOT_APPROVED");
    this.name = "PurchaseOrderPartialApproveError";
  }
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
 * Sáu thao tác ghi của PO: lưu nháp, lưu và duyệt, duyệt, xác nhận, hủy, xóa mềm.
 * Thành công: làm mới toàn bộ khóa của họ PO, báo toast và gọi callback tương ứng.
 * Lỗi: báo toast; lưu được nhưng duyệt lỗi thì báo riêng và vẫn đóng drawer.
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

  const save = useMutation({
    mutationFn: ({ id, form }: SavePurchaseOrderInput) =>
      id ? api.update(id, form) : api.create(form),
    onSuccess: async () => {
      await refresh();
      notifyPurchaseOrderSuccess(
        t("v2.purchaseOrders.form.saveSuccess", "Đã lưu thành công"),
      );
      onSaved?.();
    },
    onError: (error) =>
      notifyPurchaseOrderError(
        error,
        t("v2.purchaseOrders.form.saveError", "Không thể lưu dữ liệu"),
      ),
  });

  const saveAndApprove = useMutation({
    mutationFn: async ({ id, form }: SavePurchaseOrderInput) => {
      const saved = id ? await api.update(id, form) : await api.create(form);
      try {
        await api.approve(saved.id);
      } catch (cause) {
        throw new PurchaseOrderPartialApproveError(saved, cause);
      }
      return saved;
    },
    onSuccess: async () => {
      await refresh();
      notifyPurchaseOrderSuccess(
        t(
          "v2.purchaseOrders.form.saveAndApproveSuccess",
          "Đã lưu và duyệt đơn",
        ),
      );
      onSaved?.();
    },
    onError: async (error) => {
      if (error instanceof PurchaseOrderPartialApproveError) {
        await refresh();
        notifyPurchaseOrderError(
          error.cause,
          t(
            "v2.purchaseOrders.form.savedDraftApproveFailed",
            "Đã lưu nháp nhưng chưa duyệt được",
          ),
        );
        onSaved?.();
        return;
      }
      notifyPurchaseOrderError(
        error,
        t("v2.purchaseOrders.form.saveError", "Không thể lưu dữ liệu"),
      );
    },
  });

  const approve = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.approve(id),
    onSuccess: async () => {
      await refresh();
      notifyPurchaseOrderSuccess(
        t("v2.purchaseOrders.actions.approveSuccess", "Đã duyệt đơn mua hàng"),
      );
      onActed?.();
    },
    onError: (error) =>
      notifyPurchaseOrderError(
        error,
        t("v2.purchaseOrders.actions.approveError", "Không thể duyệt đơn"),
      ),
  });

  const confirm = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.confirm(id),
    onSuccess: async () => {
      await refresh();
      notifyPurchaseOrderSuccess(
        t(
          "v2.purchaseOrders.actions.confirmSuccess",
          "Đã xác nhận đơn mua hàng",
        ),
      );
      onActed?.();
    },
    onError: (error) =>
      notifyPurchaseOrderError(
        error,
        t("v2.purchaseOrders.actions.confirmError", "Không thể xác nhận đơn"),
      ),
  });

  const cancel = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.cancel(id),
    onSuccess: async () => {
      await refresh();
      notifyPurchaseOrderSuccess(
        t("v2.purchaseOrders.actions.cancelSuccess", "Đã hủy đơn mua hàng"),
      );
      onActed?.();
    },
    onError: (error) =>
      notifyPurchaseOrderError(
        error,
        t("v2.purchaseOrders.actions.cancelError", "Không thể hủy đơn"),
      ),
  });

  const remove = useMutation({
    mutationFn: (id: string): Promise<PurchaseOrderRecord> => api.remove(id),
    onSuccess: async () => {
      await refresh();
      notifyPurchaseOrderSuccess(
        t("v2.purchaseOrders.delete.success", "Đã xóa"),
      );
      onRemoved?.();
    },
    onError: (error) =>
      notifyPurchaseOrderError(
        error,
        t("v2.purchaseOrders.delete.error", "Không thể xóa"),
      ),
  });

  return { save, saveAndApprove, approve, confirm, cancel, remove };
}
