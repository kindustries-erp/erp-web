import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { V2Spinner } from "@/v2/shared/components/atoms/v2-spinner";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2PopoverDismiss } from "@/v2/shared/hooks/useV2PopoverDismiss";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Combobox } from "./V2Combobox.hook";
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
}) => {
  const { t } = useV2Translation();
  const c = useV2Combobox({ options, value, searchable, onValueChange });
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Click ra ngoài thì đóng; mở combobox này sẽ đóng popover đang mở khác
  useV2PopoverDismiss({
    open: c.open,
    onClose: () => c.setOpen(false),
    containerRef,
    panelSelector: "[data-v2-combobox-panel]",
  });
  const hint = placeholder ?? t("v2.form.selectPlaceholder", "Chọn...");
  const canClear = clearable && value !== null && !disabled;

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
      <span className={cn("truncate", !c.selected && "text-muted-foreground")}>
        {c.selected?.label ?? hint}
      </span>
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
        <Input
          autoFocus
          value={c.query}
          placeholder={
            searchPlaceholder ?? t("v2.form.searchPlaceholder", "Tìm kiếm...")
          }
          aria-label={
            searchPlaceholder ?? t("v2.form.searchPlaceholder", "Tìm kiếm...")
          }
          className="h-8 text-sm"
          onChange={(event) => {
            c.setQuery(event.target.value);
            onSearchChange?.(event.target.value);
          }}
        />
      )}
      <ul
        role="listbox"
        aria-busy={loading}
        className="max-h-60 overflow-y-auto"
      >
        {loading && (
          <li className="flex items-center justify-center gap-2 px-2 py-3 text-sm text-muted-foreground">
            <V2Spinner size="sm" />
            {t("v2.form.searching", "Đang tìm...")}
          </li>
        )}
        {!loading && c.filtered.length === 0 && (
          <li className="px-2 py-3 text-center text-sm text-muted-foreground">
            {emptyLabel ?? t("v2.form.noResults", "Không có kết quả")}
          </li>
        )}
        {c.filtered.map((option, index) => (
          <li
            key={option.value}
            role="option"
            aria-selected={option.value === value}
            aria-disabled={option.disabled}
            onMouseEnter={() => c.setActiveIndex(index)}
            onClick={() => c.select(option)}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm",
              index === c.activeIndex && "bg-accent",
              option.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <Check
              aria-hidden
              className={cn(
                "h-4 w-4 shrink-0",
                option.value === value ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{option.label}</span>
              {option.description && (
                <span className="block truncate text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
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
