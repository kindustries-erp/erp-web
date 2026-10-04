import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/v2/shared/ui";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
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
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleToggle}
                aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                data-testid="drawer-section-toggle-btn"
                className="p-0.5 -ml-1 text-muted-fg hover:text-foreground shrink-0 cursor-pointer"
              >
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isCollapsed ? "-rotate-90" : "rotate-0",
                  )}
                />
              </Button>
            )}
            {title && (
              <V2Text
                variant="section-title"
                className="truncate select-text cursor-default"
              >
                {title}
              </V2Text>
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
