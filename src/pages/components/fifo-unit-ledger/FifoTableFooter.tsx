import React from "react";
import { useTranslation } from "react-i18next";
import { money } from "@/shared/utils/format";
import { TableCell, TableFooter, TableRow } from "@/shared/components/ui/table";
import { GarageMarginBadge } from "@/modules/garage/components/atoms/garage-margin-badge";
import type { FifoFlatTableTotals } from "./fifoTotals";

const QTY_FORMAT = { minimumFractionDigits: 0, maximumFractionDigits: 2 };

interface FifoTableFooterProps {
  totals: FifoFlatTableTotals;
}

/** Hàng tổng cộng cuối bảng FIFO với các sắc thái màu theo nhóm cột. */
export function FifoTableFooter({ totals }: FifoTableFooterProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  const baseCell =
    "px-3 py-2 border-r border-border/15 dark:border-white/[0.02] shadow-[0_1px_0_0_var(--border-light)]";
  const dividerCell =
    "px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40 shadow-[0_1px_0_0_var(--border-light)]";

  const tintIn = "bg-amber-500/[0.04] dark:bg-amber-500/[0.07]";
  const tintOut = "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07]";
  const tintStock = "bg-slate-500/[0.03] dark:bg-zinc-500/[0.05]";
  const tintPerf = "bg-purple-500/[0.04] dark:bg-purple-500/[0.07]";

  const totalMargin =
    totals.outRevenue > 0 ? (totals.outProfit / totals.outRevenue) * 100 : null;

  return (
    <TableFooter className="sticky bottom-0 z-10 font-semibold table-footer-glass border-t border-border/40 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
      <TableRow className="hover:bg-transparent bg-transparent">
        <TableCell
          colSpan={3}
          className="px-3 py-3 border-r border-slate-300/40 dark:border-zinc-700/40 text-right uppercase text-foreground bg-slate-50/50 dark:bg-zinc-900/50 text-xs tracking-wider font-bold"
        >
          {t("common:total", "Tổng cộng")}
        </TableCell>

        {/* NHẬP KHO */}
        <TableCell
          className={`${baseCell} ${tintIn} text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums w-[80px]`}
        >
          <span className="underline">
            {totals.inQty.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className={`${baseCell} ${tintIn}`} />
        <TableCell
          className={`${dividerCell} ${tintIn} text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums`}
        >
          <span className="underline">{money(totals.inValue)}</span>
        </TableCell>

        {/* XUẤT KHO - FIFO */}
        <TableCell
          className={`${baseCell} ${tintOut} text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums w-[80px]`}
        >
          <span className="underline">
            {totals.outQty.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className={`${baseCell} ${tintOut}`} />
        <TableCell
          className={`${dividerCell} ${tintOut} text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums`}
        >
          <span className="underline">{money(totals.outValue)}</span>
        </TableCell>

        {/* TỒN KHO */}
        <TableCell
          className={`${baseCell} ${tintStock} text-right font-bold text-foreground tabular-nums w-[80px]`}
        >
          <span className="underline">
            {totals.balanceQty?.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell
          className={`${dividerCell} ${tintStock} text-right font-bold text-foreground tabular-nums`}
        >
          <span className="underline">{money(totals.balanceValue)}</span>
        </TableCell>

        {/* HIỆU QUẢ KINH DOANH (6 cột: SL, Đơn giá bán, Doanh thu, Giá vốn, Lợi nhuận gộp, % biên LN) */}
        <TableCell
          className={`${baseCell} ${tintPerf} text-right font-bold text-purple-600 dark:text-purple-400 tabular-nums w-[80px]`}
        >
          <span className="underline">
            {totals.outQty.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className={`${baseCell} ${tintPerf}`} />
        <TableCell
          className={`${baseCell} ${tintPerf} text-right font-bold text-foreground tabular-nums`}
        >
          <span className="underline">{money(totals.outRevenue)}</span>
        </TableCell>
        <TableCell
          className={`${baseCell} ${tintPerf} text-right font-bold text-muted-foreground tabular-nums`}
        >
          <span className="underline">{money(totals.outValue)}</span>
        </TableCell>
        <TableCell
          className={`${baseCell} ${tintPerf} text-right font-bold text-purple-600 dark:text-purple-400 tabular-nums`}
        >
          <span className="underline">{money(totals.outProfit)}</span>
        </TableCell>
        <TableCell
          className={`px-3 py-2 ${tintPerf} text-right tabular-nums shadow-[0_1px_0_0_var(--border-light)]`}
        >
          {totalMargin != null ? (
            <GarageMarginBadge
              margin={totalMargin}
              revenue={totals.outRevenue}
            />
          ) : null}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
