import React from "react";
import { format } from "date-fns";
import { money } from "@/shared/utils/format";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableCell, TableRow } from "@/shared/components/ui/table";
import { GarageMarginBadge } from "@/modules/garage/components/atoms/garage-margin-badge";
import { LedgerDisplayRow } from "./fifoTransform";
import { FifoRowBadges } from "./FifoRowBadges";

const QTY_FORMAT = { minimumFractionDigits: 0, maximumFractionDigits: 2 };

interface FifoTableRowProps {
  row: LedgerDisplayRow;
  index: number;
  onOpenInvoice: (invoiceId: string) => void;
}

/** Một dòng dữ liệu của bảng FIFO: nhập, xuất, tồn và hiệu quả với các sắc thái màu riêng biệt. */
export function FifoTableRow({ row, index, onOpenInvoice }: FifoTableRowProps) {
  const cellBase =
    "px-3 py-2 border-r border-border/15 dark:border-white/[0.02]";
  const cellDivider =
    "px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40";

  const tintIn =
    "bg-amber-500/[0.025] dark:bg-amber-500/[0.04] group-hover:bg-amber-500/[0.06] dark:group-hover:bg-amber-500/[0.08]";
  const tintOut =
    "bg-emerald-500/[0.025] dark:bg-emerald-500/[0.04] group-hover:bg-emerald-500/[0.06] dark:group-hover:bg-emerald-500/[0.08]";
  const tintStock =
    "bg-slate-500/[0.02] dark:bg-zinc-500/[0.03] group-hover:bg-slate-500/[0.05] dark:group-hover:bg-zinc-500/[0.06]";
  const tintPerf =
    "bg-purple-500/[0.025] dark:bg-purple-500/[0.04] group-hover:bg-purple-500/[0.06] dark:group-hover:bg-purple-500/[0.08]";

  return (
    <TableRow className="group border-b border-border/20 dark:border-white/[0.03] hover:bg-surface-hover dark:hover:bg-zinc-800/40 transition-colors">
      <TableCell
        className={`${cellBase} text-center text-muted-foreground font-mono text-xs`}
      >
        {index + 1}
      </TableCell>

      {/* THÔNG TIN CHUNG */}
      <TableCell className={`${cellBase} text-center text-foreground text-xs`}>
        {row.transactionDate
          ? format(new Date(row.transactionDate), "dd/MM/yyyy")
          : ""}
      </TableCell>
      <TableCell className={`${cellDivider} text-center`}>
        {row.invoiceNo && (
          <TableText
            text={row.invoiceNo}
            tooltip={[row.invoiceNo, row.partnerName, row.partnerTaxCode]
              .filter(Boolean)
              .join(" - ")}
            enableCopy={false}
            onDrawerClick={() => {
              if (row.invoiceId) onOpenInvoice(row.invoiceId);
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer justify-center w-full"
          />
        )}
      </TableCell>

      {/* NHẬP KHO */}
      <TableCell
        className={`${cellBase} ${tintIn} text-right font-medium text-foreground/90 tabular-nums w-[80px]`}
      >
        {row.inQty ? row.inQty.toLocaleString(undefined, QTY_FORMAT) : ""}
      </TableCell>
      <TableCell
        className={`${cellBase} ${tintIn} text-right text-muted-foreground tabular-nums`}
      >
        {row.inUnitCost != null ? money(row.inUnitCost) : ""}
      </TableCell>
      <TableCell
        className={`${cellDivider} ${tintIn} text-right font-semibold text-foreground tabular-nums`}
      >
        {row.inTotal != null ? money(row.inTotal) : ""}
      </TableCell>

      {/* XUẤT KHO - FIFO */}
      <TableCell
        className={`${cellBase} ${tintOut} text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums w-[80px]`}
      >
        {row.outQty ? row.outQty.toLocaleString(undefined, QTY_FORMAT) : ""}
      </TableCell>
      <TableCell
        className={`${cellBase} ${tintOut} text-right text-muted-foreground tabular-nums`}
      >
        {row.outCogs != null && row.outQty
          ? money(row.outCogs / row.outQty)
          : ""}
      </TableCell>
      <TableCell
        className={`${cellDivider} ${tintOut} text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums`}
      >
        {row.outCogs != null ? money(row.outCogs) : ""}
      </TableCell>

      {/* TỒN KHO (lũy kế từ API, có thể âm) */}
      <TableCell
        className={`${cellBase} ${tintStock} text-right font-semibold tabular-nums w-[80px]`}
      >
        <FifoRowBadges row={row} />
        <span
          className={
            row.balanceQty < 0
              ? "text-rose-500 dark:text-rose-400"
              : "text-foreground"
          }
        >
          {row.balanceQty.toLocaleString(undefined, QTY_FORMAT)}
        </span>
      </TableCell>
      <TableCell
        className={`${cellDivider} ${tintStock} text-right font-semibold text-foreground tabular-nums`}
      >
        {money(row.balanceValue)}
      </TableCell>

      {/* HIỆU QUẢ KINH DOANH (6 cột: SL, Đơn giá bán, Doanh thu, Giá vốn, Lợi nhuận gộp, % biên LN) */}
      <TableCell
        className={`${cellBase} ${tintPerf} text-right font-medium text-purple-600 dark:text-purple-400 tabular-nums w-[80px]`}
      >
        {row.outQty ? row.outQty.toLocaleString(undefined, QTY_FORMAT) : ""}
      </TableCell>
      <TableCell
        className={`${cellBase} ${tintPerf} text-right text-muted-foreground tabular-nums`}
      >
        {row.outSellPrice != null && row.direction === "OUT"
          ? money(row.outSellPrice)
          : ""}
      </TableCell>
      <TableCell
        className={`${cellBase} ${tintPerf} text-right font-medium text-foreground tabular-nums`}
      >
        {row.outRevenue != null && row.direction === "OUT"
          ? money(row.outRevenue)
          : ""}
      </TableCell>
      <TableCell
        className={`${cellBase} ${tintPerf} text-right text-muted-foreground tabular-nums`}
      >
        {row.outCogs != null && row.direction === "OUT"
          ? money(row.outCogs)
          : ""}
      </TableCell>
      <TableCell
        className={`${cellBase} ${tintPerf} text-right font-semibold text-purple-600 dark:text-purple-400 tabular-nums`}
      >
        {row.outProfit != null && row.direction === "OUT"
          ? money(row.outProfit)
          : ""}
      </TableCell>
      <TableCell className={`px-3 py-2 ${tintPerf} text-right tabular-nums`}>
        {row.outMargin != null && row.direction === "OUT" ? (
          <GarageMarginBadge margin={row.outMargin} revenue={row.outRevenue} />
        ) : (
          ""
        )}
      </TableCell>
    </TableRow>
  );
}
