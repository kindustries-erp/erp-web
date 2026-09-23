import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems, renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlCogsRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
}

export function PnlCogsRows({
  report,
  prevReport,
  isLoadingPrev,
}: PnlCogsRowsProps) {
  const { t } = useTranslation("garage");
  const cogsAdjustments = mergePnlItems(
    report.cogsAdjustment?.items,
    prevReport?.cogsAdjustment?.items,
  );

  return (
    <>
      {/* II. Chi phí (Giá vốn) */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4 flex items-center gap-1.5">
          <span>{t("pnl.cogsHeader", "II. Chi phí (Giá vốn)")}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
          >
            {report.revenue > 0
              ? ((report.cogs / report.revenue) * 100).toFixed(1)
              : 0}
            % DT
          </Badge>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
          <div className="flex items-center justify-end gap-1.5">
            <span>{(report.oj?.cogs || 0).toLocaleString("vi-VN")} đ</span>
            {Boolean(report.oj && report.oj.revenue > 0) && (
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground font-normal"
              >
                {(((report.oj!.cogs || 0) / report.oj!.revenue) * 100).toFixed(
                  1,
                )}
                % DT
              </Badge>
            )}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
          <div className="flex items-center justify-end">
            <span>{report.cogs.toLocaleString("vi-VN")} đ</span>
            {renderDelta(report.cogs, prevReport?.cogs, true, isLoadingPrev)}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
          <div className="flex items-center justify-end gap-1.5">
            <span>{renderPrevVal(prevReport?.cogs, isLoadingPrev)}</span>
            {prevReport?.revenue && prevReport.revenue > 0 ? (
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground/80 font-normal"
              >
                {((prevReport.cogs / prevReport.revenue) * 100).toFixed(1)}% DT
              </Badge>
            ) : null}
          </div>
        </td>
      </tr>
      <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8">
          {t(
            "pnl.cogsDirect",
            "Chi phí phụ tùng & Gia công ngoài (từ vụ việc)",
          )}
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
          {(report.oj?.cogsDirect || 0).toLocaleString("vi-VN")} đ
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono">
          {(report.cogsDirect ?? report.cogs).toLocaleString("vi-VN")} đ
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
          {renderPrevVal(
            prevReport?.cogsDirect ?? prevReport?.cogs,
            isLoadingPrev,
          )}
        </td>
      </tr>

      {/* Direct Costs / COGS adjustments breakdown */}
      {cogsAdjustments.map((item) => (
        <tr
          key={item.key}
          className="text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-muted/10 transition-colors"
        >
          <td className="py-2 px-8 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>{item.categoryName}</span>
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
              >
                Nhập tay
              </Badge>
            </div>
            {item.note && (
              <span className="text-[10px] opacity-75 italic max-w-[180px] truncate">
                ({item.note})
              </span>
            )}
          </td>
          <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
            {item.curOjAmount !== undefined && item.curOjAmount > 0
              ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
              : "—"}
          </td>
          <td className="py-2 px-4 text-right tabular-nums font-mono">
            {item.curAmount > 0
              ? `${item.curAmount.toLocaleString("vi-VN")} đ`
              : "—"}
          </td>
          <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
            {item.prevAmount !== undefined && item.prevAmount > 0
              ? `${item.prevAmount.toLocaleString("vi-VN")} đ`
              : "—"}
          </td>
        </tr>
      ))}
    </>
  );
}
