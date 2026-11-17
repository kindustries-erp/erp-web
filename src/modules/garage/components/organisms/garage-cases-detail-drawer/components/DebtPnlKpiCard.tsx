import React from "react";
import { TrendingUp } from "lucide-react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export interface PnlSummaryData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  margin?: number;
}

export interface DebtPnlKpiCardProps {
  summary?: PnlSummaryData;
}

/** Component hiển thị các chỉ số P&L: Doanh thu thuần, Giá vốn và Lãi gộp */
export const DebtPnlKpiCard: React.FC<DebtPnlKpiCardProps> = ({ summary }) => {
  const rev = summary?.totalRevenue || 0;
  const cost = summary?.totalCost || 0;
  const profit = summary?.totalProfit || 0;
  const margin =
    summary?.margin !== undefined
      ? summary.margin
      : rev > 0
        ? (profit / rev) * 100
        : 0;

  return (
    <div className="grid grid-cols-1 gap-2 w-full">
      {/* 1. Doanh thu thuần */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 shadow-xs">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Doanh thu thuần
        </span>
        <span className="text-[13px] font-bold font-mono text-foreground tabular-nums">
          {money(rev)}
        </span>
      </div>

      {/* 2. Giá vốn dịch vụ */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 shadow-xs">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Giá vốn dịch vụ
        </span>
        <span className="text-[13px] font-bold font-mono text-muted-foreground tabular-nums">
          {money(cost)}
        </span>
      </div>

      {/* 3. Lãi gộp & Biên LN */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 shadow-xs">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-primary" />
          <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
            Lãi gộp toàn kỳ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[13px] font-bold font-mono tabular-nums",
              profit >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600",
            )}
          >
            {money(profit)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
            ({margin.toFixed(1)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
