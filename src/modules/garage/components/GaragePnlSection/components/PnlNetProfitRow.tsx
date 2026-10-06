import React from "react";
import { useTranslation } from "react-i18next";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlNetProfitRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

function getNetProfit(r?: GaragePnlReportResponse): number | undefined {
  if (!r) return undefined;
  const selling =
    r.sellingExpenses?.total ?? r.commission?.auto?.saleCommission ?? 0;
  return r.netProfit ?? r.grossProfit - selling - (r.opex?.total || 0);
}

function getOjNetProfit(r?: GaragePnlReportResponse): number | undefined {
  if (!r?.oj) return undefined;
  return (
    r.oj.netProfit ??
    (r.oj.grossProfit || 0) -
      (r.oj.sellingExpensesTotal || 0) -
      (r.oj.opexTotal || 0)
  );
}

export function PnlNetProfitRow({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlNetProfitRowProps) {
  const { t } = useTranslation("garage");

  const netProfit0 = getNetProfit(report) ?? 0;
  const netProfit1 = getNetProfit(prevReport);
  const netProfit2 = getNetProfit(prev2Report);

  const ojNetProfit0 = getOjNetProfit(report) ?? 0;
  const ojNetProfit1 = getOjNetProfit(prevReport);
  const ojNetProfit2 = getOjNetProfit(prev2Report);

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <td className="py-2.5 px-4 flex items-center gap-1.5">
          <span>{t("pnl.netProfitHeader", "6. Lợi nhuận ròng")}</span>
        </td>
        <PnlAmountCell
          amount={netProfit0}
          prevAmount={netProfit1}
          revenue={report.revenue}
          isCost={false}
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={netProfit1}
          prevAmount={netProfit2}
          revenue={prevReport?.revenue}
          isCost={false}
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={netProfit2}
          revenue={prev2Report?.revenue}
          isCost={false}
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground"
          amountClassName="font-semibold"
        />
      </tr>

      {/* 6.1. Trong đó: Lợi nhuận ròng mảng OJ */}
      <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t("pnl.netProfitOjSub", "6.1. Trong đó: Lợi nhuận ròng mảng OJ")}
          </span>
        </td>
        <PnlAmountCell
          amount={ojNetProfit0 !== 0 ? ojNetProfit0 : 0}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={ojNetProfit1}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
        <PnlAmountCell
          amount={ojNetProfit2}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName={subCell}
        />
      </tr>
    </>
  );
}
