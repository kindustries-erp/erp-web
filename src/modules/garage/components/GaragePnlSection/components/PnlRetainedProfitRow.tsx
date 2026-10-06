import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";
import { PnlLevel1HeaderCell } from "./PnlLevel1HeaderCell";

interface PnlRetainedProfitRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  totalServiceComm?: number;
  ojDvCommission?: number;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function PnlRetainedProfitRow({
  report,
  prevReport,
  prev2Report,
  totalServiceComm,
  ojDvCommission,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  isCollapsed = false,
  onToggle,
}: PnlRetainedProfitRowProps) {
  const { t } = useTranslation("garage");

  const rawRetainedProfit0 =
    report.netProfitAfterCommission ??
    (report.netProfit || 0) - (totalServiceComm ?? 0);
  const rawPrevRetainedProfit = prevReport?.netProfitAfterCommission;
  const rawPrev2RetainedProfit = prev2Report?.netProfitAfterCommission;

  const ojRetainedProfit0 =
    report.oj?.netProfitAfterCommission ??
    (report.oj?.netProfit || 0) - (ojDvCommission ?? 0);
  const prevOjRetainedProfit = prevReport?.oj?.netProfitAfterCommission;
  const prev2OjRetainedProfit = prev2Report?.oj?.netProfitAfterCommission;

  const retainedProfit0 = isOjOnly ? ojRetainedProfit0 : rawRetainedProfit0;
  const prevRetainedProfit = isOjOnly
    ? prevOjRetainedProfit
    : rawPrevRetainedProfit;
  const prev2RetainedProfit = isOjOnly
    ? prev2OjRetainedProfit
    : rawPrev2RetainedProfit;

  const rate0 = isOjOnly ? report.oj?.netMarginRate : report.netMarginRate;
  const rate1 = isOjOnly
    ? prevReport?.oj?.netMarginRate
    : prevReport?.netMarginRate;
  const rate2 = isOjOnly
    ? prev2Report?.oj?.netMarginRate
    : prev2Report?.netMarginRate;

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* VIII. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV) Header */}
      <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 text-foreground font-bold border-t-2 border-emerald-500/40 dark:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
        <PnlLevel1HeaderCell
          title={t(
            "pnl.retainedProfitHeader",
            "VIII. Lợi nhuận giữ lại của Garage (Sau hoa hồng DV)",
          )}
          icon={ShieldCheck}
          iconClassName="text-emerald-700 dark:text-emerald-300"
          titleClassName="text-emerald-900 dark:text-emerald-200"
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          hasSubRows={!isOjOnly}
        />
        <PnlAmountCell
          amount={retainedProfit0}
          prevAmount={prevRetainedProfit}
          customRate={rate0}
          isCost={false}
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-emerald-600 dark:text-emerald-400"
          amountClassName="font-bold text-emerald-600 dark:text-emerald-400"
        />
        <PnlAmountCell
          amount={prevRetainedProfit}
          prevAmount={prev2RetainedProfit}
          customRate={rate1}
          isCost={false}
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-semibold text-emerald-600/80 dark:text-emerald-400/80"
          amountClassName="font-semibold text-emerald-600/80 dark:text-emerald-400/80"
        />
        <PnlAmountCell
          amount={prev2RetainedProfit}
          customRate={rate2}
          isCost={false}
          isLoadingPrev={isLoadingPrev2}
          hideDelta
          tdClassName="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-semibold text-emerald-600/80 dark:text-emerald-400/80"
          amountClassName="font-semibold text-emerald-600/80 dark:text-emerald-400/80"
        />
      </tr>

      {/* 8.1. Trong đó: Lợi nhuận giữ lại mảng OJ (Ẩn khi đang xem riêng OJ hoặc collapsed) */}
      {!isOjOnly && !isCollapsed && (
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
      )}
    </>
  );
}
