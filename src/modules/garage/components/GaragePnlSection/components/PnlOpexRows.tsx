import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import { mergePnlItems, renderPrevVal, renderDelta } from "../utils/pnlHelpers";

interface PnlOpexRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  isLoadingPrev: boolean;
  onOpenDrawer: () => void;
}

export function PnlOpexRows({
  report,
  prevReport,
  isLoadingPrev,
  onOpenDrawer,
}: PnlOpexRowsProps) {
  const { t } = useTranslation("garage");
  const opexItems = mergePnlItems(report.opex?.items, prevReport?.opex?.items);

  return (
    <>
      {/* IV. Chi phí vận hành */}
      <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-foreground hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <td className="py-2.5 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span>{t("pnl.opexHeader", "IV. Chi phí vận hành")}</span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
            >
              {report.revenue > 0
                ? ((report.opex.total / report.revenue) * 100).toFixed(1)
                : 0}
              % DT
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenDrawer}
            className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
          >
            <Plus className="w-3 h-3" />
            <span>{t("opex.actions.addExpense", "Thêm CP")}</span>
          </Button>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300 border-r border-border/40">
          <span>{(report.oj?.opexTotal || 0).toLocaleString("vi-VN")} đ</span>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px]">
          <div className="flex items-center justify-end">
            <span>{report.opex.total.toLocaleString("vi-VN")} đ</span>
            {renderDelta(
              report.opex.total,
              prevReport?.opex.total,
              true,
              isLoadingPrev,
            )}
          </div>
        </td>
        <td className="py-2.5 px-4 text-right tabular-nums font-mono text-[13px] text-muted-foreground">
          <div className="flex items-center justify-end gap-1.5">
            <span>{renderPrevVal(prevReport?.opex.total, isLoadingPrev)}</span>
            {prevReport?.revenue && prevReport.revenue > 0 ? (
              <Badge
                variant="outline"
                className="text-[10px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground/80 font-normal"
              >
                {((prevReport.opex.total / prevReport.revenue) * 100).toFixed(
                  1,
                )}
                % DT
              </Badge>
            ) : null}
          </div>
        </td>
      </tr>

      {opexItems.length === 0 ? (
        <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
          <td className="py-2 px-8">
            {t("pnl.noOpexHint", "Chưa nhập chi phí vận hành cho tháng này")}
          </td>
          <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground border-r border-border/40">
            0 đ
          </td>
          <td className="py-2 px-4 text-right tabular-nums font-mono">0 đ</td>
          <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
            {renderPrevVal(prevReport?.opex.total, isLoadingPrev)}
          </td>
        </tr>
      ) : (
        opexItems.map((item) => (
          <tr
            key={item.key}
            className="text-muted-foreground hover:bg-muted/10 transition-colors"
          >
            <td className="py-2 px-8 flex items-center justify-between">
              <span>{item.categoryName}</span>
              {item.note && (
                <span className="text-[10px] text-muted-foreground/70 italic max-w-[200px] truncate">
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
        ))
      )}
    </>
  );
}
