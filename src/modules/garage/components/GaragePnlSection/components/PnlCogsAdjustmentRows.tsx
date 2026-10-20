import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui/badge";
import type { GaragePnlReportResponse } from "@/modules/garage/api/garageOpexApi";
import type { PairedPnlItem } from "../types";
import { renderPrevVal } from "../utils/pnlHelpers";
import { PnlAmountCell } from "./PnlAmountCell";

interface PnlCogsAdjustmentRowsProps {
  report: GaragePnlReportResponse;
  prevReport?: GaragePnlReportResponse;
  prev2Report?: GaragePnlReportResponse;
  cogsAdjustments: PairedPnlItem[];
  isLoadingPrev: boolean;
  isLoadingPrev2?: boolean;
  isOjOnly?: boolean;
}

export function PnlCogsAdjustmentRows({
  report,
  prevReport,
  prev2Report,
  cogsAdjustments,
  isLoadingPrev,
  isLoadingPrev2 = false,
  isOjOnly = false,
}: PnlCogsAdjustmentRowsProps) {
  const { t } = useTranslation("garage");
  const subCell =
    "py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground";

  if (!isOjOnly && cogsAdjustments.length === 0) return null;

  const adjTotal0 = isOjOnly
    ? report.oj?.cogsAdjustmentTotal || 0
    : report.cogsAdjustment?.total || 0;
  const adjTotal1 = isOjOnly
    ? prevReport?.oj?.cogsAdjustmentTotal
    : prevReport?.cogsAdjustment?.total;
  const adjTotal2 = isOjOnly
    ? prev2Report?.oj?.cogsAdjustmentTotal
    : prev2Report?.cogsAdjustment?.total;

  const displayAdjustments = isOjOnly
    ? cogsAdjustments.filter(
        (i) =>
          (i.curOjAmount && i.curOjAmount > 0) ||
          (i.prevOjAmount && i.prevOjAmount > 0) ||
          (i.prev2OjAmount && i.prev2OjAmount > 0),
      )
    : cogsAdjustments;

  return (
    <>
      {/* 2.2. Chi phí trực tiếp nhập tay (Điều chỉnh giá vốn) */}
      <tr className="text-slate-700 dark:text-slate-300 bg-slate-50/40 dark:bg-slate-800/20 font-medium hover:bg-muted/10 transition-colors">
        <td className="py-2 px-8 font-medium">
          {t(
            "pnl.cogsAdjustmentHeader",
            "2.2. Chi phí trực tiếp nhập tay (Điều chỉnh giá vốn)",
          )}
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono font-semibold">
          {adjTotal0.toLocaleString("vi-VN")} đ
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-slate-700 dark:text-slate-300">
          {renderPrevVal(adjTotal1, isLoadingPrev)}
        </td>
        <td className="py-2 px-4 text-right tabular-nums font-mono text-muted-foreground">
          {renderPrevVal(adjTotal2, isLoadingPrev2)}
        </td>
      </tr>

      {/* Hiển thị gợi ý nếu ở chế độ OJ và chưa có chi phí */}
      {isOjOnly && displayAdjustments.length === 0 ? (
        <tr className="text-muted-foreground/60 italic hover:bg-muted/10">
          <td className="py-1.5 pl-14 pr-4">
            {t(
              "pnl.noOjDirectCostHint",
              "2.2.1. Chưa có chi phí trực tiếp phân bổ cho OJ",
            )}
          </td>
          <PnlAmountCell
            amount={null}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
          <PnlAmountCell
            amount={null}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
          <PnlAmountCell
            amount={null}
            hideDelta
            hideRate
            tdClassName={subCell}
          />
        </tr>
      ) : (
        /* Direct Costs breakdown: 2.2.x và 2.2.x.1 */
        displayAdjustments.map((item, idx) => {
          const curVal = isOjOnly ? item.curOjAmount : item.curAmount;
          const prevVal = isOjOnly ? item.prevOjAmount : item.prevAmount;
          const prev2Val = isOjOnly ? item.prev2OjAmount : item.prev2Amount;

          return (
            <React.Fragment key={item.key}>
              <tr className="text-muted-foreground hover:bg-muted/10 transition-colors">
                <td className="py-1.5 pl-14 pr-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">
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
                <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground font-normal">
                  {curVal && curVal > 0
                    ? `${curVal.toLocaleString("vi-VN")} đ`
                    : "—"}
                </td>
                <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                  {prevVal !== undefined && prevVal > 0
                    ? `${prevVal.toLocaleString("vi-VN")} đ`
                    : "—"}
                </td>
                <td className="py-1.5 px-4 text-right tabular-nums font-mono text-[11px] text-muted-foreground">
                  {prev2Val !== undefined && prev2Val > 0
                    ? `${prev2Val.toLocaleString("vi-VN")} đ`
                    : "—"}
                </td>
              </tr>

              {/* Sub item Level 4 nếu có ojAmount > 0 ở bất kỳ tháng nào (Chỉ hiện khi xem Toàn bộ) */}
              {!isOjOnly &&
                Boolean(
                  (item.curOjAmount && item.curOjAmount > 0) ||
                  (item.prevOjAmount && item.prevOjAmount > 0) ||
                  (item.prev2OjAmount && item.prev2OjAmount > 0),
                ) && (
                  <tr className="text-muted-foreground bg-slate-50/30 dark:bg-slate-800/10 hover:bg-muted/10 transition-colors border-b border-border/20">
                    <td className="py-1.5 pl-20 pr-4">
                      <span className="text-[11px] italic">
                        2.2.{idx + 1}.1. Trong đó: Phát sinh liên quan OJ
                      </span>
                    </td>
                    <PnlAmountCell
                      amount={item.curOjAmount || null}
                      hideDelta
                      hideRate
                      tdClassName={subCell}
                    />
                    <PnlAmountCell
                      amount={item.prevOjAmount || null}
                      isLoading={isLoadingPrev}
                      hideDelta
                      hideRate
                      tdClassName={subCell}
                    />
                    <PnlAmountCell
                      amount={item.prev2OjAmount || null}
                      isLoading={isLoadingPrev2}
                      hideDelta
                      hideRate
                      tdClassName={subCell}
                    />
                  </tr>
                )}
            </React.Fragment>
          );
        })
      )}
    </>
  );
}
