import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import {
  V2Badge,
  V2BadgeVariant,
  V2BadgeSize,
} from "@/v2/shared/components/atoms/v2-badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import { useV2MultiSelect } from "./V2MultiSelect.hook";
import { V2MultiSelectDropdown } from "./V2MultiSelectDropdown";
import type { V2MultiSelectProps } from "./V2MultiSelect.type";

export const V2MultiSelect: React.FC<V2MultiSelectProps> = ({
  options,
  value,
  onValueChange,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  className,
  triggerClassName,
  disabled = false,
  maxDisplayTags,
  searchable = true,
  clearable = true,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const h = useV2MultiSelect({ options, value, onValueChange, onChange });

  const hint = placeholder ?? t("v2.multiSelect.placeholder", "— Chọn —");
  const searchHint =
    searchPlaceholder ?? t("v2.multiSelect.searchPlaceholder", "Tìm kiếm...");
  const emptyText = emptyLabel ?? t("v2.multiSelect.empty", "Không tìm thấy.");

  const visibleTags = maxDisplayTags
    ? h.selected.slice(0, maxDisplayTags)
    : h.selected;
  const hiddenCount =
    maxDisplayTags && h.selected.length > maxDisplayTags
      ? h.selected.length - maxDisplayTags
      : 0;

  const trigger = (
    <div
      role="combobox"
      tabIndex={disabled ? -1 : 0}
      aria-expanded={h.open}
      aria-haspopup="listbox"
      aria-multiselectable="true"
      aria-label={ariaLabel ?? hint}
      aria-disabled={disabled}
      className={cn(
        "flex items-center justify-between w-full min-h-[38px] px-3 py-1.5 text-xs rounded-lg cursor-pointer",
        "border border-input bg-surface text-foreground transition-colors",
        V2_DRAWER_FOCUS_RING_CLASS,
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        triggerClassName,
      )}
    >
      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 items-center">
        {h.selected.length === 0 ? (
          <V2Text
            variant="body-sm"
            className="text-muted-foreground select-none"
          >
            {hint}
          </V2Text>
        ) : (
          <>
            {visibleTags.map((o) => (
              <V2Badge
                key={o.value}
                variant={V2BadgeVariant.OUTLINE}
                size={V2BadgeSize.SM}
                className="max-w-full gap-1 border-border bg-muted/60 dark:bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-foreground select-none"
              >
                <V2Text
                  variant="caption"
                  className="max-w-[200px] truncate text-inherit font-medium leading-none"
                >
                  {o.label}
                </V2Text>
                {!disabled && (
                  <V2Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => h.removeTag(o.value, e)}
                    className="h-3.5 w-3.5 rounded-full p-0 text-muted-foreground hover:bg-muted hover:text-destructive hover:bg-transparent"
                    aria-label={`Bỏ chọn ${o.label}`}
                  >
                    <X className="w-3 h-3" />
                  </V2Button>
                )}
              </V2Badge>
            ))}
            {hiddenCount > 0 && (
              <V2Text
                variant="caption"
                className="font-medium text-muted-foreground"
              >
                +{hiddenCount}
              </V2Text>
            )}
          </>
        )}
      </div>
      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground ml-2 transition-transform duration-200" />
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      <V2Popover
        open={h.open}
        onOpenChange={h.setOpen}
        trigger={trigger}
        content={
          <V2MultiSelectDropdown
            searchable={searchable}
            searchHint={searchHint}
            emptyText={emptyText}
            query={h.query}
            setQuery={h.setQuery}
            inputRef={h.inputRef}
            filtered={h.filtered}
            value={value}
            toggle={h.toggle}
            clearable={clearable}
            clearAll={h.clearAll}
          />
        }
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0 bg-surface border-border shadow-panel overflow-hidden"
      />
    </div>
  );
};

V2MultiSelect.displayName = "V2MultiSelect";
