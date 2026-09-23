import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlRevenueCogsRows } from "./PnlRevenueCogsRows";
import { PnlOpexRows } from "./PnlOpexRows";
import { PnlCommissionRows } from "./PnlCommissionRows";

interface PnlFinancialTableProps {
  report?: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoading: boolean;
  isLoadingPrev: boolean;
  selectedMonth: number;
  selectedYear: number;
  prevMonth: number;
  prevYear: number;
  onOpenDrawer: () => void;
}

export function PnlFinancialTable({
  report,
  prevReport,
  isLoading,
  isLoadingPrev,
  selectedMonth,
  selectedYear,
  prevMonth,
  prevYear,
  onOpenDrawer,
}: PnlFinancialTableProps) {
  const { t } = useTranslation("garage");

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

  return (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border/70 text-muted-foreground uppercase font-semibold text-[11px]">
            <th className="py-2.5 px-4 w-[38%]">
              {t("pnl.tableHeaderCategory", "Danh Mục")}
            </th>
            <th className="py-2.5 px-4 w-[20%] text-right font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
              {t("pnl.tableHeaderOj", "Phát sinh OJ")} (T
              {String(selectedMonth).padStart(2, "0")}/{selectedYear})
            </th>
            <th className="py-2.5 px-4 w-[22%] text-right text-foreground font-bold">
              {t("pnl.monthPrefix", "Tháng")}{" "}
              {String(selectedMonth).padStart(2, "0")}/{selectedYear}
            </th>
            <th className="py-2.5 px-4 w-[20%] text-right text-muted-foreground">
              {t("pnl.monthPrefix", "Tháng")}{" "}
              {String(prevMonth).padStart(2, "0")}/{prevYear}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          <PnlRevenueCogsRows
            report={report}
            prevReport={prevReport}
            isLoadingPrev={isLoadingPrev}
          />
          <PnlOpexRows
            report={report}
            prevReport={prevReport}
            isLoadingPrev={isLoadingPrev}
            onOpenDrawer={onOpenDrawer}
          />
          <PnlCommissionRows
            report={report}
            prevReport={prevReport}
            isLoadingPrev={isLoadingPrev}
          />
        </tbody>
      </table>
    </div>
  );
}
