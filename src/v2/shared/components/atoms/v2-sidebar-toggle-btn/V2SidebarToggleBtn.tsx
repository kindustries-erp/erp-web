import * as React from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2Button } from "../v2-button";
import { V2SidebarToggleBtnProps } from "./V2SidebarToggleBtn.type";

export const V2SidebarToggleBtn: React.FC<V2SidebarToggleBtnProps> = ({
  isCollapsed = false,
  floating = false,
  onClick,
  title,
  className,
  ...props
}) => {
  const { t } = useV2Translation();
  const displayTitle =
    title ??
    (isCollapsed
      ? t("v2.sidebar.expand", "Mở rộng thanh bên")
      : t("v2.sidebar.collapse", "Thu gọn thanh bên"));

  return (
    <V2Button
      type="button"
      variant="ghost"
      size="icon-xs"
      data-testid="v2-sidebar-toggle-btn"
      onClick={onClick}
      title={displayTitle}
      aria-label={displayTitle}
      className={cn(
        "sidebar-toggle-btn border border-border bg-card text-muted-fg hover:bg-accent/80 hover:text-foreground flex-shrink-0 p-0 transition-all",
        floating
          ? "absolute -right-3 top-3.5 z-20 h-6 w-6 min-w-[24px] rounded-full shadow-sm hover:scale-105"
          : "h-[26px] w-[26px] min-w-[26px] rounded-[7px]",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center transition-transform duration-200",
          isCollapsed && "rotate-180",
        )}
      >
        <ChevronLeft
          size={floating ? 13 : 14}
          strokeWidth={2}
          aria-hidden="true"
        />
      </span>
    </V2Button>
  );
};
