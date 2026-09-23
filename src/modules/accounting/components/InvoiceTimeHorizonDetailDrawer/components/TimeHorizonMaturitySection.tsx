import React from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { money } from "@/shared/utils/format";
import type { TimeHorizonDetailSummary } from "../types";

export interface TimeHorizonMaturitySectionProps {
  summary?: TimeHorizonDetailSummary | null;
  direction: "IN" | "OUT";
  t: any;
}

export function TimeHorizonMaturitySection({
  summary,
  direction,
  t,
}: TimeHorizonMaturitySectionProps) {
  const isReceivable = direction === "OUT";
  const mb = summary?.maturityBreakdown;
  if (!mb) return null;

  const totalAmount = isReceivable
    ? summary?.receivableAmount || 0
    : direction === "IN"
      ? summary?.payableAmount || 0
      : (summary?.receivableAmount || 0) + (summary?.payableAmount || 0);

  const dueAmount = isReceivable
    ? mb?.outDueInPeriodAmount || 0
    : direction === "IN"
      ? mb?.inDueInPeriodAmount || 0
      : (mb?.outDueInPeriodAmount || 0) + (mb?.inDueInPeriodAmount || 0);

  const dueCount = isReceivable
    ? mb?.outDueInPeriodCount || 0
    : direction === "IN"
      ? mb?.inDueInPeriodCount || 0
      : (mb?.outDueInPeriodCount || 0) + (mb?.inDueInPeriodCount || 0);

  const overdueAmount = isReceivable
    ? mb?.outOverdueCarriedAmount || 0
    : direction === "IN"
      ? mb?.inOverdueCarriedAmount || 0
      : (mb?.outOverdueCarriedAmount || 0) + (mb?.inOverdueCarriedAmount || 0);

  const overdueCount = isReceivable
    ? mb?.outOverdueCarriedCount || 0
    : direction === "IN"
      ? mb?.inOverdueCarriedCount || 0
      : (mb?.outOverdueCarriedCount || 0) + (mb?.inOverdueCarriedCount || 0);

  const duePercent =
    totalAmount > 0 ? Number(((dueAmount / totalAmount) * 100).toFixed(1)) : 0;
  const overduePercent =
    totalAmount > 0
      ? Number(((overdueAmount / totalAmount) * 100).toFixed(1))
      : 0;

  return (
    <DrawerSection
      title={t(
        "debts:horizonDrawer.flowBreakdownTitle",
        "Bóc tách Cơ cấu Nguồn tiền Đến hạn & Quá hạn",
      )}
      collapsible
      defaultCollapsed={false}
    >
      <div className="p-3 rounded-xl border border-border/70 bg-card space-y-2.5 text-xs">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span>Bóc tách nguồn tiền dự {isReceivable ? "thu" : "chi"}</span>
          <span className="font-mono text-xs text-foreground font-bold">
            {money(totalAmount)}
          </span>
        </div>

        {/* Segment 1: Due in period */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-muted-foreground font-medium">
                {t(
                  "debts:horizonDrawer.dueInPeriod",
                  "Đến hạn trong kỳ (Chuẩn chu kỳ)",
                )}
              </span>
            </div>
            <div className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {money(dueAmount)}{" "}
              <span className="text-[10px] text-muted-foreground font-normal">
                ({duePercent}%)
              </span>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground pl-3.5">
            {dueCount} {t("debts:unitInvoice", "hóa đơn")} có ngày dự kiến thanh
            toán rơi đúng kỳ
          </div>
        </div>

        {/* Segment 2: Overdue carried over */}
        <div className="space-y-1 pt-1 border-t border-border/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-muted-foreground font-medium">
                {t(
                  "debts:horizonDrawer.overdueCarried",
                  "Quá hạn trôi sang (DSO quá hạn)",
                )}
              </span>
            </div>
            <div className="font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
              {money(overdueAmount)}{" "}
              <span className="text-[10px] text-muted-foreground font-normal">
                ({overduePercent}%)
              </span>
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground pl-3.5">
            {overdueCount} {t("debts:unitInvoice", "hóa đơn")} theo chu kỳ đáng
            lẽ đã thanh toán, trôi sang kỳ này
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${duePercent}%` }}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${overduePercent}%` }}
          />
        </div>
      </div>
    </DrawerSection>
  );
}
