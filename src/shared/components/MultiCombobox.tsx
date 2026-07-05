import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  searchText?: string;
}

interface MultiComboboxProps {
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onScrollBottom?: () => void;
  loading?: boolean;
  onSearch?: (query: string) => void;
}

export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = "— Chọn —",
  searchPlaceholder = "Tìm kiếm...",
  emptyLabel = "Không tìm thấy.",
  className,
  disabled,
  readOnly,
  onScrollBottom,
  loading,
  onSearch,
}: MultiComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  const selectedOptions = options.filter((o) => value.includes(o.value));

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

  const toggleOption = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled || readOnly}
          onClick={() => !(disabled || readOnly) && setOpen(!open)}
          className={cn(
            "flex flex-wrap items-center gap-1.5 justify-between w-full px-2 py-1.5 min-h-[36px] text-xs border rounded-xl transition-all outline-none",
            open
              ? "border-primary ring-2 ring-primary/10 bg-surface"
              : "border-border bg-muted/20 hover:border-border-hover hover:bg-surface",
            disabled
              ? "opacity-60 cursor-not-allowed"
              : readOnly
                ? "cursor-default"
                : "cursor-pointer",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <span
                  key={opt.value}
                  className="bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1 max-w-[120px]"
                >
                  <span className="truncate">{opt.label}</span>
                  {!readOnly && !disabled && (
                    <X
                      className="w-3 h-3 cursor-pointer hover:opacity-70"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOption(opt.value);
                      }}
                    />
                  )}
                </span>
              ))
            ) : (
              <span className="text-[color:var(--muted-fg)] px-1">
                {placeholder}
              </span>
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[color:var(--muted-fg)] ml-2" />
        </button>
      </Popover.Trigger>

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
            {filtered.length === 0 ? (
              <div className="px-3 py-5 text-xs text-center text-[color:var(--faint)]">
                {emptyLabel}
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleOption(o.value);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs hover:bg-[color:var(--popup-bg-hover)] flex items-center gap-2",
                    value.includes(o.value)
                      ? "text-[color:var(--primary)] font-medium bg-[color:var(--primary)]/5"
                      : "text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "w-4 h-4 shrink-0 rounded flex items-center justify-center border",
                      value.includes(o.value)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {value.includes(o.value) && <Check className="w-3 h-3" />}
                  </div>
                  <span className="truncate flex-1">{o.label}</span>
                </button>
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
