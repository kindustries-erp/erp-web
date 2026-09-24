import { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";

export interface ComboboxOption {
  value: string;
  label: string;
  code?: string;
  searchText?: string;
  subLabel?: string;
}

export function parseComboboxOptionDisplay(o?: ComboboxOption | null): {
  label: string;
  code?: string;
} {
  if (!o) return { label: "", code: undefined };
  if (o.code) {
    return { label: o.label, code: o.code };
  }
  const match = o.label.match(/^(.*?)\s*\[([^\]]+)\]$/);
  if (match) {
    return { label: match[1].trim(), code: match[2].trim() };
  }
  return { label: o.label, code: undefined };
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  readOnly?: boolean;
  onScrollBottom?: () => void;
  loading?: boolean;
  onSearch?: (query: string) => void;
  fallbackLabel?: string;
  variant?: "default" | "spreadsheet" | "ghost";
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Tìm kiếm...",
  emptyLabel = "Không tìm thấy.",
  className,
  disabled,
  readOnly,
  allowClear = true,
  onScrollBottom,
  loading,
  onSearch,
  fallbackLabel,
  variant = "default",
}: ComboboxProps) {
  const t = useT();
  const defaultPlaceholder = t("common.select", "— Chọn —");
  const effectivePlaceholder = placeholder ?? defaultPlaceholder;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const normalizedOptions = useMemo(() => {
    if (!allowClear) return options;
    return options.filter((o) => o.value !== "" && o.value !== undefined);
  }, [options, allowClear]);

  const selected = options.find((o) => o.value === value);
  const selectedDisplay = useMemo(
    () => parseComboboxOptionDisplay(selected),
    [selected],
  );

  const filtered = query.trim()
    ? normalizedOptions.filter((o) => {
        const { label, code } = parseComboboxOptionDisplay(o);
        const q = query.toLowerCase();
        return (
          label.toLowerCase().includes(q) ||
          (code && code.toLowerCase().includes(q)) ||
          (o.searchText && o.searchText.toLowerCase().includes(q)) ||
          (o.subLabel && o.subLabel.toLowerCase().includes(q)) ||
          (o.value && o.value.toLowerCase().includes(q))
        );
      })
    : normalizedOptions;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      if (onScrollBottom && !loading) {
        onScrollBottom();
      }
    }
  };

  useEffect(() => {
    if (open) {
      // Focus after animation frame
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    } else {
      setQuery("");
      if (onSearchRef.current) onSearchRef.current("");
    }
  }, [open]);

  useEffect(() => {
    if (onSearchRef.current) {
      const id = setTimeout(
        () => onSearchRef.current && onSearchRef.current(query),
        300,
      );
      return () => clearTimeout(id);
    }
  }, [query]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Tooltip
        content={
          selected
            ? selectedDisplay.code
              ? `${selectedDisplay.label} (${selectedDisplay.code})`
              : selectedDisplay.label
            : fallbackLabel || ""
        }
        side="top"
        disabled={!selected || open}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            disabled={disabled || readOnly}
            onClick={() => !(disabled || readOnly) && setOpen(!open)}
            className={cn(
              "flex items-center justify-between w-full outline-none transition-all",
              variant === "default" && "px-3 py-2 text-xs border rounded-xl",
              variant === "default" &&
                (open
                  ? "border-primary ring-2 ring-primary/10 bg-surface"
                  : "border-border bg-muted/20 hover:border-border-hover hover:bg-surface"),
              variant === "spreadsheet" &&
                "h-full min-h-[38px] px-3 border-0 rounded-none shadow-none ring-0 outline-none bg-transparent hover:bg-slate-50/80 focus:bg-white text-xs",
              variant === "spreadsheet" &&
                open &&
                "bg-white border-0 rounded-none shadow-none ring-0 outline-none",
              variant === "ghost" &&
                "px-2 py-1 text-xs border-0 rounded-lg shadow-none ring-0 outline-none bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50",
              variant === "ghost" &&
                open &&
                "bg-transparent border-0 ring-0 outline-none shadow-none",
              disabled
                ? "opacity-60 cursor-not-allowed"
                : readOnly
                  ? "cursor-default"
                  : "cursor-pointer",
              className,
            )}
          >
            <span className="truncate flex-1 text-left flex items-center justify-between gap-2 min-w-0">
              <span className="truncate flex flex-col justify-center min-w-0">
                <span className="truncate">
                  {selected
                    ? selectedDisplay.label
                    : value && fallbackLabel
                      ? fallbackLabel
                      : effectivePlaceholder}
                </span>
                {selected?.subLabel && (
                  <span className="truncate text-[10px] text-[color:var(--muted-fg)] leading-tight mt-0.5">
                    {selected.subLabel}
                  </span>
                )}
              </span>
              {selected && selectedDisplay.code && (
                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  {selectedDisplay.code}
                </span>
              )}
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[color:var(--muted-fg)] ml-2" />
          </button>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Portal>
        <Popover.Content
          className="z-[9999] w-[var(--radix-popover-trigger-width)] min-w-[200px] flex flex-col rounded-lg popup-content overflow-hidden shadow-md"
          style={{ maxHeight: "280px" }}
          sideOffset={4}
          align="start"
          avoidCollisions
        >
          {/* Search input */}
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-[color:var(--popup-border)] shrink-0">
            <Search className="w-3.5 h-3.5 text-[color:var(--muted-fg)] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-[color:var(--muted-fg)]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[color:var(--muted-fg)] hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="overflow-y-auto flex-1" onScroll={handleScroll}>
            {/* Clear / placeholder option */}
            {allowClear && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-[color:var(--popup-bg-hover)] flex items-center gap-2",
                  !value
                    ? "text-foreground font-medium"
                    : "text-[color:var(--muted-fg)]",
                )}
              >
                <Check
                  className={cn(
                    "w-3 h-3 shrink-0",
                    value
                      ? "opacity-0"
                      : "opacity-100 text-[color:var(--primary)]",
                  )}
                />
                {effectivePlaceholder}
              </button>
            )}

            {loading && filtered.length === 0 ? (
              <div className="px-3 py-5 text-xs text-center text-[color:var(--muted-fg)] flex items-center justify-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border-2 border-primary border-r-transparent rounded-full animate-spin" />
                <span>Đang tải...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-3 py-5 text-xs text-center text-[color:var(--faint)]">
                {emptyLabel}
              </div>
            ) : (
              filtered.map((o) => {
                const { label: itemLabel, code: itemCode } =
                  parseComboboxOptionDisplay(o);
                return (
                  <Tooltip key={o.value} content={itemLabel} side="right">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs hover:bg-[color:var(--popup-bg-hover)] flex items-center gap-2 transition-colors group/item",
                        o.value === value
                          ? "text-[color:var(--primary)] font-medium bg-[color:var(--primary)]/5"
                          : "text-foreground",
                      )}
                    >
                      <Check
                        className={cn(
                          "w-3 h-3 shrink-0 text-[color:var(--primary)]",
                          o.value === value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                        <div className="truncate flex flex-col justify-center min-w-0">
                          <span className="truncate">{itemLabel}</span>
                          {o.subLabel && (
                            <span className="truncate text-[10px] text-[color:var(--muted-fg)] leading-tight mt-0.5">
                              {o.subLabel}
                            </span>
                          )}
                        </div>
                        {itemCode && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs group-hover/item:text-foreground transition-colors">
                            {itemCode}
                          </span>
                        )}
                      </div>
                    </button>
                  </Tooltip>
                );
              })
            )}

            {loading && filtered.length > 0 && (
              <div className="px-3 py-2 text-xs text-center text-[color:var(--muted-fg)] flex items-center justify-center gap-1.5 border-t border-border/40">
                <span className="inline-block w-3 h-3 border-2 border-primary border-r-transparent rounded-full animate-spin" />
                <span>Đang tải thêm...</span>
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
