import * as React from "react";
import { cn } from "@/v2/shared/utils/cn";
import { V2TabPanelContext, useV2PageTabs } from "./V2PageTabs.context";
import type { V2TabPanelProps } from "./V2TabPanel.type";

export const V2TabPanel: React.FC<V2TabPanelProps> = ({
  tabKey,
  lazy = true,
  keepAlive = true,
  className,
  children,
}) => {
  const page = useV2PageTabs();
  const visited = React.useRef(false);
  const isActive = !page || page.activeTab === tabKey;
  if (isActive) visited.current = true;

  if (!isActive && (!keepAlive || (lazy && !visited.current))) return null;

  return (
    <V2TabPanelContext.Provider value={{ tabKey }}>
      <div
        role="tabpanel"
        id={`v2-tabpanel-${tabKey}`}
        aria-hidden={!isActive}
        className={cn(
          isActive ? "flex min-h-0 flex-1 flex-col" : "hidden",
          className,
        )}
      >
        {children}
      </div>
    </V2TabPanelContext.Provider>
  );
};
V2TabPanel.displayName = "V2TabPanel";
