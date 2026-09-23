import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlRevenueRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlRevenueRows({
  report,
  prevReport,
  isLoadingPrev,
}: PnlRevenueRowsProps) {
  const { t } = useTranslation("garage");

  return (
    <>
      {/* I. Doanh Thu */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4">
          {t("pnl.revenueHeader", "I. Doanh Thu")}
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
          <div className="flex items-center justify-end gap-1.5">
            <span>{(report.oj?.revenue || 0).toLocaleString("vi-VN")} đ</span>
            {Boolean(
              report.oj && report.oj.revenue > 0 && report.revenue > 0,
            ) && (
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
              >
                {((report.oj!.revenue / report.revenue) * 100).toFixed(1)}% DT
              </Badge>
            )}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
          <div className="flex items-center justify-end">
            <span>{report.revenue.toLocaleString("vi-VN")} đ</span>
            {renderDelta(
              report.revenue,
              prevReport?.revenue,
              false,
              isLoadingPrev,
            )}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
          {renderPrevVal(prevReport?.revenue, isLoadingPrev)}
        </td>
      </tr>
      <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8">
          {t("pnl.revenueService", "Doanh Thu Dịch Vụ")}
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
          {(report.oj?.revenue || 0).toLocaleString("vi-VN")} đ
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono">
          {report.revenue.toLocaleString("vi-VN")} đ
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
          {renderPrevVal(prevReport?.revenue, isLoadingPrev)}
        </td>
      </tr>
    </>
  );
}
