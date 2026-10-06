import React from "react";
import { useTranslation } from "react-i18next";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlRetainedProfitRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  totalServiceComm?: number;
  ojDvCommission?: number;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlRetainedProfitRow({
  report,
  prevReport,
  prev2Report,
  totalServiceComm,
  ojDvCommission,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlRetainedProfitRowProps) {
  const { t } = useTranslation("garage");

  const retainedProfit0 =
    report.netProfitAfterCommission ??
    (report.netProfit || 0) - (totalServiceComm ?? 0);
  const prevRetainedProfit = prevReport?.netProfitAfterCommission;
  const prev2RetainedProfit = prev2Report?.netProfitAfterCommission;

  const ojRetainedProfit0 =
    report.oj?.netProfitAfterCommission ??
    (report.oj?.netProfit || 0) - (ojDvCommission ?? 0);
  const prevOjRetainedProfit = prevReport?.oj?.netProfitAfterCommission;
  const prev2OjRetainedProfit = prev2Report?.oj?.netProfitAfterCommission;

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 8. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV) */}
      <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 text-foreground font-bold border-t-2 border-emerald-500/40 dark:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
        <td className="py-3 px-4 flex items-center gap-2">
          <span className="text-[13px] text-emerald-900 dark:text-emerald-200">
            {t(
              "pnl.retainedProfitHeader",
              "8. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV)",
            )}
          </span>
        </td>
        <PnlAmountCell
          amount={retainedProfit0}
          prevAmount={prevRetainedProfit}
          customRate={report.netMarginRate}
          isCost={false}
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-emerald-600 dark:text-emerald-400"
          amountClassName="font-bold text-emerald-600 dark:text-emerald-400"
        />
        <PnlAmountCell
          amount={prevRetainedProfit}
          prevAmount={prev2RetainedProfit}
          customRate={prevReport?.netMarginRate}
          isCost={false}
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-semibold text-emerald-600/80 dark:text-emerald-400/80"
          amountClassName="font-semibold text-emerald-600/80 dark:text-emerald-400/80"
        />
        <PnlAmountCell
          amount={prev2RetainedProfit}
          customRate={prev2Report?.netMarginRate}
          isCost={false}
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-semibold text-emerald-600/80 dark:text-emerald-400/80"
          amountClassName="font-semibold text-emerald-600/80 dark:text-emerald-400/80"
        />
      </tr>

      {/* 8.1. Trong đó: Lợi nhuận giữ lại mảng OJ */}
      <tr className="text-muted-foreground bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t(
              "pnl.retainedProfitOjSub",
              "8.1. Trong đó: Lợi nhuận giữ lại mảng OJ",
            )}
          </span>
        </td>
        <PnlAmountCell
          amount={ojRetainedProfit0 !== 0 ? ojRetainedProfit0 : 0}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={prevOjRetainedProfit}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={prev2OjRetainedProfit}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>
    </>
  );
}
