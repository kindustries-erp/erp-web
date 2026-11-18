import React from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";

export interface CollectionDonutProps {
  /** Số tiền đã thu */
  paid: number;
  /** Tổng tiền phải thu / phát sinh */
  billed: number;
  /** Số tiền còn nợ */
  receivable: number;
  /** Tỷ lệ phần trăm đã thu (0 - 100) */
  rate: number;
  /** Kích thước đường kính Donut (pixel), mặc định 50px */
  size?: number;
  className?: string;
}

/**
 * Component SVG Donut Chart hiển thị tỷ lệ thu tiền thực tế (Phải thu vs Đã thu):
 * - Cung tròn Emerald: Đại diện tỷ lệ Đã thu
 * - Cung tròn Amber/Slate: Đại diện tỷ lệ Còn nợ / Chưa thu
 * - Tâm Donut: Hiển thị to rõ tỷ lệ % đã thu và nhãn phụ 'thu'
 * - App Tooltip: Hiển thị chi tiết số tiền Tổng phát sinh, Đã thu, Còn nợ
 */
export function CollectionDonutChart({
  paid,
  billed,
  receivable,
  rate,
  size = 50,
  className,
}: CollectionDonutProps) {
  // Các thông số hình học SVG tỉ lệ theo size
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 5;
  const r = (size - strokeWidth - 4) / 2;
  const circumference = 2 * Math.PI * r;

  const safeRate = Math.min(100, Math.max(0, rate));
  const paidLength = (safeRate / 100) * circumference;
  const hasRemaining = receivable > 0 && billed > 0;

  const tooltipContent = (
    <div
      className="text-xs flex flex-col gap-1 p-0.5 min-w-[170px]"
      data-testid="collection-tooltip-content"
    >
      <div className="font-semibold text-foreground border-b border-border/60 pb-1">
        Tiến độ thu tiền ({safeRate.toFixed(1)}%)
      </div>
      <div className="flex justify-between gap-3 text-muted-foreground">
        <span>Tổng phát sinh:</span>
        <span className="font-mono font-medium text-foreground">
          {money(billed)}
        </span>
      </div>
      <div className="flex justify-between gap-3 text-emerald-600 dark:text-emerald-400">
        <span>Đã thu:</span>
        <span className="font-mono font-medium">{money(paid)}</span>
      </div>
      {receivable > 0 && (
        <div className="flex justify-between gap-3 text-amber-600 dark:text-amber-400">
          <span>Còn nợ:</span>
          <span className="font-mono font-medium">{money(receivable)}</span>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent} side="top">
      <div
        className={cn(
          "relative shrink-0 flex items-center justify-center cursor-help",
          className,
        )}
        style={{ width: size, height: size }}
        data-testid="collection-donut-chart"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90 origin-center overflow-visible"
        >
          {/* Vòng tròn nền (nếu còn nợ thì có viền hổ phách nhẹ, nếu không là xám) */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={cn(
              hasRemaining
                ? "text-amber-500/25 dark:text-amber-500/30"
                : "text-slate-200 dark:text-slate-800",
            )}
          />

          {/* Cung tròn tỷ lệ Đã thu (Màu xanh Emerald) */}
          {safeRate > 0 && (
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="#10b981"
              strokeWidth={strokeWidth}
              strokeDasharray={`${paidLength} ${circumference - paidLength}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              className="transition-all duration-500"
              data-testid="donut-paid-segment"
            />
          )}
        </svg>

        {/* Hiển thị phần trăm đã thu ở tâm Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span
            className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400 leading-none"
            data-testid="donut-center-rate"
          >
            {Math.round(safeRate)}%
          </span>
          <span className="text-[7.5px] font-medium text-muted-foreground uppercase leading-none mt-0.5">
            thu
          </span>
        </div>
      </div>
    </Tooltip>
  );
}
