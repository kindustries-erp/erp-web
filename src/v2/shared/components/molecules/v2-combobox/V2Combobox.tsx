import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import {
  V2Button,
  V2Icon,
  V2Input,
  V2Text,
} from "@/v2/shared/components/atoms";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2PopoverDismiss } from "@/v2/shared/hooks/useV2PopoverDismiss";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import { useV2Combobox } from "./V2Combobox.hook";
import { V2ComboboxList } from "./V2ComboboxList";
import { V2ComboboxSheet } from "./V2ComboboxSheet";
import type { V2ComboboxProps } from "./V2Combobox.type";

export const V2Combobox: React.FC<V2ComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
  searchable = true,
  searchPlaceholder,
  onSearchChange,
  loading = false,
  clearable = false,
  emptyLabel,
  disabled = false,
  className,
  "aria-label": ariaLabel,
  onScrollBottom,
  fallbackLabel,
  portalContainer,
}) => {
  const { t } = useV2Translation();
  const { isMobile } = useViewport();
  const hint = placeholder ?? t("v2.form.selectPlaceholder", "Chọn...");
  const searchHint =
    searchPlaceholder ?? t("v2.form.searchPlaceholder", "Tìm kiếm...");

  const c = useV2Combobox({
    options,
    value,
    searchable,
    onValueChange,
    onScrollBottom,
    loading,
    emptyLabel: emptyLabel ?? t("v2.form.noResults", "Không có kết quả"),
    loadingText: t("v2.form.searching", "Đang tìm..."),
  });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useV2PopoverDismiss({
    open: !isMobile && c.open,
    onClose: () => c.setOpen(false),
    containerRef,
    panelSelector: "[data-v2-combobox-panel]",
  });

  const canClear = clearable && value !== null && !disabled;
  const displayLabel =
    c.selected?.label ?? (value && fallbackLabel ? fallbackLabel : hint);
  const isPlaceholder = !c.selected && !(value && fallbackLabel);

  const handleQueryChange = (next: string) => {
    c.setQuery(next);
    onSearchChange?.(next);
  };

  const trigger = (
    <V2Button
      type="button"
      variant="outline"
      role="combobox"
      aria-expanded={c.open}
      aria-haspopup={isMobile ? "dialog" : "listbox"}
      aria-label={ariaLabel ?? hint}
      disabled={disabled}
      onClick={isMobile ? () => !disabled && c.setOpen(true) : undefined}
      className={cn(
        "flex h-10 sm:h-8 w-full justify-start text-left font-normal items-center gap-2 rounded-md border border-input bg-background pl-3 text-base sm:text-sm shadow-none hover:bg-background hover:text-foreground",
        canClear ? "pr-16" : "pr-9",
        V2_DRAWER_FOCUS_RING_CLASS,
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      {c.selected?.icon && (
        <span className="shrink-0 flex items-center justify-center">
          {c.selected.icon}
        </span>
      )}
      <V2Text
        as="span"
        truncate
        color={isPlaceholder ? "muted" : "default"}
        className="min-w-0 flex-1 text-left"
      >
        {displayLabel}
      </V2Text>
    </V2Button>
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {isMobile ? (
        <>
          {trigger}
          <V2ComboboxSheet
            open={c.open}
            onOpenChange={c.setOpen}
            title={hint}
            searchable={searchable}
            searchPlaceholder={searchHint}
            query={c.query}
            onQueryChange={handleQueryChange}
            onKeyDown={c.onKeyDown}
            {...c.listProps}
          />
        </>
      ) : (
        <V2Popover
          trigger={trigger}
          content={
            <div
              className="flex flex-col gap-1"
              data-v2-combobox-panel=""
              onKeyDown={c.onKeyDown}
            >
              {searchable && (
                <V2Input
                  sizeVariant="sm"
                  autoFocus
                  value={c.query}
                  placeholder={searchHint}
                  aria-label={searchHint}
                  onChange={(e) => handleQueryChange(e.target.value)}
                />
              )}
              <V2ComboboxList {...c.listProps} />
            </div>
          }
          open={c.open}
          onOpenChange={c.setOpen}
          align="start"
          arrow={false}
          glass={false}
          hideCloseButton
          portalContainer={portalContainer}
          title={hint}
          className="w-64 p-1"
          triggerClassName="w-full"
        />
      )}
      <div className="pointer-events-none absolute right-3 top-1/2 flex h-4 -translate-y-1/2 items-center gap-1">
        {canClear && (
          <V2Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={t("v2.form.clearSelection", "Bỏ lựa chọn")}
            className="pointer-events-auto h-5 w-5 p-0 text-muted-fg hover:text-foreground"
            onClick={() => onValueChange(null)}
          >
            <V2Icon icon={X} size={14} />
          </V2Button>
        )}
        <V2Icon icon={ChevronDown} size={16} className="shrink-0 opacity-60" />
      </div>
    </div>
  );
};
V2Combobox.displayName = "V2Combobox";
