import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlNetProfitAfterCommissionRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlNetProfitAfterCommissionRow({
  report,
  prevReport,
  isLoadingPrev,
}: PnlNetProfitAfterCommissionRowProps) {
  const { t } = useTranslation("garage");

  return (
    <tr className="bg-emerald-50/70 dark:bg-emerald-950/30 text-foreground font-bold border-t-2 border-emerald-500/40 dark:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
      <td className="py-3 px-4 flex items-center gap-2">
        <span className="text-[13px] text-emerald-900 dark:text-emerald-200">
          {t(
            "pnl.netProfitAfterCommissionHeader",
            "VII. Lợi nhuận ròng (sau hoa hồng)",
          )}
        </span>
        <Badge
          variant="outline"
          className="ml-2 text-[10px] px-2 py-0.5 border-emerald-300 dark:border-emerald-700 bg-emerald-100/60 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
        >
          {report.netMarginRate.toFixed(2)}% Doanh thu
        </Badge>
      </td>
      <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-foreground border-r border-border/40">
        <div className="flex items-center justify-end gap-1.5">
          <span>
            {(report.oj?.netProfitAfterCommission || 0).toLocaleString("vi-VN")}{" "}
            đ
          </span>
          {Boolean(report.oj && report.oj.revenue > 0) && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
            >
              {report.oj!.netMarginRate.toFixed(2)}% DT
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-bold text-emerald-600 dark:text-emerald-400">
        <div className="flex items-center justify-end">
          <span>
            {report.netProfitAfterCommission.toLocaleString("vi-VN")} đ
          </span>
          {renderDelta(
            report.netProfitAfterCommission,
            prevReport?.netProfitAfterCommission,
            false,
            isLoadingPrev,
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right tabular-nums font-mono text-[14px] font-semibold text-emerald-600/70 dark:text-emerald-400/70">
        <div className="flex items-center justify-end gap-1.5">
          <span>
            {renderPrevVal(prevReport?.netProfitAfterCommission, isLoadingPrev)}
          </span>
          {prevReport?.netMarginRate !== undefined ? (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5 border-emerald-300/60 dark:border-emerald-800/50 text-emerald-700/80 dark:text-emerald-300/80 font-normal"
            >
              {prevReport.netMarginRate.toFixed(2)}% DT
            </Badge>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
