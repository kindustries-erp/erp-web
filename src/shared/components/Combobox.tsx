import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";

export interface ComboboxOption {
  value: string;
  label: string;
  searchText?: string;
  subLabel?: string;
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
  variant?: "default" | "spreadsheet";
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "— Chọn —",
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        (o.searchText || o.label).toLowerCase().includes(query.toLowerCase()),
      )
    : options;

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
        content={selected ? selected.label : fallbackLabel || ""}
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
              variant === "spreadsheet" &&
                "h-full min-h-[38px] px-3 border-0 rounded-none bg-transparent hover:bg-slate-50 focus:bg-white text-xs",
              variant === "default" && open
                ? "border-primary ring-2 ring-primary/10 bg-surface"
                : variant === "default" &&
                    "border-border bg-muted/20 hover:border-border-hover hover:bg-surface",
              variant === "spreadsheet" && open
                ? "bg-white ring-1 ring-primary"
                : "",
              disabled
                ? "opacity-60 cursor-not-allowed"
                : readOnly
                  ? "cursor-default"
                  : "cursor-pointer",
              className,
            )}
          >
            <span className="truncate flex-1 text-left flex flex-col justify-center">
              <span className="truncate">
                {selected
                  ? selected.label
                  : value && fallbackLabel
                    ? fallbackLabel
                    : placeholder}
              </span>
              {selected?.subLabel && (
                <span className="truncate text-[10px] text-[color:var(--muted-fg)] leading-tight mt-0.5">
                  {selected.subLabel}
                </span>
              )}
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[color:var(--muted-fg)] ml-2" />
          </button>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Portal>
        <Popover.Content
          className="z-[9999] w-[var(--radix-popover-trigger-width)] flex flex-col rounded-lg popup-content overflow-hidden"
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
                {placeholder}
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="px-3 py-5 text-xs text-center text-[color:var(--faint)]">
                {emptyLabel}
              </div>
            ) : (
              filtered.map((o) => (
                <Tooltip key={o.value} content={o.label} side="right">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs hover:bg-[color:var(--popup-bg-hover)] flex items-center gap-2",
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
                    <div className="flex-1 truncate flex flex-col justify-center">
                      <span className="truncate">{o.label}</span>
                      {o.subLabel && (
                        <span className="truncate text-[10px] text-[color:var(--muted-fg)] leading-tight mt-0.5">
                          {o.subLabel}
                        </span>
                      )}
                    </div>
                  </button>
                </Tooltip>
              ))
            )}

            {loading && (
              <div className="px-3 py-2 text-xs text-center text-[color:var(--muted-fg)]">
                Đang tải...
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
