import * as React from "react";

export interface DrawerSubTabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badgeCount?: number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface DrawerSubTabBarProps {
  tabs: DrawerSubTabItem[];
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
  extra?: React.ReactNode;
  className?: string;
}
