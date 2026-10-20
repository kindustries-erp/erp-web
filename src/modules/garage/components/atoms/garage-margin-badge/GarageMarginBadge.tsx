import React from "react";
import { cn } from "@/shared/utils";
import type { GarageMarginBadgeProps } from "./GarageMarginBadge.type";

/**
 * 6 dải màu chuẩn theo báo cáo Xuất Excel bảng kê phiếu dịch vụ:
 * - Dải 1: Âm (< 0%): Đỏ nhạt Rose (Red-200)
 * - Dải 2: Thấp (0% - < 20%): Cam nhạt Amber (Orange-200)
 * - Dải 3: Trung bình (20% - < 40%): Xanh dương nhạt Sky (Sky-200)
 * - Dải 4: Khá (40% - < 60%): Xanh lá nhạt Emerald (Green-200)
 * - Dải 5: Tốt (60% - < 80%): Xanh mòng két Teal (Teal-200)
 * - Dải 6: Xuất sắc (>= 80%): Tím phong lan Purple (Purple-200)
 */
export function getMarginRangeClasses(margin: number): string {
  if (margin < 0) {
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40";
  }
  if (margin < 20) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40";
  }
  if (margin < 40) {
    return "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/40";
  }
  if (margin < 60) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40";
  }
  if (margin < 80) {
    return "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200/60 dark:border-teal-900/40";
  }
  return "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/40";
}

export function GarageMarginBadge({
  margin,
  revenue,
  className,
}: GarageMarginBadgeProps) {
  if (
    margin === null ||
    margin === undefined ||
    (revenue !== undefined && Number(revenue) <= 0 && Number(margin) === 0)
  ) {
    return (
      <span className="text-muted-foreground/40 font-normal select-none">
        —
      </span>
    );
  }

  const numMargin = Number(margin);
  if (Number.isNaN(numMargin)) {
    return (
      <span className="text-muted-foreground/40 font-normal select-none">
        —
      </span>
    );
  }

  const formattedText =
    numMargin > 0 ? `+${numMargin.toFixed(1)}%` : `${numMargin.toFixed(1)}%`;

  const colorClasses = getMarginRangeClasses(numMargin);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-end px-1.5 py-0.5 rounded text-[11px] font-semibold font-mono tabular-nums border select-none transition-colors",
        colorClasses,
        className,
      )}
    >
      {formattedText}
    </span>
  );
}
