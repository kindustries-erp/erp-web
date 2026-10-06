import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, ShoppingBag } from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlKyGuiCommissionDetailRows } from "./PnlKyGuiCommissionDetailRows";
import { PnlAmountCell } from "./PnlAmountCell";
import { PnlLevel1HeaderCell } from "./PnlLevel1HeaderCell";

interface PnlSellingExpenseRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const getSaleComm = (r?: GaragePnlReportResponse) =>
  r?.commission?.items?.find((i) => i.categoryKey === "HOA_HONG_SALE")
    ?.amount ??
  r?.commission?.auto?.saleCommission ??
  0;

export function PnlSellingExpenseRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  isCollapsed = false,
  onToggle,
}: PnlSellingExpenseRowsProps) {
  const { t } = useTranslation("garage");

  const [sale0, sale1, sale2] = [
    isOjOnly ? 0 : getSaleComm(report),
    isOjOnly ? 0 : prevReport ? getSaleComm(prevReport) : undefined,
    isOjOnly ? 0 : prev2Report ? getSaleComm(prev2Report) : undefined,
  ];
  const [total0, total1, total2] = [
    isOjOnly ? 0 : (report.sellingExpenses?.total ?? sale0),
    isOjOnly ? 0 : (prevReport?.sellingExpenses?.total ?? sale1),
    isOjOnly ? 0 : (prev2Report?.sellingExpenses?.total ?? sale2),
  ];
  const kyGuiProfit =
    report.kyGui?.grossProfit ?? report.commission?.auto?.kyGuiGrossProfit ?? 0;
  const [rate0, rate1, rate2] = [
    report.kyGui?.grossProfitRatio ??
      report.commission?.auto?.kyGuiProfitRate ??
      0,
    prevReport?.kyGui?.grossProfitRatio ??
      prevReport?.commission?.auto?.kyGuiProfitRate,
    prev2Report?.kyGui?.grossProfitRatio ??
      prev2Report?.commission?.auto?.kyGuiProfitRate,
  ];

  return (
    <>
      {/* IV. Chi phí bán hàng Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <PnlLevel1HeaderCell
          title={t("pnl.sellingExpensesHeader", "IV. Chi phí bán hàng")}
          icon={ShoppingBag}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          hasSubRows={true}
        />
        <PnlAmountCell
          amount={total0}
          prevAmount={total1}
          revenue={isOjOnly ? report.oj?.revenue : report.revenue}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={total1}
          prevAmount={total2}
          revenue={isOjOnly ? prevReport?.oj?.revenue : prevReport?.revenue}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={total2}
          revenue={isOjOnly ? prev2Report?.oj?.revenue : prev2Report?.revenue}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* Sub-rows: 4.1 & chi tiết Ký gửi (chỉ hiển thị khi !isCollapsed) */}
      {!isCollapsed && (
        <>
          <tr className="text-slate-700 dark:text-slate-300 bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
            <td className="py-2 px-8 font-medium flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>
                  {t("pnl.saleCommission", "4.1. Hoa hồng cho Sale (10%)")}
                </span>
                {isOjOnly ? (
                  <span className="text-[10px] text-muted-foreground font-normal italic">
                    (
                    {t(
                      "pnl.ojSaleCommissionNote",
                      "OJ không áp dụng hoa hồng Sale",
                    )}
                    )
                  </span>
                ) : (
                  <Tooltip
                    content={t(
                      "pnl.autoCalculatedTooltip",
                      "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L",
                    )}
                  >
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 cursor-help shrink-0 shadow-2xs hover:bg-amber-500/20 transition-colors">
                      <Sparkles className="w-2.5 h-2.5" />
                    </span>
                  </Tooltip>
                )}
              </div>
            </td>
            <PnlAmountCell
              amount={sale0}
              prevAmount={sale1}
              isCost
              isLoadingPrev={isLoadingPrev}
              hideRate
              tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
              amountClassName="font-semibold text-foreground"
            />
            <PnlAmountCell
              amount={sale1}
              prevAmount={sale2}
              isCost
              isLoading={isLoadingPrev}
              isLoadingPrev={isLoadingPrev2}
              hideRate
              tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
            />
            <PnlAmountCell
              amount={sale2}
              isCost
              isLoading={isLoadingPrev2}
              hideDelta
              hideRate
              tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
            />
          </tr>

          {!isOjOnly && (
            <PnlKyGuiCommissionDetailRows
              kyGuiProfit={kyGuiProfit}
              grossProfit={report.grossProfit}
              rate0={rate0}
              rate1={rate1}
              rate2={rate2}
              sale0={sale0}
              sale1={sale1}
              sale2={sale2}
              isLoadingPrev={isLoadingPrev}
              isLoadingPrev2={isLoadingPrev2}
            />
          )}
        </>
      )}
    </>
  );
}
