import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/shared/utils";

export interface ComboboxOption {
  value: string;
  label: string;
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
  /** Show a "clear / no selection" row at the top. Default: true */
  allowClear?: boolean;
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
  allowClear = true,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (open) {
      setQuery("");
      // Focus after animation frame
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center justify-between w-full px-3 py-[7px] text-xs rounded-lg border border-[color:var(--border)] glass-trigger text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            !value && "text-[color:var(--muted-fg)]",
            className,
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
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
          <div className="overflow-y-auto flex-1">
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
                <button
                  key={o.value}
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
                  <span className="truncate">{o.label}</span>
                </button>
              ))
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
