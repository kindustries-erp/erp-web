import { Skeleton } from "@/shared/components/Skeleton";
import { cn } from "@/shared/utils";
import React from "react";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  warn?: boolean;
  loading?: boolean;
  inlineIcon?: boolean;
  middleNode?: React.ReactNode;
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
  inlineIcon,
  rightNode,
  bottomNode,
  active,
  onClear,
}: KpiCardProps & { compact?: boolean }) {
  return (
    <div
      className={cn(
        "bg-surface border rounded-xl card-shadow flex flex-col relative transition-all duration-200",
        compact ? "p-3 max-[480px]:p-2" : "p-3.5 max-[480px]:p-2.5",
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

      {/* Hàng trên: Thông tin KPI bên trái & Widget/Donut bên phải */}
      <div className="flex flex-row justify-between items-center flex-1 gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          {inlineIcon ? (
            <div
              className={cn(
                "flex items-center gap-1.5 min-w-0",
                compact ? "mb-1" : "mb-1.5",
              )}
            >
              {icon && (
                <div
                  className={cn(
                    "flex items-center justify-center bg-[color:var(--muted)] rounded-[6px] shrink-0 text-muted-foreground",
                    compact ? "w-4 h-4 text-xs" : "w-5 h-5 text-xs",
                  )}
                >
                  {icon}
                </div>
              )}
              <div
                className={cn(
                  "text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] truncate",
                  compact ? "text-[9px]" : "text-[10px]",
                )}
              >
                {label}
              </div>
              {badge && <div className="ml-auto">{badge}</div>}
            </div>
          ) : (
            <>
              {(icon || badge) && (
                <div
                  className={cn(
                    "flex items-center justify-between",
                    compact ? "mb-1" : "mb-1.5",
                  )}
                >
                  {icon && (
                    <div
                      className={cn(
                        "flex items-center justify-center bg-[color:var(--muted)] rounded-[7px]",
                        compact ? "w-5 h-5" : "w-6 h-6",
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
                  "text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-0.5 truncate",
                  compact ? "text-[9px]" : "text-[10px]",
                )}
              >
                {label}
              </div>
            </>
          )}
          <div
            className={cn(
              "font-semibold text-foreground truncate",
              compact
                ? "text-[16px] max-[480px]:text-[14px]"
                : "text-[20px] max-[480px]:text-[17px]",
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
            <div className="text-[11px] text-[color:var(--faint)] mt-[2px] truncate">
              {sub}
            </div>
          )}
        </div>

        {rightNode && (
          <div className="shrink-0 flex items-center justify-center relative">
            {rightNode}
          </div>
        )}
      </div>

      {/* Hàng dưới: Khối tiến độ liền mạch hoặc các thành phần mở rộng */}
      {bottomNode && <div className="mt-2.5 w-full">{bottomNode}</div>}
    </div>
  );
}

interface BadgeProps {
  variant: "up" | "down" | "warn";
  children: React.ReactNode;
}

export function KpiBadge({ variant, children }: BadgeProps) {
  const styles = {
    up: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    down: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    warn: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border",
        styles[variant],
      )}
    >
      {children}
    </span>
  );
}
