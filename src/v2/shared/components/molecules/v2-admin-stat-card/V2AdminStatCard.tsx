import * as React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { V2Text } from "@/v2/shared/components/atoms";
import { V2AdminStatVariant } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import type { V2AdminStatCardProps } from "./V2AdminStatCard.type";

const variantStyles: Record<string, { iconBg: string; text: string }> = {
  [V2AdminStatVariant.DEFAULT]: {
    iconBg: "bg-primary/10 text-primary",
    text: "text-foreground",
  },
  [V2AdminStatVariant.SUCCESS]: {
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  [V2AdminStatVariant.WARNING]: {
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    text: "text-amber-600 dark:text-amber-400",
  },
  [V2AdminStatVariant.DANGER]: {
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    text: "text-rose-600 dark:text-rose-400",
  },
};

export const V2AdminStatCard: React.FC<V2AdminStatCardProps> = ({
  title,
  value,
  subtitle,
  growthRate,
  icon: Icon,
  variant = V2AdminStatVariant.DEFAULT,
  className,
}) => {
  const styles =
    variantStyles[variant] ?? variantStyles[V2AdminStatVariant.DEFAULT];

  return (
    <div
      data-testid="admin-stat-card"
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between transition-all duration-150",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <V2Text
          variant="caption"
          weight="medium"
          color="muted"
          truncate
          className="line-clamp-1"
        >
          {title}
        </V2Text>
        {Icon && (
          <div className={cn("p-1.5 rounded-lg shrink-0", styles.iconBg)}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <V2Text
          variant="h2"
          weight="bold"
          className="tracking-tight text-foreground"
        >
          {value}
        </V2Text>
        {growthRate !== undefined && (
          <div
            className={cn(
              "inline-flex items-center text-xs font-semibold",
              growthRate >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400",
            )}
          >
            {growthRate >= 0 ? (
              <ArrowUpRight size={13} className="mr-0.5" />
            ) : (
              <ArrowDownRight size={13} className="mr-0.5" />
            )}
            <V2Text
              as="span"
              variant="caption"
              weight="semibold"
              className="text-inherit"
            >
              {Math.abs(growthRate)}%
            </V2Text>
          </div>
        )}
      </div>

      {subtitle && (
        <V2Text variant="caption" color="muted" truncate className="mt-1">
          {subtitle}
        </V2Text>
      )}
    </div>
  );
};

V2AdminStatCard.displayName = "V2AdminStatCard";
