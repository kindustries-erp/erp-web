import * as React from "react";
import { CheckSquare, ChevronDown, X } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2TableSelectionChipProps } from "./V2TableSelectionChip.type";

export const V2TableSelectionChip: React.FC<V2TableSelectionChipProps> = ({
  count,
  onClear,
  renderMenu,
  className,
}) => {
  const { t } = useV2Translation();
  if (count <= 0) return null;

  const actionsLabel = t("v2.table.selectionActions", { count });
  const deselectLabel = t("v2.table.deselectAll", { count });
  const trigger = (
    <V2Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={actionsLabel}
      title={actionsLabel}
      className="h-full gap-1 rounded-none px-2.5 text-primary"
    >
      <CheckSquare className="h-3.5 w-3.5 shrink-0" />
      <span className="text-[11px] font-bold leading-none">({count})</span>
      {renderMenu && <ChevronDown className="h-3 w-3 opacity-60" />}
    </V2Button>
  );

  return (
    <div
      className={cn(
        "inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-lg border border-border bg-surface shadow-xs",
        className,
      )}
    >
      {renderMenu ? renderMenu(trigger) : trigger}
      <V2Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={deselectLabel}
        title={deselectLabel}
        onClick={onClear}
        className="h-full rounded-none px-2 text-muted-fg hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="h-3.5 w-3.5" />
      </V2Button>
    </div>
  );
};
