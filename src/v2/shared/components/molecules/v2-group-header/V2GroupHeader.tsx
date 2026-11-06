import * as React from "react";
import { V2Badge, V2Divider } from "@/v2/shared/components/atoms";
import { cn } from "@/v2/shared/utils/cn";
import type { V2GroupHeaderProps } from "./V2GroupHeader.type";

export function V2GroupHeader({
  title,
  count,
  variant = "badge",
  icon,
  action,
  showDivider = true,
  className,
  badgeClassName,
}: V2GroupHeaderProps) {
  const badgeClasses = React.useMemo(() => {
    switch (variant) {
      case "subtle":
        return "inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/40 text-foreground shrink-0";
      case "plain":
        return "inline-flex items-center gap-1.5 text-foreground shrink-0";
      case "badge":
      default:
        return "inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/80 dark:bg-muted/60 border border-border text-foreground shadow-xs shrink-0";
    }
  }, [variant]);

  return (
    <div className={cn("flex items-center gap-3 w-full", className)}>
      <V2Badge
        variant="secondary"
        className={cn(
          badgeClasses,
          "text-xs font-bold uppercase tracking-wider select-none",
          badgeClassName,
        )}
      >
        {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
        <span>{title}</span>
        {count !== undefined && (
          <span className="text-[11px] font-medium text-muted-foreground tabular-nums font-mono">
            ({count})
          </span>
        )}
      </V2Badge>

      {showDivider && (
        <V2Divider orientation="horizontal" className="flex-1 min-w-[30px]" />
      )}

      {action && <div className="flex items-center shrink-0">{action}</div>}
    </div>
  );
}
