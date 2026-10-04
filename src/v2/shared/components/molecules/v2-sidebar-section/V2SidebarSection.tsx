import * as React from "react";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import { V2SidebarSectionProps } from "./V2SidebarSection.type";

export const V2SidebarSection: React.FC<V2SidebarSectionProps> = ({
  label,
  isCollapsed = false,
  defaultOpen = true,
  onToggle,
  children,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultOpen);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
    onToggle?.();
  };

  if (!label) {
    return (
      <div className={cn("sidebar-nav-section py-1", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("sidebar-nav-section py-1", className)}>
      {!isCollapsed && (
        <div
          role="button"
          tabIndex={0}
          data-testid="v2-sidebar-section-header"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle();
            }
          }}
          className="sidebar-label-el flex cursor-pointer items-center justify-between px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] select-none hover:text-foreground transition-colors"
        >
          <span className="truncate">{label}</span>
          <span
            className={cn(
              "nav-arrow-el ml-auto text-[10px] opacity-70 flex-shrink-0 transition-transform duration-200",
              isExpanded && "rotate-90",
            )}
          >
            <ChevronRight size={12} strokeWidth={2} aria-hidden="true" />
          </span>
        </div>
      )}

      <div
        data-testid="v2-sidebar-section-body"
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{
          gridTemplateRows: isExpanded || isCollapsed ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden space-y-0.5">{children}</div>
      </div>
    </div>
  );
};
