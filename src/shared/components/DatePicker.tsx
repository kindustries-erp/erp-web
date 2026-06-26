import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useT } from "@/core/i18n";
import { DayPicker } from "react-day-picker";
import { format, isValid, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/utils";

// react-day-picker v9 styles injected via CSS-in-JS minimally
const RDP_STYLES = `
.rdp-root {
  --rdp-accent-color: var(--primary);
  --rdp-accent-background-color: color-mix(in srgb, var(--primary) 12%, transparent);
  font-size: 13px;
  position: relative;
}
.rdp-nav { position:absolute; top:0; left:0; right:0; display:flex; justify-content:space-between; align-items:center; pointer-events:none; height:26px; }
.rdp-button_previous, .rdp-button_next { pointer-events:all; width:26px; height:26px; background:rgba(255,255,255,0.6); backdrop-filter:blur(10px); border:0.5px solid rgba(0,0,0,0.09); border-radius:7px; padding:0; cursor:pointer; color:var(--foreground); display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
.rdp-button_previous:hover, .rdp-button_next:hover { background:rgba(0,0,0,0.07); }
.rdp-month_caption { display:flex; align-items:center; justify-content:center; padding:2px 0 10px; font-weight:600; font-size:13px; }
.rdp-weekdays { display:grid; grid-template-columns:repeat(7,1fr); }
.rdp-weekday { text-align:center; font-size:11px; font-weight:500; color:var(--muted-fg); padding:4px 0; }
.rdp-month_grid { width:100%; border-collapse:collapse; }
.rdp-week { display:grid; grid-template-columns:repeat(7,1fr); }
.rdp-day { text-align:center; }
.rdp-day_button { width:32px; height:32px; border-radius:6px; border:none; background:none; cursor:pointer; font-size:12px; color:var(--foreground); margin:1px auto; display:flex; align-items:center; justify-content:center; }
.rdp-day_button:hover { background:rgba(0,0,0,0.06); }
.rdp-selected .rdp-day_button { background:var(--primary); color:var(--primary-fg) !important; font-weight:600; }
.rdp-today .rdp-day_button { color:var(--primary); font-weight:700; }
.rdp-outside .rdp-day_button { color:var(--faint); }
.rdp-disabled .rdp-day_button { color:var(--faint); pointer-events:none; }
`;

interface DatePickerProps {
  value: string; // ISO date string "yyyy-MM-dd" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: DatePickerProps) {
  const t = useT();
  const displayPlaceholder = placeholder || t("Chọn ngày");
  const [open, setOpen] = useState(false);

  // Inject styles once
  useEffect(() => {
    const id = "rdp-custom-styles";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = RDP_STYLES;
    document.head.appendChild(el);
  }, []);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const displayText =
    selected && isValid(selected) ? format(selected, "dd/MM/yyyy") : "";

  function handleSelect(day: Date | undefined) {
    if (!day) {
      onChange("");
    } else {
      onChange(format(day, "yyyy-MM-dd"));
    }
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  return (
    <Popover.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "form-input inline-flex items-center gap-2 text-left min-w-[148px] cursor-pointer",
            !displayText && "text-[color:var(--muted-fg)]",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <CalendarDays className="w-3.5 h-3.5 text-[color:var(--muted-fg)] flex-shrink-0" />
          <span className="flex-1 text-xs">
            {displayText || displayPlaceholder}
          </span>
          {displayText && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Xoá"
              onKeyDown={(e) => e.key === "Enter" && onChange("")}
              onClick={handleClear}
              className="text-[color:var(--muted-fg)] hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className={cn(
            "z-[9999] rounded-xl popup-content p-3",
            "animate-in fade-in-0 zoom-in-95",
          )}
        >
          <DayPicker
            mode="single"
            selected={selected && isValid(selected) ? selected : undefined}
            onSelect={handleSelect}
            locale={vi}
            showOutsideDays
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeft className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                ),
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
