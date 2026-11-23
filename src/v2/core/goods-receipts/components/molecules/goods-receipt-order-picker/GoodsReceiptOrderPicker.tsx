import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { V2Combobox, V2ReadValue } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { GoodsReceiptSourceOrderLoader } from "../../../goodsReceipts.config.type";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Chọn đơn mua nguồn của phiếu nhập (combobox có tìm kiếm trên server).
 * `locked` hoặc `viewing` thì chỉ hiện số đơn. `onPick(null)` khi bỏ chọn.
 */
export function GoodsReceiptOrderPicker({
  sourceOrder,
  value,
  label,
  viewing,
  locked,
  onPick,
}: {
  sourceOrder: GoodsReceiptSourceOrderLoader;
  value: string;
  /** Số đơn mua đang chọn, dùng làm nhãn khi chưa có trong danh sách tìm kiếm */
  label: string;
  viewing: boolean;
  /** Phiếu đã gắn đơn: không đổi được */
  locked: boolean;
  onPick: (orderId: string | null) => void;
}) {
  const { t } = useV2Translation();
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const timer = window.setTimeout(
      () => setDebounced(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  const readOnly = viewing || locked;
  const options = useQuery({
    queryKey: ["v2-goods-receipts", "source-order-options", debounced],
    queryFn: async () =>
      (await sourceOrder.search(debounced.trim())).map((order) => ({
        value: order.id,
        label: order.orderNo,
        description:
          [
            order.supplierName,
            Number(order.totalAmount || 0).toLocaleString("vi-VN"),
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
      })),
    staleTime: 30_000,
    enabled: !readOnly,
  });

  if (readOnly) return <V2ReadValue value={label || "—"} />;

  return (
    <V2Combobox
      aria-label={t("v2.goodsReceipts.columns.sourceOrderId", "Đơn mua")}
      placeholder={t(
        "v2.goodsReceipts.form.orderPlaceholder",
        "Chọn đơn mua đã phát hành",
      )}
      options={options.data ?? []}
      loading={options.isFetching}
      value={value || null}
      fallbackLabel={label || undefined}
      onSearchChange={setSearch}
      clearable
      onValueChange={(v) => onPick(v ?? null)}
    />
  );
}
