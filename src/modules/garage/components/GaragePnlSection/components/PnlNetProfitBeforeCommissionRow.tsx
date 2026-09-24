import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlNetProfitBeforeCommissionRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlNetProfitBeforeCommissionRow({
  report,
  prevReport,
  isLoadingPrev,
}: PnlNetProfitBeforeCommissionRowProps) {
  const { t } = useTranslation("garage");

  return (
    <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <td className="py-2.5 px-4 flex items-center gap-1.5">
        <span>
          {t(
            "pnl.netProfitBeforeCommissionHeader",
            "V. Lợi nhuận ròng (trước hoa hồng)",
          )}
        </span>
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-foreground font-medium"
        >
          {report.revenue > 0
            ? (
                (report.netProfitBeforeCommission / report.revenue) *
                100
              ).toFixed(2)
            : 0}
          % DT
        </Badge>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
        <span>
          {(report.oj?.netProfitBeforeCommission || 0).toLocaleString("vi-VN")}{" "}
          đ
        </span>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground">
        <div className="flex items-center justify-end">
          <span>
            {report.netProfitBeforeCommission.toLocaleString("vi-VN")} đ
          </span>
          {renderDelta(
            report.netProfitBeforeCommission,
            prevReport?.netProfitBeforeCommission,
            false,
            isLoadingPrev,
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground">
        <div className="flex items-center justify-end gap-1.5">
          <span>
            {renderPrevVal(
              prevReport?.netProfitBeforeCommission,
              isLoadingPrev,
            )}
          </span>
          {prevReport?.revenue && prevReport.revenue > 0 ? (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 border-slate-300/80 dark:border-slate-700 text-muted-foreground font-normal"
            >
              {(
                (prevReport.netProfitBeforeCommission / prevReport.revenue) *
                100
              ).toFixed(2)}
              % DT
            </Badge>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
