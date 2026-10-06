import React from "react";
import { useTranslation } from "react-i18next";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlRevenueRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
}

export function PnlRevenueRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
}: PnlRevenueRowsProps) {
  const { t } = useTranslation("garage");

  const curOjRevenue = report.oj?.revenue || 0;
  const prevOjRevenue = prevReport?.oj?.revenue;
  const prev2OjRevenue = prev2Report?.oj?.revenue;

  const rev0 = isOjOnly ? curOjRevenue : report.revenue;
  const rev1 = isOjOnly ? prevOjRevenue : prevReport?.revenue;
  const rev2 = isOjOnly ? prev2OjRevenue : prev2Report?.revenue;

  return (
    <>
      {/* 1. Doanh Thu */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4">
          {t("pnl.revenueHeader", "1. Doanh Thu")}
        </td>
        <PnlAmountCell
          amount={rev0}
          prevAmount={rev1}
          isCost={false}
          isLoadingPrev={isLoadingPrev}
          hideRate
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={rev1}
          prevAmount={rev2}
          isCost={false}
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          hideRate
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-bold"
        />
        <PnlAmountCell
          amount={rev2}
          isCost={false}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* 1.1. Doanh Thu Dịch Vụ */}
      <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8 font-medium">
          {t("pnl.revenueService", "1.1. Doanh Thu Dịch Vụ")}
        </td>
        <PnlAmountCell
          amount={rev0}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
        />
        <PnlAmountCell
          amount={rev1}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
        />
        <PnlAmountCell
          amount={rev2}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
        />
      </tr>

      {/* 1.1.1. Trong đó: Phát sinh liên quan OJ (Ẩn khi đang xem riêng OJ) */}
      {!isOjOnly && (
        <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
          <td className="py-1.5 pl-14 pr-4">
            <span className="text-[11px] italic">
              {t("pnl.revenueOjSub", "1.1.1. Trong đó: Phát sinh liên quan OJ")}
            </span>
          </td>
          <PnlAmountCell
            amount={curOjRevenue}
            revenue={report.revenue}
            hideDelta
            tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
          />
          <PnlAmountCell
            amount={prevOjRevenue}
            revenue={prevReport?.revenue}
            isLoading={isLoadingPrev}
            hideDelta
            tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
          />
          <PnlAmountCell
            amount={prev2OjRevenue}
            revenue={prev2Report?.revenue}
            isLoading={isLoadingPrev2}
            hideDelta
            tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
          />
        </tr>
      )}
    </>
  );
}
