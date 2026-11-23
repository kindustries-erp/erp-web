import * as React from "react";
import { format } from "date-fns";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { V2Text } from "@/v2/shared/components";
import type { StockLedgerDisplayRow } from "./stockLedgerCalculator";

interface StockLedgerTableRowProps {
  row: StockLedgerDisplayRow;
  index: number;
  onOpenDocument?: (docType: string, docId: string) => void;
}

const num = (val: number) => Number(val ?? 0).toLocaleString("vi-VN");
const money = (val: number) =>
  val ? `${Number(val).toLocaleString("vi-VN")} ₫` : "—";

const cellBase = "px-3 py-2 border-r border-border/15 dark:border-white/[0.02]";
const cellDivider =
  "px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40";

const tintIn =
  "bg-amber-500/[0.025] dark:bg-amber-500/[0.04] group-hover:bg-amber-500/[0.06] dark:group-hover:bg-amber-500/[0.08]";
const tintOut =
  "bg-emerald-500/[0.025] dark:bg-emerald-500/[0.04] group-hover:bg-emerald-500/[0.06] dark:group-hover:bg-emerald-500/[0.08]";
const tintAdj =
  "bg-orange-500/[0.025] dark:bg-orange-500/[0.04] group-hover:bg-orange-500/[0.06] dark:group-hover:bg-orange-500/[0.08]";
const tintStock =
  "bg-slate-500/[0.02] dark:bg-zinc-500/[0.03] group-hover:bg-slate-500/[0.05] dark:group-hover:bg-zinc-500/[0.06]";

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  RECEIPT: "Nhập kho",
  PURCHASE_RECEIPT: "Nhập mua hàng",
  OTHER_RECEIPT: "Nhập khác",
  RECEIPT_CANCEL: "Hủy nhập kho",
  ISSUE: "Xuất kho",
  ISSUE_CANCEL: "Hủy xuất kho",
  ADJUSTMENT: "Điều chỉnh",
  ADJUSTMENT_CANCEL: "Hủy điều chỉnh",
  INVENTORY_COUNT: "Kiểm kê kho",
};

export function StockLedgerTableRow({
  row,
  index,
  onOpenDocument,
}: StockLedgerTableRowProps) {
  const formattedDate = row.transactionDate
    ? format(new Date(row.transactionDate), "dd/MM/yyyy")
    : "—";

  const formattedTime = row.createdAt
    ? format(new Date(row.createdAt), "HH:mm:ss")
    : null;

  const displayType =
    TRANSACTION_TYPE_LABELS[row.transactionType] || row.transactionType;

  return (
    <TableRow className="group border-b border-border/20 dark:border-white/[0.03] hover:bg-muted/40 transition-colors">
      {/* 1. STT */}
      <TableCell
        className={`${cellBase} text-center text-muted-foreground font-mono text-xs w-11`}
      >
        {index + 1}
      </TableCell>

      {/* 2. Ngày */}
      <TableCell
        className={`${cellBase} text-center text-foreground text-xs whitespace-nowrap`}
      >
        <div className="font-medium">{formattedDate}</div>
        {formattedTime && (
          <div className="text-[10px] text-muted-foreground font-mono leading-none mt-0.5">
            {formattedTime}
          </div>
        )}
      </TableCell>

      {/* 3. Nghiệp vụ */}
      <TableCell className={`${cellBase} text-left text-xs font-medium`}>
        {displayType}
      </TableCell>

      {/* 4. Số phiếu */}
      <TableCell className={`${cellDivider} text-center text-xs`}>
        {row.documentNo ? (
          <button
            type="button"
            onClick={() => onOpenDocument?.(row.documentType, row.documentId)}
            className="text-primary hover:underline font-medium cursor-pointer inline-flex items-center justify-center bg-transparent border-none p-0 text-xs"
          >
            {row.documentNo}
          </button>
        ) : (
          <V2Text as="span" className="text-muted-foreground">
            —
          </V2Text>
        )}
      </TableCell>

      {/* 5. Nhập */}
      <TableCell
        className={`${cellBase} ${tintIn} text-right font-medium text-amber-700 dark:text-amber-400 tabular-nums`}
      >
        {row.qtyIn > 0 ? num(row.qtyIn) : "—"}
      </TableCell>

      {/* 6. Xuất */}
      <TableCell
        className={`${cellBase} ${tintOut} text-right font-medium text-emerald-700 dark:text-emerald-400 tabular-nums`}
      >
        {row.qtyOut > 0 ? num(row.qtyOut) : "—"}
      </TableCell>

      {/* 7. Điều chỉnh */}
      <TableCell
        className={`${cellBase} ${tintAdj} text-right font-medium tabular-nums ${
          row.qtyAdjusted > 0
            ? "text-emerald-600 dark:text-emerald-400"
            : row.qtyAdjusted < 0
              ? "text-orange-600 dark:text-orange-400"
              : "text-muted-foreground"
        }`}
      >
        {row.qtyAdjusted !== 0
          ? row.qtyAdjusted > 0
            ? `+${num(row.qtyAdjusted)}`
            : num(row.qtyAdjusted)
          : "—"}
      </TableCell>

      {/* 8. Tồn */}
      <TableCell
        className={`${cellBase} ${tintStock} text-right font-bold tabular-nums`}
      >
        <V2Text
          as="span"
          className={
            row.isNegativeBalance
              ? "text-destructive font-bold"
              : "text-foreground"
          }
        >
          {num(row.balanceQty)}
        </V2Text>
      </TableCell>

      {/* 9. Đơn giá */}
      <TableCell
        className={`${cellDivider} text-right text-muted-foreground tabular-nums text-xs font-mono`}
      >
        {money(row.unitCost)}
      </TableCell>
    </TableRow>
  );
}
