import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2QuickSearchProps } from "./V2QuickSearch.type";

export const V2QuickSearch: React.FC<V2QuickSearchProps> = ({
  onClick,
  shortcutLabel,
  placeholder,
  className,
}) => {
  const { t } = useV2Translation();
  const effectivePlaceholder =
    placeholder ?? t("v2.topbar.quickSearchPlaceholder", "Tìm nhanh...");
  const effectiveShortcut =
    shortcutLabel ?? t("v2.topbar.quickSearchShortcut", "Ctrl K");
  const ariaLabel = t("v2.topbar.quickSearchAria", "Tìm kiếm nhanh hệ thống");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "v2-quick-search flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-surface text-[11px] text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] hover:text-foreground hover:bg-surface-hover hover:border-foreground/20 cursor-pointer select-none transition-all shadow-2xs",
        className,
      )}
    >
      <Search size={12} className="opacity-70 flex-shrink-0" />
      <span className="hidden sm:inline font-normal truncate">
        {effectivePlaceholder}
      </span>
      <kbd className="hidden md:inline-flex items-center justify-center h-4 min-w-[20px] px-1 rounded-[4px] bg-muted text-[9px] font-semibold text-[color:var(--muted-fg,hsl(var(--muted-foreground)))] border border-border/80">
        {effectiveShortcut}
      </kbd>
    </button>
  );
};
