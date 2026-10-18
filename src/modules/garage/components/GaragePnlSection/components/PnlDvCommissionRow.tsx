import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlDvCommissionRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
}

function getDv(r?: GaragePnlReportResponse): number {
  return (
    r?.commission?.items?.find((i) => i.categoryKey === "HOA_HONG_DV")
      ?.amount ??
    r?.serviceCommission?.dvCommission ??
    r?.commission?.auto?.dvCommission ??
    0
  );
}

export function PnlDvCommissionRow({
  report,
  prevReport,
  prev2Report,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
}: PnlDvCommissionRowProps) {
  const { t } = useTranslation("garage");

  const dv0 = isOjOnly
    ? (report.oj?.commissionAuto?.dvCommission ?? 0)
    : getDv(report);
  const dv1 = isOjOnly
    ? prevReport?.oj?.commissionAuto?.dvCommission
    : prevReport
      ? getDv(prevReport)
      : undefined;
  const dv2 = isOjOnly
    ? prev2Report?.oj?.commissionAuto?.dvCommission
    : prev2Report
      ? getDv(prev2Report)
      : undefined;

  const oj0 = report.oj?.commissionAuto?.dvCommission ?? 0;
  const oj1 = prevReport?.oj?.commissionAuto?.dvCommission;
  const oj2 = prev2Report?.oj?.commissionAuto?.dvCommission;

  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  return (
    <>
      {/* 7.1. Hoa hồng cho DV (10%) */}
      <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {t("pnl.dvCommission", "7.1. Hoa hồng cho DV (10%)")}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-normal"
              >
                10% × Lợi nhuận ròng
              </Badge>
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
            <span className="text-[11px] text-muted-foreground font-normal">
              {isOjOnly
                ? t(
                    "pnl.dvCommissionOjSubtitle",
                    "Tính trên 10% Lợi nhuận ròng của riêng OJ",
                  )
                : t(
                    "pnl.dvCommissionSubtitle",
                    "Tính trên 10% Lợi nhuận ròng của toàn xưởng",
                  )}
            </span>
          </div>
        </td>
        <PnlAmountCell
          amount={dv0}
          prevAmount={dv1}
          isCost
          isLoadingPrev={isLoadingPrev}
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono font-semibold"
          amountClassName="font-semibold text-foreground"
        />
        <PnlAmountCell
          amount={dv1}
          prevAmount={dv2}
          isCost
          isLoading={isLoadingPrev}
          isLoadingPrev={isLoadingPrev2}
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300"
        />
        <PnlAmountCell
          amount={dv2}
          isCost
          isLoading={isLoadingPrev2}
          hideDelta
          hideRate
          tdClassName="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground"
        />
      </tr>

      {/* 7.1.1. Trong đó: Phát sinh liên quan OJ */}
      {!isOjOnly && (
        <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
          <td className="py-1.5 pl-14 pr-4">
            <span className="text-[11px] italic">
              {t(
                "pnl.dvCommissionOjSub",
                "7.1.1. Trong đó: Phát sinh liên quan OJ",
              )}
            </span>
          </td>
          <PnlAmountCell
            amount={oj0 > 0 ? oj0 : 0}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
          <PnlAmountCell
            amount={oj1}
            isLoading={isLoadingPrev}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
          <PnlAmountCell
            amount={oj2}
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
