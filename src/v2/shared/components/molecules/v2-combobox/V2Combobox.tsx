import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2PopoverDismiss } from "@/v2/shared/hooks/useV2PopoverDismiss";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Combobox } from "./V2Combobox.hook";
import { V2ComboboxList } from "./V2ComboboxList";
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
}) => {
  const { t } = useV2Translation();
  const c = useV2Combobox({ options, value, searchable, onValueChange });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useV2PopoverDismiss({
    open: c.open,
    onClose: () => c.setOpen(false),
    containerRef,
    panelSelector: "[data-v2-combobox-panel]",
  });

  const hint = placeholder ?? t("v2.form.selectPlaceholder", "Chọn...");
  const canClear = clearable && value !== null && !disabled;
  const displayLabel =
    c.selected?.label ?? (value && fallbackLabel ? fallbackLabel : hint);
  const isPlaceholder = !c.selected && !(value && fallbackLabel);

  const handleListScroll = (e: React.UIEvent<HTMLUListElement>) => {
    if (!onScrollBottom || loading) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      onScrollBottom();
    }
  };

  const trigger = (
    <button
      type="button"
      role="combobox"
      aria-expanded={c.open}
      aria-haspopup="listbox"
      aria-label={ariaLabel ?? hint}
      disabled={disabled}
      className={cn(
        "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        canClear && "pr-8",
      )}
    >
      <V2Text
        asChild
        color={isPlaceholder ? "muted" : "default"}
        className="truncate"
      >
        <span>{displayLabel}</span>
      </V2Text>
      <ChevronDown aria-hidden className="h-4 w-4 shrink-0 opacity-60" />
    </button>
  );

  const content = (
    <div
      className="flex flex-col gap-1"
      data-v2-combobox-panel=""
      onKeyDown={c.onKeyDown}
    >
      {searchable && (
        <V2Input
          size="sm"
          autoFocus
          value={c.query}
          placeholder={
            searchPlaceholder ?? t("v2.form.searchPlaceholder", "Tìm kiếm...")
          }
          aria-label={
            searchPlaceholder ?? t("v2.form.searchPlaceholder", "Tìm kiếm...")
          }
          onChange={(event) => {
            c.setQuery(event.target.value);
            onSearchChange?.(event.target.value);
          }}
        />
      )}
      <V2ComboboxList
        options={c.filtered}
        value={value}
        activeIndex={c.activeIndex}
        loading={loading}
        emptyLabel={emptyLabel ?? t("v2.form.noResults", "Không có kết quả")}
        loadingText={t("v2.form.searching", "Đang tìm...")}
        onSelect={c.select}
        onHoverIndex={c.setActiveIndex}
        onScroll={handleListScroll}
      />
    </div>
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <V2Popover
        trigger={trigger}
        content={content}
        open={c.open}
        onOpenChange={c.setOpen}
        align="start"
        arrow={false}
        glass={false}
        hideCloseButton
        title={hint}
        className="w-64 p-1"
        triggerClassName="w-full"
      />
      {canClear && (
        <button
          type="button"
          aria-label={t("v2.form.clearSelection", "Bỏ lựa chọn")}
          className="absolute right-7 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={() => onValueChange(null)}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
V2Combobox.displayName = "V2Combobox";
