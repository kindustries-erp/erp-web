import React from "react";
import { V2TabBar } from "@/v2/shared/components/molecules/v2-tab-bar";
import { V2Stack } from "@/v2/shared/components/atoms/v2-stack";
import { cn } from "@/v2/shared/utils/cn";
import type { useStandardDrawer } from "./V2StandardDrawer.hook";
import type { V2StandardDrawerProps } from "./V2StandardDrawer.type";

interface DrawerDesktopColumnsProps {
  props: V2StandardDrawerProps;
  h: ReturnType<typeof useStandardDrawer>;
  mainContent: React.ReactNode;
}

export const DrawerDesktopColumns: React.FC<DrawerDesktopColumnsProps> = ({
  props,
  h,
  mainContent,
}) => {
  const hasRightPanel =
    h.effectiveLayout === "2-columns" && Boolean(props.rightPanel);
  const isRightCollapsed =
    h.isRightPanelCollapsed || Boolean(h.activeTabItem?.hideRightPanel);

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-start w-full relative transition-all duration-300 ease-in-out",
        hasRightPanel && !isRightCollapsed ? "gap-4 lg:gap-6" : "gap-0",
      )}
    >
      <V2Stack gap="sm" className="flex-1 min-w-0 w-full sm:gap-4">
        {props.leftTabs && props.leftTabs.length > 0 && (
          <V2TabBar
            variant="sub"
            tabs={props.leftTabs}
            activeTabKey={h.activeLeftTabKey}
            onTabChange={h.handleLeftTabChange}
            extra={props.leftTabExtra}
          />
        )}
        <div
          key={h.activeTabKey || "tab-content"}
          className="w-full animate-in fade-in-50 duration-200"
        >
          {mainContent}
        </div>
      </V2Stack>
      {hasRightPanel && (
        <V2Stack
          gap="sm"
          data-testid="drawer-desktop-right-panel"
          aria-hidden={isRightCollapsed}
          className={cn(
            "shrink-0 sm:gap-4 transition-all duration-300 ease-in-out overflow-x-hidden",
            props.stickyRightPanel && "lg:sticky lg:top-0",
            isRightCollapsed
              ? "w-0 lg:w-0 opacity-0 overflow-hidden !p-0 !m-0 pointer-events-none"
              : "w-full lg:w-72 xl:w-80 2xl:w-88 opacity-100",
          )}
        >
          <V2Stack
            gap="sm"
            className="w-full min-w-0 lg:min-w-[280px] sm:gap-4"
          >
            {props.rightTabs && props.rightTabs.length > 0 && (
              <V2TabBar
                variant="sub"
                tabs={props.rightTabs}
                activeTabKey={h.activeRightTabKey}
                onTabChange={h.handleRightTabChange}
                extra={props.rightTabExtra}
              />
            )}
            {h.activeRightTabItem?.content || props.rightPanel}
          </V2Stack>
        </V2Stack>
      )}
    </div>
  );
};
