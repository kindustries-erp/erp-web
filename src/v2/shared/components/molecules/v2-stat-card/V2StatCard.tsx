import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import type { V2StatCardProps, V2StatTrendDirection } from "./V2StatCard.type";

const TREND_CLASS: Record<V2StatTrendDirection, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  flat: "text-muted-foreground",
};

export const V2StatCard: React.FC<V2StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  trend,
  loading = false,
  className,
}) => (
  <div
    aria-busy={loading}
    className={cn(
      "flex flex-col gap-2 rounded-lg border border-border bg-background p-4",
      className,
    )}
  >
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    {loading ? (
      <div className="h-8 w-24 animate-pulse rounded bg-muted" />
    ) : (
      <div className="flex items-baseline gap-1 tabular-nums">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    )}
    {trend && (
      <span className={cn("text-xs", TREND_CLASS[trend.direction])}>
        {trend.label}
      </span>
    )}
  </div>
);
V2StatCard.displayName = "V2StatCard";
