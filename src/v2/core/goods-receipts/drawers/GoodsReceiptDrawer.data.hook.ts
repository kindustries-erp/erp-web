import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import { extractV2ApiError } from "@/v2/shared/utils/v2ApiError";
import type { GoodsReceiptModuleConfig } from "../goodsReceipts.config.type";
import {
  emptyGoodsReceiptForm,
  toGoodsReceiptForm,
  type GoodsReceiptFormValue,
} from "../domain/goodsReceipt";

export interface GoodsReceiptDrawerDataParams {
  config: GoodsReceiptModuleConfig;
  open: boolean;
  recordId: string | null;
}

/**
 * Dữ liệu của drawer: tải chi tiết, sinh mã phiếu mới qua React Query và giữ form.
 * Drawer được remount theo khóa (`key`) mỗi lần mở, nên không cần đồng bộ thủ công khi mở lại.
 */
export function useGoodsReceiptDrawerData({
  config,
  open,
  recordId,
}: GoodsReceiptDrawerDataParams) {
  const { api, keys } = config;
  const { t } = useV2Translation();
  const queryClient = useQueryClient();
  const creating = !recordId;

  const [form, setForm] = React.useState<GoodsReceiptFormValue>(
    emptyGoodsReceiptForm,
  );
  const [initial, setInitial] = React.useState<GoodsReceiptFormValue>(
    emptyGoodsReceiptForm,
  );

  const detail = useQuery({
    queryKey: keys.detail(recordId ?? "new"),
    queryFn: () => api.get(recordId!),
    enabled: open && Boolean(recordId),
  });

  const nextCode = useQuery({
    queryKey: keys.nextCode(),
    queryFn: () => api.nextCode(),
    enabled: open && creating,
    staleTime: 0,
  });

  // Đồng bộ dữ liệu server vào form (không gọi API ở đây)
  React.useEffect(() => {
    if (!open || !detail.data) return;
    const loaded = toGoodsReceiptForm(detail.data);
    setForm(loaded);
    setInitial(loaded);
  }, [open, detail.data]);

  // Phiếu mới bắt đầu từ form rỗng
  React.useEffect(() => {
    if (!open || !creating) return;
    const fresh = emptyGoodsReceiptForm();
    setForm(fresh);
    setInitial(fresh);
  }, [open, creating]);

  // Khi có mã phiếu tự sinh thì gán vào form
  React.useEffect(() => {
    const code = nextCode.data?.nextCode;
    if (!creating || !code) return;
    setForm((value) => ({ ...value, receiptNo: code }));
    setInitial((value) => ({ ...value, receiptNo: code }));
  }, [creating, nextCode.data]);

  React.useEffect(() => {
    const error = detail.error ?? nextCode.error;
    if (!error) return;
    const fallback = t(
      "v2.goodsReceipts.form.loadError",
      "Không thể tải dữ liệu",
    );
    useV2ToastStore.getState().showToast({
      variant: "destructive",
      title: fallback,
      description: extractV2ApiError(error, fallback),
    });
  }, [detail.error, nextCode.error, t]);

  const setField = <K extends keyof GoodsReceiptFormValue>(
    key: K,
    value: GoodsReceiptFormValue[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  /** Sinh lại mã mới khi người dùng bấm nút; dùng fetchQuery để không phụ thuộc effect */
  const regenerateCode = () => {
    void queryClient
      .fetchQuery({
        queryKey: keys.nextCode(),
        queryFn: () => api.nextCode(),
        staleTime: 0,
      })
      .then(({ nextCode: code }) => setField("receiptNo", code));
  };

  /** Bỏ thay đổi chưa lưu: đưa form về bản gốc */
  const resetForm = () => setForm(initial);

  return {
    form,
    initial,
    setField,
    resetForm,
    regenerateCode,
    creating,
    loading: detail.isFetching,
    /** Đã có dữ liệu server; trước đó form mang status DRAFT mặc định, không được dùng để quyết định quyền sửa */
    loaded: Boolean(detail.data),
  };
}
