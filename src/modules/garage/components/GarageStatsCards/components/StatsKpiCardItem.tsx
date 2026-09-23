import React from "react";
import { Eye, Receipt, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { money } from "@/shared/utils/format";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
import type { PeriodStatsData } from "../types";

interface StatsKpiCardItemProps {
  label: string;
  data?: PeriodStatsData;
  loading?: boolean;
  defaultChartLength?: number;
  revenueNetLabel: string;
  grossProfitShortLabel: string;
  vehiclesCompletedLabel: string;
  onCardClick: () => void;
  onSparklineClick: (index: number) => void;
}

export function StatsKpiCardItem({
  label,
  data,
  loading,
  defaultChartLength = 6,
  revenueNetLabel,
  grossProfitShortLabel,
  vehiclesCompletedLabel,
  onCardClick,
  onSparklineClick,
}: StatsKpiCardItemProps) {
  const rev = data?.totalRevenue || 0;
  const cost = data?.totalCost || 0;
  const profit = data?.totalProfit || rev - cost;
  const billed = data?.totalTienCoThue || rev;
  const paid = data?.totalPaid || 0;
  const receivable = data?.totalReceivable || 0;
  const rate = data?.collectionRate || (billed > 0 ? (paid / billed) * 100 : 0);
  const margin = rev > 0 ? ((profit / rev) * 100).toFixed(1) : "0.0";
  const defaultChart = Array(defaultChartLength).fill(0);

  return (
    <div
      onClick={onCardClick}
      className="cursor-pointer transition-transform hover:-translate-y-0.5 group"
    >
      <KpiCard
        loading={loading}
        label={label}
        value={money(rev)}
        badge={
          <div className="flex items-center gap-1.5">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-medium border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60"
            >
              {data?.totalCount || 0} {vehiclesCompletedLabel}
            </Badge>
            <Eye className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        }
        rightNode={
          <KpiSparkline
            data={data?.revenueChart || defaultChart}
            customTooltipItems={[
              {
                label: revenueNetLabel,
                data: data?.revenueChart || [],
              },
              {
                label: "Tổng phải thu (VAT)",
                data: data?.tienCoThueChart || [],
              },
              {
                label: "Đã thu",
                data: data?.paidChart || [],
              },
              {
                label: grossProfitShortLabel,
                data: data?.profitChart || [],
              },
            ]}
            labels={data?.labels || []}
            onClick={onSparklineClick}
          />
        }
        bottomNode={
          <div className="mt-1 pt-2 border-t border-border/60 flex flex-col gap-2">
            {/* Realized Payment Progress */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-slate-500" />
                  Tổng phải thu:{" "}
                  <strong className="text-foreground font-mono">
                    {money(billed)}
                  </strong>
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  Đã thu: {rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
                <span>
                  Đã thu:{" "}
                  <strong className="text-emerald-600 font-mono">
                    {money(paid)}
                  </strong>
                </span>
                <span>
                  Còn nợ:{" "}
                  <strong
                    className={cn(
                      "font-mono",
                      receivable > 0
                        ? "text-amber-600 font-bold"
                        : "text-emerald-600",
                    )}
                  >
                    {money(receivable)}
                  </strong>
                </span>
              </div>
            </div>

            {/* Profit & Margin */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-[11px]">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Receipt className="w-3 h-3 text-slate-500" />
                <span>
                  Giá vốn:{" "}
                  <strong className="text-foreground font-mono">
                    {money(cost)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 text-emerald-700 dark:text-emerald-400">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>
                  Lãi gộp:{" "}
                  <strong className="font-mono">
                    {money(profit)} ({margin}%)
                  </strong>
                </span>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
