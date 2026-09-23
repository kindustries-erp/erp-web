import React from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlCommissionDvRowProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlCommissionDvRow({
  report,
  prevReport,
  isLoadingPrev,
}: PnlCommissionDvRowProps) {
  const { t } = useTranslation("garage");

  const dvItem = (report.commission?.items || []).find(
    (i: { categoryKey?: string }) => i.categoryKey === "HOA_HONG_DV",
  );
  const dvAmount = dvItem?.amount ?? report.commission.auto?.dvCommission ?? 0;

  return (
    <tr className="text-slate-700 dark:text-slate-300 hover:bg-muted/10 transition-colors border-b border-border/20">
      <td className="py-2.5 px-8">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {t("pnl.dvCommission", "Hoa hồng cho DV (10%)")}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-normal"
            >
              10% × (LN ròng - HH Sale)
            </Badge>
            <Tooltip
              content={t(
                "pnl.autoCalculatedTooltip",
                "Khoản hoa hồng này được tính toán tự động 100% từ Báo cáo P&L (Chỉ đọc)",
              )}
            >
              <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300/80 dark:border-amber-700/60 cursor-help shrink-0 shadow-xs hover:bg-amber-500/20 transition-colors">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            </Tooltip>
          </div>
          <span className="text-[11px] text-muted-foreground font-normal">
            {dvItem?.note ||
              t(
                "pnl.dvCommissionSubtitle",
                "Tính trên 10% Lợi nhuận ròng sau khi trừ hoa hồng Sale",
              )}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
        {(
          dvItem?.ojAmount ??
          report.oj?.commissionAuto?.dvCommission ??
          0
        ).toLocaleString("vi-VN")}{" "}
        đ
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono font-semibold">
        <div className="flex items-center justify-end">
          <span>{dvAmount.toLocaleString("vi-VN")} đ</span>
          {renderDelta(
            dvAmount,
            prevReport?.commission?.items?.find(
              (i: { categoryKey?: string }) => i.categoryKey === "HOA_HONG_DV",
            )?.amount ?? prevReport?.commission?.auto?.dvCommission,
            true,
            isLoadingPrev,
          )}
        </div>
      </td>
      <td className="py-2.5 px-4 text-right tabular-nums font-mono text-muted-foreground">
        {renderPrevVal(
          prevReport?.commission?.items?.find(
            (i: { categoryKey?: string }) => i.categoryKey === "HOA_HONG_DV",
          )?.amount ?? prevReport?.commission?.auto?.dvCommission,
          isLoadingPrev,
        )}
      </td>
    </tr>
  );
}
