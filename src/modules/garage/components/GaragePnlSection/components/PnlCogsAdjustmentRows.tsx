import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import type { PairedPnlItem } from "../types";
import { renderPrevVal } from "../utils/pnlHelpers";

interface PnlCogsAdjustmentRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  cogsAdjustments: PairedPnlItem[];
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
}

export function PnlCogsAdjustmentRows({
  report,
  prevReport,
  prev2Report,
  cogsAdjustments,
  isLoadingPrev,
  isLoadingPrev2 = false,
}: PnlCogsAdjustmentRowsProps) {
  const { t } = useTranslation("garage");

  if (cogsAdjustments.length === 0) return null;

  return (
    <>
      {/* 2.2. Chi phí trực tiếp nhập tay (Điều chỉnh giá vốn) */}
      <tr className="text-slate-600 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-800/20 font-medium">
        <td className="py-2 px-8">
          {t(
            "pnl.cogsAdjustmentHeader",
            "2.2. Chi phí trực tiếp nhập tay (Điều chỉnh giá vốn)",
          )}
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono font-medium">
          {(report.cogsAdjustment?.total || 0).toLocaleString("vi-VN")} đ
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300">
          {renderPrevVal(prevReport?.cogsAdjustment?.total, isLoadingPrev)}
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
          {renderPrevVal(prev2Report?.cogsAdjustment?.total, isLoadingPrev2)}
        </td>
      </tr>

      {/* Direct Costs breakdown: 2.2.x và 2.2.x.1 */}
      {cogsAdjustments.map((item, idx) => (
        <React.Fragment key={item.key}>
          <tr className="text-slate-600 dark:text-slate-400 hover:bg-muted/10 transition-colors">
            <td className="py-2 pl-12 pr-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span>
                  2.2.{idx + 1}. {item.categoryName}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] px-1 py-0 border-slate-300 dark:border-slate-700 text-muted-foreground"
                >
                  {t("pnl.manualBadge", "Nhập tay")}
                </Badge>
              </div>
              {item.note && (
                <span className="text-[10px] opacity-75 italic max-w-[180px] truncate">
                  ({item.note})
                </span>
              )}
            </td>
            <td className="py-2 px-4 text-right tabular-nums font-mono font-medium">
              {item.curAmount > 0
                ? `${item.curAmount.toLocaleString("vi-VN")} đ`
                : "—"}
            </td>
            <td className="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300">
              {item.prevAmount !== undefined && item.prevAmount > 0
                ? `${item.prevAmount.toLocaleString("vi-VN")} đ`
                : "—"}
            </td>
            <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
              {item.prev2Amount !== undefined && item.prev2Amount > 0
                ? `${item.prev2Amount.toLocaleString("vi-VN")} đ`
                : "—"}
            </td>
          </tr>

          {/* Sub item Level 4 nếu có ojAmount > 0 ở bất kỳ tháng nào */}
          {Boolean(
            (item.curOjAmount && item.curOjAmount > 0) ||
            (item.prevOjAmount && item.prevOjAmount > 0) ||
            (item.prev2OjAmount && item.prev2OjAmount > 0),
          ) && (
            <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
              <td className="py-1.5 pl-16 pr-4">
                <span className="text-[11px] italic">
                  2.2.{idx + 1}.1. Trong đó: Phát sinh liên quan OJ
                </span>
              </td>
              <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                {item.curOjAmount
                  ? `${item.curOjAmount.toLocaleString("vi-VN")} đ`
                  : "—"}
              </td>
              <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                {item.prevOjAmount
                  ? `${item.prevOjAmount.toLocaleString("vi-VN")} đ`
                  : "—"}
              </td>
              <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                {item.prev2OjAmount
                  ? `${item.prev2OjAmount.toLocaleString("vi-VN")} đ`
                  : "—"}
              </td>
            </tr>
          )}
        </React.Fragment>
      ))}
    </>
  );
}
