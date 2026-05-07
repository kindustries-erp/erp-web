import { useEffect, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string | null;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "— Chọn —",
  searchPlaceholder = "Tìm kiếm...",
  emptyLabel = "Không tìm thấy.",
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.filter((o) => value.includes(o.value));

  const filtered = query.trim()
    ? options.filter((o) => {
        const q = query.toLowerCase();
        return (
          o.label.toLowerCase().includes(q) ||
          (o.description ?? "").toLowerCase().includes(q)
        );
      })
    : options;

  useEffect(() => {
    if (open) {
      setQuery("");
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  function toggle(optValue: string) {
    onChange(
      value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue],
    );
  }

  function removeTag(optValue: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center justify-between w-full min-h-[38px] px-3 py-1.5 text-xs rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] text-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          )}
        >
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {selected.length === 0 ? (
              <span className="text-[color:var(--muted-fg)]">{placeholder}</span>
            ) : (
              selected.map((o) => (
                <Badge
                  key={o.value}
                  variant="outline"
                  className="max-w-full gap-1.5 border-[#d8e0ee] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-semibold leading-[14px] text-foreground shadow-[0_1px_1px_rgba(15,23,42,0.04)]"
                >
                  <span className="max-w-[220px] truncate">{o.label}</span>
                  <button
                    type="button"
                    onClick={(e) => removeTag(o.value, e)}
                    className="rounded-full text-primary/70 hover:bg-primary/10 hover:text-red-500 transition-colors"
                    aria-label={`Bỏ chọn ${o.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[color:var(--muted-fg)] ml-2" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-[9999] w-[var(--radix-popover-trigger-width)] flex flex-col rounded-lg popup-content overflow-hidden"
          style={{ maxHeight: "260px" }}
          sideOffset={4}
          align="start"
          avoidCollisions
        >
          {/* Search */}
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

          {/* Options list */}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-5 text-xs text-center text-[color:var(--faint)]">
                {emptyLabel}
              </div>
            ) : (
              filtered.map((o) => {
                const checked = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggle(o.value)}
                    className={cn(
                      "w-full text-left px-3 py-[7px] text-xs hover:bg-[color:var(--popup-bg-hover)] flex items-center gap-2",
                      checked
                        ? "bg-primary/5 text-foreground font-medium"
                        : "text-foreground",
                    )}
                  >
                    <div
                      className={cn(
                        "w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center shrink-0 transition-colors",
                        checked
                          ? "bg-primary border-primary text-primary-fg"
                          : "border-[color:var(--border)]",
                      )}
                    >
                      {checked && <Check className="w-[10px] h-[10px]" />}
                    </div>
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {o.description && (
                      <Badge
                        variant="secondary"
                        className="shrink-0 bg-[color:var(--muted)] text-[color:var(--muted-fg)]"
                      >
                        {o.description}
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer: clear all */}
          {value.length > 0 && (
            <div className="shrink-0 border-t border-[color:var(--popup-border)] px-3 py-[6px] flex justify-between items-center">
              <span className="text-[11px] text-[color:var(--muted-fg)]">
                {value.length} đã chọn
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-[color:var(--muted-fg)] hover:text-foreground transition-colors"
              >
                Xóa hết
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
