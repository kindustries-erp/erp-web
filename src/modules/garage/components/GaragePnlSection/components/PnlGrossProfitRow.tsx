import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlGrossProfitRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
}

export function PnlGrossProfitRow({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
}: PnlGrossProfitRowProps) {
  const { t } = useTranslation("garage");
  const curOjGrossProfit = report.oj?.grossProfit || 0;
  const prevOjGrossProfit = prevReport?.oj?.grossProfit;
  const prev2OjGrossProfit = prev2Report?.oj?.grossProfit;

  const gp0 = isOjOnly ? curOjGrossProfit : report.grossProfit;
  const gp1 = isOjOnly ? prevOjGrossProfit : prevReport?.grossProfit;
  const gp2 = isOjOnly ? prev2OjGrossProfit : prev2Report?.grossProfit;

  const rate0 = isOjOnly ? report.oj?.grossMarginRate : report.grossMarginRate;
  const rate1 = isOjOnly
    ? prevReport?.oj?.grossMarginRate
    : prevReport?.grossMarginRate;
  const rate2 = isOjOnly
    ? prev2Report?.oj?.grossMarginRate
    : prev2Report?.grossMarginRate;

  return (
    <>
      <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <td className="py-3 px-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{t("pnl.grossProfitHeader", "3. Lợi nhuận gộp")}</span>
        </td>
        <PnlAmountCell
          amount={gp0}
          prevAmount={gp1}
          customRate={rate0}
          isCost={false}
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={gp1}
          prevAmount={gp2}
          customRate={rate1}
          isCost={false}
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={gp2}
          customRate={rate2}
          isCost={false}
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground"
          amountClassName="font-semibold"
        />
      </tr>

      {/* 3.1. Trong đó: Lợi nhuận gộp mảng OJ (Ẩn khi đang xem riêng OJ) */}
      {!isOjOnly && (
        <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
          <td className="py-1.5 pl-14 pr-4">
            <span className="text-[11px] italic">
              {t(
                "pnl.grossProfitOjSub",
                "3.1. Trong đó: Lợi nhuận gộp mảng OJ",
              )}
            </span>
          </td>
          <PnlAmountCell
            amount={curOjGrossProfit}
            customRate={report.oj?.grossMarginRate}
            hideDelta
            tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
          />
          <PnlAmountCell
            amount={prevOjGrossProfit}
            customRate={prevReport?.oj?.grossMarginRate}
            isLoading={isLoadingPrev}
            hideDelta
            tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
          />
          <PnlAmountCell
            amount={prev2OjGrossProfit}
            customRate={prev2Report?.oj?.grossMarginRate}
            isLoading={isLoadingPrev2}
            hideDelta
            tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
          />
        </tr>
      )}
    </>
  );
}
