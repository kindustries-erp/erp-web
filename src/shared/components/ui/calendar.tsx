import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { vi } from "date-fns/locale";

// Inject RDP range styles once
const RDP_RANGE_STYLES = `
.rdp-root {
  --rdp-accent-color: var(--primary);
  --rdp-accent-background-color: color-mix(in srgb, var(--primary) 12%, transparent);
  --rdp-range-start-color: var(--primary-fg, #fff);
  --rdp-range-end-color: var(--primary-fg, #fff);
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
.rdp-day_button { width:32px; height:32px; border-radius:6px; border:none; background:none; cursor:pointer; font-size:12px; color:var(--foreground); margin:1px auto; display:flex; align-items:center; justify-content:center; transition: background 0.1s; }
.rdp-day_button:hover { background:rgba(0,0,0,0.06); }
.rdp-selected .rdp-day_button { background:var(--primary); color:var(--primary-fg, #fff) !important; font-weight:600; }
.rdp-range_start .rdp-day_button, .rdp-range_end .rdp-day_button { background:var(--primary); color:var(--primary-fg, #fff) !important; font-weight:700; border-radius:6px; }
.rdp-range_middle .rdp-day_button { background:color-mix(in srgb, var(--primary) 12%, transparent); color:var(--foreground); border-radius:0; }
.rdp-range_start { border-radius: 6px 0 0 6px; }
.rdp-range_end { border-radius: 0 6px 6px 0; }
.rdp-range_start.rdp-range_end { border-radius: 6px; }
.rdp-today .rdp-day_button { color:var(--primary); font-weight:700; }
.rdp-outside .rdp-day_button { color:var(--faint); }
.rdp-disabled .rdp-day_button { color:var(--faint); pointer-events:none; }
`;

if (typeof document !== "undefined") {
  const styleId = "rdp-range-custom-styles";
  if (!document.getElementById(styleId)) {
    const el = document.createElement("style");
    el.id = styleId;
    el.textContent = RDP_RANGE_STYLES;
    document.head.appendChild(el);
  }
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={vi}
      showOutsideDays
      className={cn("p-3", className)}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          ),
      }}
      {...props}
    />
  );
}
