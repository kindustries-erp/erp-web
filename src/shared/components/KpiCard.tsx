import { Skeleton } from "@/shared/components/Skeleton";
import { cn } from "@/shared/utils";
import React from "react";

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  warn?: boolean;
  loading?: boolean;
}

export function KpiCard({
  label,
  value,
  sub,
  icon,
  badge,
  warn,
  compact,
  loading,
}: KpiCardProps & { compact?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface border rounded-xl card-shadow",
        compact ? "p-3 max-[480px]:p-2" : "p-4 max-[480px]:p-3",
        warn ? "border-[#f59e0b] border-[1.5px]" : "border-border",
      )}
    >
      {(icon || badge) && (
        <div
          className={cn(
            "flex items-center justify-between",
            compact ? "mb-1" : "mb-[10px]",
          )}
        >
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center bg-[color:var(--muted)] rounded-[7px]",
                compact ? "w-5 h-5" : "w-7 h-7",
              )}
            >
              {icon}
            </div>
          )}
          {badge}
        </div>
      )}
      <div
        className={cn(
          "text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-1",
          compact ? "text-[9px]" : "text-[10px]",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "font-semibold text-foreground",
          compact
            ? "text-[16px] max-[480px]:text-[14px]"
            : "text-[22px] max-[480px]:text-[18px]",
        )}
      >
        {loading ? (
          <Skeleton
            className={cn(
              "mt-1 mb-1 rounded",
              compact ? "h-5 w-20" : "h-7 w-28",
            )}
          />
        ) : (
          value
        )}
      </div>
      {sub && (
        <div className="text-[11px] text-[color:var(--faint)] mt-[3px]">
          {sub}
        </div>
      )}
    </div>
  );
}

interface BadgeProps {
  variant: "up" | "down" | "warn";
  children: React.ReactNode;
}

export function KpiBadge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "text-[10px] px-2 py-[3px] rounded-[20px] font-medium",
        variant === "up" && "bg-up-bg text-up-fg",
        variant === "down" && "bg-down-bg text-down-fg",
        variant === "warn" && "bg-warn-bg text-warn-fg",
      )}
    >
      {children}
    </span>
  );
}
