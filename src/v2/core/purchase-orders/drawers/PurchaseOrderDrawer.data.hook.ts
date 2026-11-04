import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import {
  emptyPurchaseOrderForm,
  toPurchaseOrderForm,
  type PurchaseOrderFormValue,
} from "../domain/purchaseOrder";

export interface PurchaseOrderDrawerDataParams {
  config: PurchaseOrderModuleConfig;
  open: boolean;
  recordId: string | null;
}

/**
 * Dữ liệu của drawer: tải chi tiết, sinh số đơn mới qua React Query và giữ form.
 * Drawer được remount theo khóa (`key`) mỗi lần mở, nên không cần đồng bộ thủ công khi mở lại.
 */
export function usePurchaseOrderDrawerData({
  config,
  open,
  recordId,
}: PurchaseOrderDrawerDataParams) {
  const { api, keys } = config;
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const creating = !recordId;

  const [form, setForm] = React.useState<PurchaseOrderFormValue>(
    emptyPurchaseOrderForm,
  );
  const [initial, setInitial] = React.useState<PurchaseOrderFormValue>(
    emptyPurchaseOrderForm,
  );

  const detail = useQuery({
    queryKey: keys.detail(recordId ?? "new"),
    queryFn: () => api.get(recordId!),
    enabled: open && Boolean(recordId),
  });

  const nextNo = useQuery({
    queryKey: keys.nextNo(),
    queryFn: () => api.nextNo(),
    enabled: open && creating,
    staleTime: 0,
  });

  // Đồng bộ dữ liệu server vào form (chỉ đọc cache, không gọi API ở đây)
  React.useEffect(() => {
    if (!open || !detail.data) return;
    const loaded = toPurchaseOrderForm(detail.data);
    setForm(loaded);
    setInitial(loaded);
  }, [open, detail.data]);

  // Đơn mới bắt đầu từ form rỗng
  React.useEffect(() => {
    if (!open || !creating) return;
    const fresh = emptyPurchaseOrderForm();
    setForm(fresh);
    setInitial(fresh);
  }, [open, creating]);

  // Khi có số đơn tự sinh thì gán vào form
  React.useEffect(() => {
    const no = nextNo.data?.nextNo;
    if (!creating || !no) return;
    setForm((value) => ({ ...value, poNo: no }));
    setInitial((value) => ({ ...value, poNo: no }));
  }, [creating, nextNo.data]);

  React.useEffect(() => {
    const error = detail.error ?? nextNo.error;
    if (!error) return;
    const fallback = t(
      "v2.purchaseOrders.form.loadError",
      "Không thể tải dữ liệu",
    );
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(error, fallback),
    });
  }, [detail.error, nextNo.error, t]);

  const setField = <K extends keyof PurchaseOrderFormValue>(
    key: K,
    value: PurchaseOrderFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  /** Sinh lại số mới khi người dùng bấm nút; dùng fetchQuery để không phụ thuộc effect */
  const regenerateNo = () => {
    void queryClient
      .fetchQuery({
        queryKey: keys.nextNo(),
        queryFn: () => api.nextNo(),
        staleTime: 0,
      })
      .then(({ nextNo: no }) => setField("poNo", no));
  };

  return {
    form,
    initial,
    setField,
    regenerateNo,
    creating,
    loading: detail.isFetching,
  };
}
