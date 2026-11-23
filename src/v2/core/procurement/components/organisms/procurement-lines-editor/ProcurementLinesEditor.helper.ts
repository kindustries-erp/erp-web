import type { ProcurementLineFormValue } from "../../../form/procurementLine.form";
import { procurementLineAmount } from "../../../form/procurementLine.form";
import type { ProcurementLineColumn } from "./ProcurementLinesEditor.columns";
import {
  lineReceivedQty,
  lineRemainingQty,
  procurementReceivedColumns,
} from "./ProcurementLinesEditor.columns.received";

const fmt = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 3 });

/** Chèn cột Đã nhận / Còn lại ngay sau cột Số lượng (khi `showReceived`). */
export function withReceivedColumns(
  base: ProcurementLineColumn[],
  showReceived: boolean,
): ProcurementLineColumn[] {
  if (!showReceived) return base;
  const qtyIndex = base.findIndex((col) => col.id === "qty");
  if (qtyIndex === -1) return base;
  return [
    ...base.slice(0, qtyIndex + 1),
    ...procurementReceivedColumns,
    ...base.slice(qtyIndex + 1),
  ];
}

/** Ô tổng ở chân bảng: số lượng, (đã nhận, còn lại), đơn giá và thành tiền. */
export function buildFooterCells(
  lines: ProcurementLineFormValue[],
  showReceived: boolean,
): Record<string, string> {
  const sum = (pick: (line: ProcurementLineFormValue) => number) =>
    lines.reduce((total, line) => total + pick(line), 0);
  return {
    qty: fmt(sum((l) => Number(l.qty) || 0)),
    ...(showReceived
      ? {
          received: fmt(sum(lineReceivedQty)),
          remaining: fmt(sum(lineRemainingQty)),
        }
      : {}),
    price: "—",
    amount: fmt(sum((l) => procurementLineAmount(l) ?? 0)),
  };
}
