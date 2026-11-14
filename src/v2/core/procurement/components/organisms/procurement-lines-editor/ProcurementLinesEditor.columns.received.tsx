import { V2Text } from "@/v2/shared/components";
import { cn } from "@/v2/shared/utils/cn";
import { toNumberOrNull } from "../../../form/procurementLine.form";
import type { ProcurementLineColumn } from "./ProcurementLinesEditor.columns";

const fmtQty = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 3 });

/** Số đã nhận của một dòng (0 khi chưa có). */
export const lineReceivedQty = (line: { qtyFulfilled?: string }): number =>
  toNumberOrNull(line.qtyFulfilled) ?? 0;

/** Số còn phải nhận của một dòng, không âm. */
export const lineRemainingQty = (line: {
  qty: string;
  qtyFulfilled?: string;
}): number =>
  Math.max(0, (toNumberOrNull(line.qty) ?? 0) - lineReceivedQty(line));

/**
 * Cột Đã nhận / Còn lại của đơn mua đã phát hành (chỉ xem): theo dõi nhập hàng nhiều đợt.
 * Chèn ngay sau cột Số lượng.
 */
export const procurementReceivedColumns: ProcurementLineColumn[] = [
  {
    id: "received",
    headerKey: "v2.procurement.lines.received",
    defaultHeader: "Đã nhận",
    layout: { width: 96, align: "right" },
    renderCell: ({ line }) => (
      <V2Text className="tabular-nums text-xs text-right">
        {fmtQty(lineReceivedQty(line))}
      </V2Text>
    ),
  },
  {
    id: "remaining",
    headerKey: "v2.procurement.lines.remaining",
    defaultHeader: "Còn lại",
    layout: { width: 96, align: "right" },
    renderCell: ({ line }) => {
      const remaining = lineRemainingQty(line);
      return (
        <V2Text
          className={cn(
            "tabular-nums text-xs text-right font-semibold",
            remaining > 0 ? "text-primary" : "text-muted-fg",
          )}
        >
          {fmtQty(remaining)}
        </V2Text>
      );
    },
  },
];
