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
            className="flex flex-col gap-2 rounded-xl border border-border/60 bg-surface p-3"
          >
            <V2Skeleton
              data-testid="v2-table-skeleton-bar"
              className="h-4 w-1/2"
            />
            <V2Skeleton className="h-3 w-3/4" />
            <V2Skeleton className="h-3 w-1/3" />
          </li>
        ))}
      </ul>
    </>
  );
}
