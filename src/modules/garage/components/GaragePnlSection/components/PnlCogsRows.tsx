import React from "react";
import { useTranslation } from "react-i18next";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlCogsAdjustmentRows } from "./PnlCogsAdjustmentRows";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlCogsRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlCogsRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlCogsRowsProps) {
  const { t } = useTranslation("garage");
  const cogsAdjustments = mergePnlItems(
    report.cogsAdjustment?.items,
    prevReport?.cogsAdjustment?.items,
    prev2Report?.cogsAdjustment?.items,
  );

  const curOjCogsDirect = report.oj?.cogsDirect || 0;
  const prevOjCogsDirect = prevReport?.oj?.cogsDirect;
  const prev2OjCogsDirect = prev2Report?.oj?.cogsDirect;

  return (
    <>
      {/* 2. Chi phí (Giá vốn) */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4">
          <span>{t("pnl.cogsHeader", "2. Chi phí (Giá vốn)")}</span>
        </td>
        <PnlAmountCell
          amount={report.cogs}
          prevAmount={prevReport?.cogs}
          revenue={report.revenue}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={prevReport?.cogs}
          prevAmount={prev2Report?.cogs}
          revenue={prevReport?.revenue}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={prev2Report?.cogs}
          revenue={prev2Report?.revenue}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* 2.1. Chi phí phụ tùng & Gia công ngoài */}
      <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8 font-medium">
          {t(
            "pnl.cogsDirect",
            "2.1. Chi phí phụ tùng & Gia công ngoài (từ vụ việc)",
          )}
        </td>
        <PnlAmountCell
          amount={report.cogsDirect ?? report.cogs}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
        />
        <PnlAmountCell
          amount={prevReport?.cogsDirect ?? prevReport?.cogs}
          isLoading={isLoadingPrev}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
        />
        <PnlAmountCell
          amount={prev2Report?.cogsDirect ?? prev2Report?.cogs}
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
        />
      </tr>

      {/* 2.1.1. Trong đó: Phát sinh liên quan OJ */}
      <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
        <td className="py-1.5 pl-14 pr-4">
          <span className="text-[11px] italic">
            {t("pnl.cogsOjSub", "2.1.1. Trong đó: Phát sinh liên quan OJ")}
          </span>
        </td>
        <PnlAmountCell
          amount={curOjCogsDirect}
          revenue={report.revenue}
          hideDelta
          tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
        />
        <PnlAmountCell
          amount={prevOjCogsDirect}
          revenue={prevReport?.revenue}
          isLoading={isLoadingPrev}
          hideDelta
          tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
        />
        <PnlAmountCell
          amount={prev2OjCogsDirect}
          revenue={prev2Report?.revenue}
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
        />
      </tr>

      {/* 2.2. Chi phí trực tiếp nhập tay */}
      <PnlCogsAdjustmentRows
        report={report}
        prevReport={prevReport}
        prev2Report={prev2Report}
        cogsAdjustments={cogsAdjustments}
        isLoadingPrev={isLoadingPrev}
        isLoadingPrev2={isLoadingPrev2}
      />
    </>
  );
}
