import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarToggleBtnProps } from "./V2SidebarToggleBtn.type";

export const V2SidebarToggleBtn: React.FC<V2SidebarToggleBtnProps> = ({
  isCollapsed = false,
  onClick,
  title = "Thu gọn/mở rộng sidebar",
  className,
}) => {
  return (
    <button
      type="button"
      data-testid="v2-sidebar-toggle-btn"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "sidebar-toggle-btn flex h-[26px] w-[26px] min-w-[26px] items-center justify-center rounded-[7px] border border-border bg-card text-[color:var(--muted-fg)] hover:bg-accent/50 hover:text-foreground cursor-pointer flex-shrink-0 select-none transition-colors",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center transition-transform duration-200",
          isCollapsed && "rotate-180",
        )}
      >
        <ChevronLeft size={14} strokeWidth={2} aria-hidden="true" />
      </span>
    </button>
  );
};
