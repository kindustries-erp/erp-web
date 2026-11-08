import * as React from "react";
import { V2Skeleton } from "@/v2/shared/components/atoms/v2-skeleton";

export const V2_TABLE_SKELETON_CARDS = 3;

/** Thẻ skeleton cho giao diện mobile, cùng khung với card dữ liệu */
export function V2TableSkeletonCards({
  loadingLabel,
  count = V2_TABLE_SKELETON_CARDS,
}: {
  loadingLabel: string;
  count?: number;
}) {
  return (
    <>
      <span role="status" className="sr-only">
        {loadingLabel}
      </span>
      <ul className="flex flex-col gap-2" aria-hidden>
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="flex flex-col gap-2 rounded-xl border border-border/50 dark:border-white/[0.06] bg-[var(--drawer-section-bg,var(--surface))] p-3 shadow-[0_2px_8px_-1px_rgba(0,0,0,0.06),0_1px_4px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.03)_inset]"
          >
            <div className="flex flex-col gap-1 pb-2 border-b border-border/40 dark:border-white/[0.05]">
              <V2Skeleton
                data-testid="v2-table-skeleton-bar"
                className="h-3 w-8"
              />
              <V2Skeleton className="h-4 w-1/2" />
              <V2Skeleton className="h-3 w-1/3" />
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-0.5">
              <div className="space-y-1">
                <V2Skeleton className="h-2.5 w-12" />
                <V2Skeleton className="h-3.5 w-24" />
              </div>
              <div className="space-y-1">
                <V2Skeleton className="h-2.5 w-12" />
                <V2Skeleton className="h-3.5 w-20" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
