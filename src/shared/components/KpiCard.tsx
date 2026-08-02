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
  rightNode?: React.ReactNode;
  bottomNode?: React.ReactNode;
  active?: boolean;
  onClear?: () => void;
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
  rightNode,
  bottomNode,
  active,
  onClear,
}: KpiCardProps & { compact?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface border rounded-xl card-shadow flex flex-col relative transition-all duration-200",
        compact ? "p-3 max-[480px]:p-2" : "p-4 max-[480px]:p-3",
        warn
          ? "border-[#f59e0b] border-[1.5px]"
          : active
            ? "border-primary border-[1.5px] bg-primary/5"
            : "border-border",
      )}
    >
      {active && onClear && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-2 right-2 p-1 rounded-full bg-background border shadow-sm hover:bg-muted text-muted-foreground hover:text-foreground z-10 transition-colors"
          title="Clear selection"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
      <div className="flex flex-row justify-between items-center flex-1">
        <div className="flex-1 min-w-0">
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
              "text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-1 truncate",
              compact ? "text-[9px]" : "text-[10px]",
            )}
          >
            {label}
          </div>
          <div
            className={cn(
              "font-semibold text-foreground truncate",
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
            <div className="text-[11px] text-[color:var(--faint)] mt-[3px] truncate">
              {sub}
            </div>
          )}
        </div>
        {rightNode && (
          <div className="ml-4 w-[100px] h-[60px] flex-shrink-0 flex items-center justify-center relative">
            {rightNode}
          </div>
        )}
      </div>
      {bottomNode && <div className="mt-3 w-full">{bottomNode}</div>}
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
