import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlCommissionHeaderRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlCommissionHeaderRow({
  report,
  prevReport,
  isLoadingPrev,
}: PnlCommissionHeaderRowProps) {
  const { t } = useTranslation("garage");

  return (
    <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-2.5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span>{t("pnl.commissionHeader", "VI. Hoa hồng")}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
          >
            {report.netProfitBeforeCommission > 0
              ? `${((report.commission.total / report.netProfitBeforeCommission) * 100).toFixed(1)}% LN ròng trước HH`
              : "0% LN ròng"}
          </Badge>
        </div>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
        <span>
          {(report.oj?.commissionTotal || 0).toLocaleString("vi-VN")} đ
        </span>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
        <div className="flex items-center justify-end">
          <span>{report.commission.total.toLocaleString("vi-VN")} đ</span>
          {renderDelta(
            report.commission.total,
            prevReport?.commission.total,
            true,
            isLoadingPrev,
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
        {renderPrevVal(prevReport?.commission.total, isLoadingPrev)}
      </td>
    </tr>
  );
}
