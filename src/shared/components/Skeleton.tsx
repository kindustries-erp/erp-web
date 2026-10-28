import * as React from "react";
import { cn } from "@/shared/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40",
        className,
      )}
      {...props}
    />
  );
}

export function ChartSkeleton({ type = "bar" }: { type?: "bar" | "donut" }) {
  if (type === "donut") {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-[150px] h-[150px] rounded-full border-[20px] border-slate-200/80 dark:border-slate-700/80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center w-full h-full gap-4 px-4 pb-4 pt-8">
      {[40, 70, 45, 90, 60, 80].map((height, i) => (
        <div
          key={i}
          className="w-10 rounded-t-sm bg-slate-200/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 animate-pulse"
          style={{ height: `${height}%`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}
