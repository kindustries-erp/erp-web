import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerSectionProps } from "./DrawerSection.type";

export const DrawerSection: React.FC<DrawerSectionProps> = ({
  title,
  titleExtra,
  collapsible = true,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onToggleCollapse,
  fitViewportHeight = false,
  children,
  className,
  bodyClassName,
  headerClassName,
  hideHeader = false,
  hideTitle = false,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (collapsible) {
      if (onToggleCollapse) {
        onToggleCollapse();
      } else {
        setInternalCollapsed((prev) => !prev);
      }
    }
  };

  const shouldHideHeader =
    hideHeader || hideTitle || (!title && !titleExtra && !collapsible);

  return (
    <div
      className={cn(
        "mb-3 rounded-xl border border-border/80 p-2.5 sm:p-3 transition-all duration-200",
        "bg-[var(--drawer-section-bg,rgba(255,255,255,0.65))] backdrop-blur-[12px]",
        "shadow-[0_2px_8px_-1px_rgba(0,0,0,0.06),0_1px_4px_-1px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_-1px_rgba(0,0,0,0.3)]",
        fitViewportHeight &&
          !isCollapsed &&
          "flex flex-col max-h-none lg:max-h-[calc(100vh-210px)]",
        isCollapsed && "!h-auto !flex-none !min-h-0 !flex-initial",
        className,
      )}
    >
      {!shouldHideHeader && (
        <div
          className={cn(
            "text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em] pb-[6px] border-b border-border flex justify-between items-center shrink-0",
            !isCollapsed && "mb-[10px]",
            headerClassName,
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {collapsible && (
              <button
                type="button"
                onClick={handleToggle}
                aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                data-testid="drawer-section-toggle-btn"
                className="p-0.5 -ml-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-muted-fg hover:text-foreground shrink-0"
              >
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isCollapsed ? "-rotate-90" : "rotate-0",
                  )}
                />
              </button>
            )}
            {title && (
              <span className="truncate select-text cursor-default">
                {title}
              </span>
            )}
          </div>

          {titleExtra && (
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {titleExtra}
            </div>
          )}
        </div>
      )}

      {!isCollapsed && (
        <div
          data-testid="drawer-section-body"
          className={cn(
            fitViewportHeight ? "flex-1 overflow-y-auto min-h-0" : "",
            bodyClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
