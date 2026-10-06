import React from "react";
import { useTranslation } from "react-i18next";
import { Boxes } from "lucide-react";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems } from "../utils/pnlHelpers";
import { PnlCogsAdjustmentRows } from "./PnlCogsAdjustmentRows";
import { PnlAmountCell } from "./PnlAmountCell";
import { PnlLevel1HeaderCell } from "./PnlLevel1HeaderCell";

interface PnlCogsRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function PnlCogsRows({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
  isCollapsed = false,
  onToggle,
}: PnlCogsRowsProps) {
  const { t } = useTranslation("garage");
  const cogsAdjustments = mergePnlItems(
    report.cogsAdjustment?.items,
    prevReport?.cogsAdjustment?.items,
    prev2Report?.cogsAdjustment?.items,
  );

  const [cogs0, cogs1, cogs2] = [
    isOjOnly ? report.oj?.cogs || 0 : report.cogs,
    isOjOnly ? prevReport?.oj?.cogs : prevReport?.cogs,
    isOjOnly ? prev2Report?.oj?.cogs : prev2Report?.cogs,
  ];
  const [direct0, direct1, direct2] = [
    isOjOnly ? report.oj?.cogsDirect || 0 : (report.cogsDirect ?? report.cogs),
    isOjOnly
      ? prevReport?.oj?.cogsDirect
      : (prevReport?.cogsDirect ?? prevReport?.cogs),
    isOjOnly
      ? prev2Report?.oj?.cogsDirect
      : (prev2Report?.cogsDirect ?? prev2Report?.cogs),
  ];
  const [rev0, rev1, rev2] = [
    isOjOnly ? report.oj?.revenue || 0 : report.revenue,
    isOjOnly ? prevReport?.oj?.revenue : prevReport?.revenue,
    isOjOnly ? prev2Report?.oj?.revenue : prev2Report?.revenue,
  ];

  return (
    <>
      {/* II. Chi phí (Giá vốn) Header */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <PnlLevel1HeaderCell
          title={t("pnl.cogsHeader", "II. Chi phí (Giá vốn)")}
          icon={Boxes}
          isCollapsed={isCollapsed}
          onToggle={onToggle}
          hasSubRows={true}
        />
        <PnlAmountCell
          amount={cogs0}
          prevAmount={cogs1}
          revenue={rev0}
          isCost
          isLoadingPrev={isLoadingPrev}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]"
          amountClassName="font-bold text-foreground"
        />
        <PnlAmountCell
          amount={cogs1}
          prevAmount={cogs2}
          revenue={rev1}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-slate-700 dark:text-slate-300"
          amountClassName="font-semibold"
        />
        <PnlAmountCell
          amount={cogs2}
          revenue={rev2}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          tdClassName="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground"
        />
      </tr>

      {/* Sub-rows: 2.1 & 2.2 (chỉ hiện khi !isCollapsed) */}
      {!isCollapsed && (
        <>
          {/* 2.1. Chi phí phụ tùng & Gia công ngoài */}
          <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors">
            <td className="py-2 px-8 font-medium">
              {t(
                "pnl.cogsDirect",
                "2.1. Chi phí phụ tùng & Gia công ngoài (từ vụ việc)",
              )}
            </td>
            <PnlAmountCell
              amount={direct0}
              hideDelta
              hideRate
              tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
            />
            <PnlAmountCell
              amount={direct1}
              isLoading={isLoadingPrev}
              hideDelta
              hideRate
              tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
            />
            <PnlAmountCell
              amount={direct2}
              isLoading={isLoadingPrev2}
              hideDelta
              hideRate
              tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
            />
          </tr>

          {/* 2.1.1. Trong đó: Phát sinh liên quan OJ (Ẩn khi xem riêng OJ) */}
          {!isOjOnly && (
            <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
              <td className="py-1.5 pl-14 pr-4">
                <span className="text-[11px] italic">
                  {t(
                    "pnl.cogsOjSub",
                    "2.1.1. Trong đó: Phát sinh liên quan OJ",
                  )}
                </span>
              </td>
              <PnlAmountCell
                amount={report.oj?.cogsDirect || 0}
                revenue={report.revenue}
                hideDelta
                tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
              />
              <PnlAmountCell
                amount={prevReport?.oj?.cogsDirect}
                revenue={prevReport?.revenue}
                isLoading={isLoadingPrev}
                hideDelta
                tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
              />
              <PnlAmountCell
                amount={prev2Report?.oj?.cogsDirect}
                revenue={prev2Report?.revenue}
                isLoading={isLoadingPrev2}
                hideDelta
                tdClassName="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground"
              />
            </tr>
          )}

          {/* 2.2. Chi phí trực tiếp nhập tay */}
          <PnlCogsAdjustmentRows
            report={report}
            prevReport={prevReport}
            prev2Report={prev2Report}
            cogsAdjustments={cogsAdjustments}
            isLoadingPrev={isLoadingPrev}
            isLoadingPrev2={isLoadingPrev2}
            isOjOnly={isOjOnly}
          />
        </>
      )}
    </>
  );
}
