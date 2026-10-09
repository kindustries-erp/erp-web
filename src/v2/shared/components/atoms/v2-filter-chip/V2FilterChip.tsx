import * as React from "react";
import { X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2FilterChipProps } from "./V2FilterChip.type";

export const V2FilterChip: React.FC<V2FilterChipProps> = ({
  label,
  summary,
  icon,
  onClick,
  onRemove,
  className,
}) => {
  const { t } = useV2Translation();
  const text = summary ? `${label}: ${summary}` : label;
  return (
    <span
      className={cn(
        "inline-flex h-6 max-w-full items-stretch overflow-hidden rounded-full border border-border bg-muted/40 text-[11px]",
        className,
      )}
    >
      <V2Button
        type="button"
        variant="ghost"
        size="xs"
        title={text}
        onClick={onClick}
        className="h-full min-w-0 gap-1 rounded-none px-2 font-medium"
      >
        {icon}
        <span className="truncate">{text}</span>
      </V2Button>
      <V2Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`${t("v2.table.removeFilter", "Gỡ bộ lọc")}: ${label}`}
        onClick={onRemove}
        className="h-full w-5 rounded-none text-muted-fg hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3 w-3" />
      </V2Button>
    </span>
  );
};
