import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlSellingExpenseRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlSellingExpenseRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlSellingExpenseRowsProps) {
  const { t } = useTranslation("garage");

  const getSale = (r?: GaragePnlReportResponse) =>
    r?.commission?.items?.find((i) => i.categoryKey === "HOA_HONG_SALE")
      ?.amount ??
    r?.commission?.auto?.saleCommission ??
    0;

  const [sale0, sale1, sale2] = [
    getSale(report),
    prevReport ? getSale(prevReport) : undefined,
    prev2Report ? getSale(prev2Report) : undefined,
  ];
  const [total0, total1, total2] = [
    report.sellingExpenses?.total ?? sale0,
    prevReport?.sellingExpenses?.total ?? sale1,
    prev2Report?.sellingExpenses?.total ?? sale2,
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

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 4. Chi phí bán hàng Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4">
          <span>{t("pnl.sellingExpensesHeader", "4. Chi phí bán hàng")}</span>
        </td>
        <PnlAmountCell
          amount={total0}
          prevAmount={total1}
          revenue={report.revenue}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={total1}
          prevAmount={total2}
          revenue={prevReport?.revenue}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={total2}
          revenue={prev2Report?.revenue}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* 4.1. Hoa hồng cho Sale (10%) Header Row */}
      <tr className="text-slate-700 dark:text-slate-300 bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
        <td className="py-2 px-8 font-medium flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>
              {t("pnl.saleCommission", "4.1. Hoa hồng cho Sale (10%)")}
            </span>
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

      {/* 4.1.1. Tỷ lệ lãi gộp ký gửi / Lãi gộp */}
      <tr className="text-slate-600 dark:text-slate-400 hover:bg-muted/10 transition-colors">
        <td className="py-1.5 pl-14 pr-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium">
                {t(
                  "pnl.kyGuiProfitRate",
                  "4.1.1. Tỷ lệ lãi gộp ký gửi / Lãi gộp",
                )}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-purple-100/80 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800 font-medium"
              >
                {t("pnl.kyGuiAllocationBadge", "Tỷ trọng phân bổ Sale")}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground font-normal">
              Lãi gộp Ký gửi: {kyGuiProfit.toLocaleString("vi-VN")} đ / Tổng lãi
              gộp: {report.grossProfit.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </td>
        <PnlAmountCell
          amount={rate0}
          prevAmount={rate1}
          isRatioOnly
          isLoadingPrev={isLoadingPrev}
          hideRate
          tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] font-bold text-purple-700 dark:text-purple-400"
          amountClassName="font-bold text-purple-700 dark:text-purple-400"
        />
        <PnlAmountCell
          amount={rate1}
          prevAmount={rate2}
          isRatioOnly
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={rate2}
          isRatioOnly
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>

      {/* 4.1.2. Hoa hồng Sale tính toán */}
      <tr className="text-slate-600 dark:text-slate-400 hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t(
              "pnl.saleCommissionCalculated",
              "4.1.2. Hoa hồng Sale từ xe Ký gửi / Nội bộ (10% × LN ròng × Tỷ lệ Ký gửi)",
            )}
          </span>
        </td>
        <PnlAmountCell
          amount={sale0}
          hideDelta
          hideRate
          tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px]"
        />
        <PnlAmountCell
          amount={sale1}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={sale2}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>
    </>
  );
}
