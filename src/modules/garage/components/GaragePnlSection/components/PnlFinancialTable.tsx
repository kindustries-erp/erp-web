import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, ChevronsUpDown } from "lucide-react";
import type { PnlFinancialTableProps } from "../types";
import { usePnlCollapseState } from "../hooks/usePnlCollapseState";
import { PnlRevenueRows } from "./PnlRevenueRows";
import { PnlCogsRows } from "./PnlCogsRows";
import { PnlGrossProfitRow } from "./PnlGrossProfitRow";
import { PnlSellingExpenseRows } from "./PnlSellingExpenseRows";
import { PnlOpexRows } from "./PnlOpexRows";
import { PnlNetProfitRow } from "./PnlNetProfitRow";
import { PnlServiceCommissionRows } from "./PnlServiceCommissionRows";
import { PnlRetainedProfitRow } from "./PnlRetainedProfitRow";

export function PnlFinancialTable({
  report,
  prevReport,
  prev2Report,
  isLoading,
  isLoadingPrev,
  isLoadingPrev2 = false,
  selectedMonth,
  selectedYear,
  prevMonth,
  prevYear,
  prev2Month,
  prev2Year,
  isOjOnly = false,
  onOpenDrawer,
}: PnlFinancialTableProps) {
  const { t } = useTranslation("garage");
  const { isCollapsed, toggleSection, isAllCollapsed, toggleAll } =
    usePnlCollapseState(false);

  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-xs">
          {t("pnl.loadingReport", "Đang tổng hợp dữ liệu báo cáo P&L...")}
        </span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground">
        {t("pnl.noData", "Chưa có dữ liệu báo cáo cho kỳ này")}
      </div>
    );
  }

  const commonProps = {
    report,
    prevReport,
    prev2Report,
    isLoadingPrev,
    isLoadingPrev2,
    isOjOnly,
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border/70 text-muted-foreground uppercase font-semibold text-[11px]">
            <th className="py-2.5 px-4 w-[40%]">
              <div className="flex items-center justify-between">
                <span>{t("pnl.tableHeaderCategory", "Danh Mục")}</span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors lowercase tracking-normal border border-border/50"
                  title={
                    isAllCollapsed
                      ? t("pnl.expandAll", "Mở rộng tất cả")
                      : t("pnl.collapseAll", "Thu gọn tất cả")
                  }
                >
                  <ChevronsUpDown className="w-3 h-3" />
                  <span>
                    {isAllCollapsed
                      ? t("pnl.expandAll", "Mở rộng tất cả")
                      : t("pnl.collapseAll", "Thu gọn tất cả")}
                  </span>
                </button>
              </div>
            </th>
            <th className="py-2.5 px-4 w-[20%] text-right text-foreground font-bold">
              {t("pnl.monthPrefix", "Tháng")}{" "}
              {String(selectedMonth).padStart(2, "0")}/{selectedYear}
            </th>
            <th className="py-2.5 px-4 w-[20%] text-right text-slate-700 dark:text-slate-300 font-semibold">
              {t("pnl.monthPrefix", "Tháng")}{" "}
              {String(prevMonth).padStart(2, "0")}/{prevYear}
            </th>
            <th className="py-2.5 px-4 w-[20%] text-right text-muted-foreground">
              {t("pnl.monthPrefix", "Tháng")}{" "}
              {prev2Month && prev2Year
                ? `${String(prev2Month).padStart(2, "0")}/${prev2Year}`
                : "—"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          <PnlRevenueRows
            {...commonProps}
            isCollapsed={isCollapsed("revenue")}
            onToggle={() => toggleSection("revenue")}
          />
          <PnlCogsRows
            {...commonProps}
            isCollapsed={isCollapsed("cogs")}
            onToggle={() => toggleSection("cogs")}
          />
          <PnlGrossProfitRow
            {...commonProps}
            isCollapsed={isCollapsed("grossProfit")}
            onToggle={() => toggleSection("grossProfit")}
          />
          <PnlSellingExpenseRows
            {...commonProps}
            isCollapsed={isCollapsed("selling")}
            onToggle={() => toggleSection("selling")}
          />
          <PnlOpexRows
            {...commonProps}
            onOpenDrawer={onOpenDrawer}
            isCollapsed={isCollapsed("opex")}
            onToggle={() => toggleSection("opex")}
          />
          <PnlNetProfitRow
            {...commonProps}
            isCollapsed={isCollapsed("netProfit")}
            onToggle={() => toggleSection("netProfit")}
          />
          <PnlServiceCommissionRows
            {...commonProps}
            isCollapsed={isCollapsed("serviceComm")}
            onToggle={() => toggleSection("serviceComm")}
          />
          <PnlRetainedProfitRow
            {...commonProps}
            isCollapsed={isCollapsed("retainedProfit")}
            onToggle={() => toggleSection("retainedProfit")}
          />
        </tbody>
      </table>
    </div>
  );
}
