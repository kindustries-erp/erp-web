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
}

export function PnlGrossProfitRow({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlGrossProfitRowProps) {
  const { t } = useTranslation("garage");
  const curOjGrossProfit = report.oj?.grossProfit || 0;
  const prevOjGrossProfit = prevReport?.oj?.grossProfit;
  const prev2OjGrossProfit = prev2Report?.oj?.grossProfit;

  return (
    <>
      <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <td className="py-3 px-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>{t("pnl.grossProfitHeader", "3. Lợi nhuận gộp")}</span>
        </td>
        <PnlAmountCell
          amount={report.grossProfit}
          prevAmount={prevReport?.grossProfit}
          customRate={report.grossMarginRate}
          isCost={false}
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={prevReport?.grossProfit}
          prevAmount={prev2Report?.grossProfit}
          customRate={prevReport?.grossMarginRate}
          isCost={false}
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={prev2Report?.grossProfit}
          customRate={prev2Report?.grossMarginRate}
          isCost={false}
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground"
          amountClassName="font-semibold"
        />
      </tr>

      {/* 3.1. Trong đó: Lợi nhuận gộp mảng OJ */}
      <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t("pnl.grossProfitOjSub", "3.1. Trong đó: Lợi nhuận gộp mảng OJ")}
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
    </>
  );
}
