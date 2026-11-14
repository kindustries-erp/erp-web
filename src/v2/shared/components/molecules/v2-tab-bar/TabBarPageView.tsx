import * as React from "react";
import { useViewport } from "@/v2/shared/hooks/useViewport";
import {
  TabBarPageViewDesktop,
  type TabBarPageViewProps,
} from "./TabBarPageView.desktop";
import { TabBarPageViewMobile } from "./TabBarPageView.mobile";

export const TabBarPageView: React.FC<TabBarPageViewProps> = (props) => {
  const { isMobile } = useViewport();
  return isMobile ? (
    <TabBarPageViewMobile {...props} />
  ) : (
    <TabBarPageViewDesktop {...props} />
  );
};
