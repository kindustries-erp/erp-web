import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { financeInvoiceV2Api } from "@/v2/modules/finance-invoice/api/financeInvoiceV2Api";
import type { InvoiceDto } from "@/v2/modules/finance-invoice/api/dtos/invoice.dto";
import {
  clampNetOffAmount,
  defaultNetOffAmount,
  exceedsNetOffLimit,
  invoiceRemaining,
} from "../../../domain/rules/netOffAllocation";

export interface NetOffInvoiceRow {
  id: string;
  invoiceNo: string;
  invoiceDate: string | null;
  partner: string;
  total: number;
  remaining: number;
}

export interface NetOffPayloadItem {
  invoiceId: string;
  netOffAmount: number;
}

export interface UseCashInvoiceNetOffPickerInput {
  open: boolean;
  direction: "IN" | "OUT";
  existingInvoiceIds: string[];
  maxAvailableAmount: number;
}

/** Hóa đơn còn số dư, đối tác lấy theo chiều: IN là người bán, OUT là người mua */
export const toNetOffRow = (
  inv: InvoiceDto,
  direction: "IN" | "OUT",
): NetOffInvoiceRow => {
  const total = Number(inv.totalAmount || 0);
  return {
    id: inv.id,
    invoiceNo: [inv.serialNo, inv.invoiceNo].filter(Boolean).join("-"),
    invoiceDate: inv.invoiceDate ?? null,
    partner:
      (direction === "IN" ? inv.sellerName : inv.buyerName) ||
      inv.partner ||
      "",
    total,
    remaining: invoiceRemaining(total, Number(inv.netOffAmount || 0)),
  };
};

/** Chọn hóa đơn để cấn trừ: lọc hóa đơn đã liên kết và hết số dư, phân bổ số tiền có chặn hạn mức */
export function useCashInvoiceNetOffPicker({
  open,
  direction,
  existingInvoiceIds,
  maxAvailableAmount,
}: UseCashInvoiceNetOffPickerInput) {
  const query = useQuery({
    queryKey: ["cash-netoff-invoices", direction],
    queryFn: () =>
      financeInvoiceV2Api.list({ direction, page: 1, pageSize: 50 }),
    enabled: open,
  });

  const rows = React.useMemo(
    () =>
      (query.data?.items ?? [])
        .map((inv) => toNetOffRow(inv, direction))
        .filter(
          (row) => !existingInvoiceIds.includes(row.id) && row.remaining > 0,
        ),
    [query.data, direction, existingInvoiceIds],
  );
  const rowById = React.useMemo(
    () => new Map(rows.map((r) => [r.id, r])),
    [rows],
  );

  const [amounts, setAmounts] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    if (!open) setAmounts({});
  }, [open]);

  const values = Object.values(amounts);
  const total = values.reduce((sum, v) => sum + v, 0);
  const exceeds = exceedsNetOffLimit(values, maxAvailableAmount);
  const payload: NetOffPayloadItem[] = Object.entries(amounts)
    .filter(([, value]) => value > 0)
    .map(([invoiceId, netOffAmount]) => ({ invoiceId, netOffAmount }));

  /** Chọn thêm hóa đơn: dòng mới lấy phần còn lại của hạn mức, trừ dần theo từng dòng; bỏ chọn thì xóa khỏi phân bổ */
  const setSelectedKeys = (keys: string[]) =>
    setAmounts((prev) => {
      let budget =
        maxAvailableAmount - Object.values(prev).reduce((sum, v) => sum + v, 0);
      const next: Record<string, number> = {};
      for (const key of keys) {
        const row = rowById.get(key);
        if (!row) continue;
        if (prev[key] !== undefined) {
          next[key] = prev[key];
          continue;
        }
        next[key] = defaultNetOffAmount(row.remaining, budget);
        budget -= next[key];
      }
      return next;
    });

  const setAmount = (key: string, value: number) =>
    setAmounts((prev) => {
      const row = rowById.get(key);
      if (!row) return prev;
      return { ...prev, [key]: clampNetOffAmount(value, row.remaining) };
    });

  return {
    rows,
    loading: query.isFetching,
    selectedKeys: Object.keys(amounts),
    amounts,
    total,
    exceeds,
    payload,
    canConfirm: payload.length > 0 && !exceeds,
    setSelectedKeys,
    setAmount,
  };
}
