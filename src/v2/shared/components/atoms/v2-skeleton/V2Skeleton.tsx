import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2SkeletonProps } from "./V2Skeleton.type";

/** Khung chờ: đặt kích thước bằng `className` (ví dụ `h-4 w-32`) */
export const V2Skeleton: React.FC<V2SkeletonProps> = ({
  className,
  ...props
}) => (
  <div
    aria-hidden
    className={cn(
      "animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40",
      className,
    )}
    {...props}
  />
);
V2Skeleton.displayName = "V2Skeleton";
