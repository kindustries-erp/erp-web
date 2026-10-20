import React from "react";
import { useTranslation } from "react-i18next";
import { money } from "@/shared/utils/format";
import { TableCell, TableFooter, TableRow } from "@/shared/components/ui/table";
import type { FifoFlatTableTotals } from "./fifoTotals";

const QTY_FORMAT = { minimumFractionDigits: 0, maximumFractionDigits: 2 };

interface FifoTableFooterProps {
  totals: FifoFlatTableTotals;
}

/** Hàng tổng cộng cuối bảng FIFO. */
export function FifoTableFooter({ totals }: FifoTableFooterProps) {
  const { t } = useTranslation(["vinfastParts", "common"]);

  return (
    <TableFooter className="sticky bottom-0 z-10 font-semibold table-footer-glass border-t-2 border-slate-300 dark:border-border shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
      <TableRow className="hover:bg-transparent bg-transparent">
        <TableCell
          colSpan={3}
          className="px-3 py-3 border-r border-slate-200 text-right uppercase text-slate-700"
        >
          {t("common:total", "Tổng cộng")}
        </TableCell>

        {/* NHẬP KHO */}
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-700 bg-orange-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
          <span className="underline">
            {totals.inQty.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-orange-50 shadow-[0_1px_0_0_var(--border-light)]" />
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-slate-700 bg-orange-50 shadow-[0_1px_0_0_var(--border-light)]">
          <span className="underline">{money(totals.inValue)}</span>
        </TableCell>

        {/* XUẤT KHO - FIFO */}
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
          <span className="underline">
            {totals.outQty.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]" />
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-emerald-700 bg-emerald-50 shadow-[0_1px_0_0_var(--border-light)]">
          <span className="underline">{money(totals.outValue)}</span>
        </TableCell>

        {/* TỒN KHO */}
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 bg-blue-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
          <span className="underline">
            {totals.balanceQty?.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-blue-700 bg-blue-50 shadow-[0_1px_0_0_var(--border-light)]">
          <span className="underline">{money(totals.balanceValue)}</span>
        </TableCell>

        {/* HIỆU QUẢ KINH DOANH */}
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)] w-[80px]">
          <span className="underline">
            {totals.outQty.toLocaleString(undefined, QTY_FORMAT)}
          </span>
        </TableCell>
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]" />
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
          <span className="underline">{money(totals.outValue)}</span>
        </TableCell>
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]" />
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
          <span className="underline">{money(totals.outRevenue)}</span>
        </TableCell>
        <TableCell className="px-3 py-2 border-r border-slate-200 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
          <span className="underline">{money(totals.outProfit)}</span>
        </TableCell>
        <TableCell className="px-3 py-2 text-right font-semibold text-purple-700 bg-purple-50 shadow-[0_1px_0_0_var(--border-light)]">
          {totals.outRevenue > 0 ? (
            <span className="underline">
              {((totals.outProfit / totals.outRevenue) * 100).toFixed(1)}%
            </span>
          ) : null}
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
