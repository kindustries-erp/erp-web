import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { V2Popover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { Input } from "@/v2/shared/ui";
import { cn } from "@/v2/shared/utils/cn";
import { useV2MultiCombobox } from "./V2MultiCombobox.hook";
import type { V2MultiComboboxProps } from "./V2MultiCombobox.type";

export const V2MultiCombobox: React.FC<V2MultiComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder,
  searchable = true,
  searchPlaceholder,
  clearable = false,
  emptyLabel,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}) => {
  const { t } = useV2Translation();
  const c = useV2MultiCombobox({ options, value, searchable, onValueChange });
  const hint = placeholder ?? t("v2.form.selectPlaceholder", "Chọn...");
  const canClear = clearable && value.length > 0 && !disabled;
  const [first, ...rest] = c.selected;
  const countLabel = t("v2.form.selectedCount", {
    count: value.length,
    defaultValue: `Đã chọn ${value.length}`,
  });

  const trigger = (
    <button
      type="button"
      role="combobox"
      aria-expanded={c.open}
      aria-haspopup="listbox"
      aria-multiselectable="true"
      aria-label={ariaLabel ?? hint}
      disabled={disabled}
      title={c.selected.map((o) => o.label).join(", ") || undefined}
      className={cn(
        "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        canClear && "pr-8",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className={cn("truncate", !first && "text-muted-foreground")}>
          {first?.label ?? hint}
        </span>
        {rest.length > 0 && (
          <span className="shrink-0 rounded bg-muted px-1.5 text-xs text-muted-foreground">
            +{rest.length}
          </span>
        )}
      </span>
      <ChevronDown aria-hidden className="h-4 w-4 shrink-0 opacity-60" />
    </button>
  );

  const content = (
    <div className="flex flex-col gap-1" onKeyDown={c.onKeyDown}>
      {value.length > 0 && (
        <div className="px-2 pt-1 text-xs text-muted-foreground">
          {countLabel}
        </div>
      )}
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
          onChange={(event) => c.setQuery(event.target.value)}
        />
      )}
      <ul
        role="listbox"
        aria-multiselectable="true"
        className="max-h-60 overflow-y-auto"
      >
        {c.filtered.length === 0 && (
          <li className="px-2 py-3 text-center text-sm text-muted-foreground">
            {emptyLabel ?? t("v2.form.noResults", "Không có kết quả")}
          </li>
        )}
        {c.filtered.map((option, index) => {
          const checked = value.includes(option.value);
          return (
            <li
              key={option.value}
              role="option"
              aria-selected={checked}
              aria-disabled={option.disabled}
              onMouseEnter={() => c.setActiveIndex(index)}
              onClick={() => c.toggle(option)}
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
                  checked ? "opacity-100" : "opacity-0",
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
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className={cn("relative w-full", className)}>
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
        className="z-[9999] w-64 p-1"
        triggerClassName="w-full"
      />
      {canClear && (
        <button
          type="button"
          aria-label={t("v2.form.clearSelection", "Bỏ lựa chọn")}
          className="absolute right-7 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          onClick={c.clear}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
V2MultiCombobox.displayName = "V2MultiCombobox";
