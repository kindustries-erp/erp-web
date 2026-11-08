import * as React from "react";
import {
  V2Badge,
  V2Divider,
  V2Input,
  V2Text,
} from "@/v2/shared/components/atoms";
import { cn } from "@/v2/shared/utils/cn";
import type { V2GroupHeaderProps } from "./V2GroupHeader.type";

export function V2GroupHeader({
  title,
  count,
  variant = "badge",
  icon,
  search,
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
        {icon && (
          <span className="shrink-0 text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
        )}
        <V2Text as="span" variant="caption" weight="bold">
          {title}
        </V2Text>
        {count !== undefined && (
          <V2Text
            as="span"
            variant="caption"
            className="text-[11px] font-medium text-muted-foreground tabular-nums font-mono"
          >
            ({count})
          </V2Text>
        )}
      </V2Badge>

      {showDivider && (
        <V2Divider orientation="horizontal" className="flex-1 min-w-[30px]" />
      )}

      {search && (
        <div className="w-48 sm:w-56 shrink-0">
          <V2Input
            sizeVariant="xs"
            value={search.value}
            placeholder={search.placeholder}
            onChange={(e) => search.onChange(e.target.value)}
            className={search.className}
          />
        </div>
      )}

      {action && <div className="flex items-center shrink-0">{action}</div>}
    </div>
  );
}
