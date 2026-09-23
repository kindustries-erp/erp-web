import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlGrossProfitRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlGrossProfitRow({
  report,
  prevReport,
  isLoadingPrev,
}: PnlGrossProfitRowProps) {
  const { t } = useTranslation("garage");

  return (
    <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-foreground font-bold border-y border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <td className="py-3 px-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        <span>{t("pnl.grossProfitHeader", "III. Lợi nhuận gộp")}</span>
        <Badge
          variant="outline"
          className="ml-2 text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-foreground font-medium"
        >
          {report.grossMarginRate.toFixed(2)}% Doanh thu
        </Badge>
      </td>
      <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
        <div className="flex items-center justify-end gap-1.5">
          <span>{(report.oj?.grossProfit || 0).toLocaleString("vi-VN")} đ</span>
          {Boolean(report.oj && report.oj.revenue > 0) && (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
            >
              {report.oj!.grossMarginRate.toFixed(2)}% DT
            </Badge>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-bold text-foreground">
        <div className="flex items-center justify-end">
          <span>{report.grossProfit.toLocaleString("vi-VN")} đ</span>
          {renderDelta(
            report.grossProfit,
            prevReport?.grossProfit,
            false,
            isLoadingPrev,
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-muted-foreground">
        <div className="flex items-center justify-end gap-1.5">
          <span>{renderPrevVal(prevReport?.grossProfit, isLoadingPrev)}</span>
          {prevReport?.grossMarginRate !== undefined ? (
            <Badge
              variant="outline"
              className="text-[10px] px-1 py-0 border-slate-300/80 dark:border-slate-700 text-muted-foreground font-normal"
            >
              {prevReport.grossMarginRate.toFixed(2)}% DT
            </Badge>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
