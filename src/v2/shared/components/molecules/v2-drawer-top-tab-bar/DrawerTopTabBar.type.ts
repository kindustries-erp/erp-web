import * as React from "react";

export interface DrawerTopTabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badgeCount?: number;
  hideRightPanel?: boolean;
  content?: React.ReactNode;
}

export interface DrawerTopTabBarProps {
  tabs: DrawerTopTabItem[];
  activeTabKey: string;
  onTabChange: (key: string) => void;
  className?: string;
  extra?: React.ReactNode;
}
