import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2QuickSearchProps } from "./V2QuickSearch.type";

export const V2QuickSearch: React.FC<V2QuickSearchProps> = ({
  onClick,
  shortcutLabel = "Ctrl K",
  placeholder = "Tìm nhanh...",
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Tìm kiếm nhanh hệ thống"
      className={cn(
        "v2-quick-search flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-surface text-[11px] text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] hover:text-foreground hover:bg-surface-hover hover:border-foreground/20 cursor-pointer select-none transition-all shadow-2xs",
        className,
      )}
    >
      <Search size={12} className="opacity-70 flex-shrink-0" />
      <span className="hidden sm:inline font-normal truncate">
        {placeholder}
      </span>
      <kbd className="hidden md:inline-flex items-center justify-center h-4 min-w-[20px] px-1 rounded-[4px] bg-muted text-[9px] font-semibold text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] border border-border/80">
        {shortcutLabel}
      </kbd>
    </button>
  );
};
