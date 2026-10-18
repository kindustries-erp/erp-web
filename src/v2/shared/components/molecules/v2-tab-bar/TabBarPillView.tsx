import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import { TabBarPillViewDesktop } from "./TabBarPillView.desktop";
import { TabBarPillViewMobile } from "./TabBarPillView.mobile";
import type { TabBarPillViewProps } from "./V2TabBar.type";

export const TabBarPillView: React.FC<TabBarPillViewProps> = (props) => {
  const { isMobile } = useViewport();

  if (isMobile) {
    return <TabBarPillViewMobile {...props} />;
  }

  return <TabBarPillViewDesktop {...props} />;
};

TabBarPillView.displayName = "TabBarPillView";
