import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlRevenueRows } from "./PnlRevenueRows";
import { PnlCogsRows } from "./PnlCogsRows";
import { PnlGrossProfitRow } from "./PnlGrossProfitRow";
import { PnlSellingExpenseRows } from "./PnlSellingExpenseRows";
import { PnlOpexRows } from "./PnlOpexRows";
import { PnlNetProfitRow } from "./PnlNetProfitRow";
import { PnlServiceCommissionRows } from "./PnlServiceCommissionRows";
import { PnlRetainedProfitRow } from "./PnlRetainedProfitRow";

interface PnlFinancialTableProps {
  report?: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoading: boolean;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  selectedMonth: number;
  selectedYear: number;
  prevMonth: number;
  prevYear: number;
  prev2Month?: number;
  prev2Year?: number;
  isOjOnly?: boolean;
  onOpenDrawer: () => void;
}

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
            <th className="py-2.5 px-4 w-[40%]">
              {t("pnl.tableHeaderCategory", "Danh Mục")}
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
          {/* 1. Doanh thu */}
          <PnlRevenueRows
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          {/* 2. Giá vốn */}
          <PnlCogsRows
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          {/* 3. Lợi nhuận gộp */}
          <PnlGrossProfitRow
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          {/* 4. Chi phí bán hàng (gồm HH Sale 10%) */}
          <PnlSellingExpenseRows
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          {/* 5. Chi phí vận hành (OPEX) */}
          <PnlOpexRows
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
            onOpenDrawer={onOpenDrawer}
          />
          {/* 6. Lợi nhuận ròng = 3 - 4 - 5 */}
          <PnlNetProfitRow
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          {/* 7. Thưởng và Hoa hồng Dịch vụ */}
          <PnlServiceCommissionRows
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
          {/* 8. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV) */}
          <PnlRetainedProfitRow
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
        </tbody>
      </table>
    </div>
  );
}
