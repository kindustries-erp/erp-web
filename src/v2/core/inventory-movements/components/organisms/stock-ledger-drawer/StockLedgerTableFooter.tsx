import * as React from "react";
import { TableCell, TableFooter, TableRow } from "@/shared/components/ui/table";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { StockLedgerTotals } from "./stockLedgerCalculator";

interface StockLedgerTableFooterProps {
  totals: StockLedgerTotals;
}

const num = (val: number) => Number(val ?? 0).toLocaleString("vi-VN");

const baseCell =
  "px-3 py-2 border-r border-border/15 dark:border-white/[0.02] shadow-[0_1px_0_0_var(--border-light)]";
const dividerCell =
  "px-3 py-2 border-r border-slate-300/40 dark:border-zinc-700/40 shadow-[0_1px_0_0_var(--border-light)]";

const tintIn = "bg-amber-500/[0.04] dark:bg-amber-500/[0.07]";
const tintOut = "bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07]";
const tintAdj = "bg-orange-500/[0.04] dark:bg-orange-500/[0.07]";
const tintStock = "bg-slate-500/[0.03] dark:bg-zinc-500/[0.05]";

export function StockLedgerTableFooter({
  totals,
}: StockLedgerTableFooterProps) {
  const { t } = useV2Translation();

  return (
    <TableFooter className="sticky bottom-0 z-10 font-semibold table-footer-glass border-t border-border/40 shadow-[0_-2px_6px_rgba(0,0,0,0.04)]">
      <TableRow className="hover:bg-transparent bg-transparent">
        {/* Colspan 4: #, Ngày, Nghiệp vụ, Số phiếu */}
        <TableCell
          colSpan={4}
          className="px-3 py-2.5 border-r border-slate-300/40 dark:border-zinc-700/40 text-right uppercase text-foreground bg-slate-50/50 dark:bg-zinc-900/50 text-xs tracking-wider font-bold"
        >
          {t("v2.common.total", "Tổng cộng")}
        </TableCell>

        {/* 5. NHẬP */}
        <TableCell
          className={`${baseCell} ${tintIn} text-right font-bold text-amber-700 dark:text-amber-400 tabular-nums`}
        >
          <span className="underline">{num(totals.totalInQty)}</span>
        </TableCell>

        {/* 6. XUẤT */}
        <TableCell
          className={`${baseCell} ${tintOut} text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums`}
        >
          <span className="underline">{num(totals.totalOutQty)}</span>
        </TableCell>

        {/* 7. ĐIỀU CHỈNH */}
        <TableCell
          className={`${baseCell} ${tintAdj} text-right font-bold tabular-nums ${
            totals.totalAdjustedQty > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : totals.totalAdjustedQty < 0
                ? "text-orange-600 dark:text-orange-400"
                : "text-muted-foreground"
          }`}
        >
          <span className="underline">
            {totals.totalAdjustedQty !== 0
              ? totals.totalAdjustedQty > 0
                ? `+${num(totals.totalAdjustedQty)}`
                : num(totals.totalAdjustedQty)
              : "0"}
          </span>
        </TableCell>

        {/* 8. TỒN CUỐI */}
        <TableCell
          className={`${baseCell} ${tintStock} text-right font-bold text-foreground tabular-nums`}
        >
          <span className="underline">{num(totals.finalBalanceQty)}</span>
        </TableCell>

        {/* 9. ĐƠN GIÁ (Để trống ở hàng tổng cộng) */}
        <TableCell
          className={`${dividerCell} bg-slate-50/50 dark:bg-zinc-900/50`}
        />
      </TableRow>
    </TableFooter>
  );
}
