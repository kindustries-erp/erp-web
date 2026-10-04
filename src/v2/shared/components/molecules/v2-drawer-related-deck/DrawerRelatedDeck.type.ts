import React from "react";

export interface DrawerRelatedTabItem {
  /** Unique key for the tab */
  key: string;
  /** Display label */
  label: string;
  /** Optional leading icon */
  icon?: React.ReactNode;
  /** Badge counter */
  badgeCount?: number;
  /** Badge color variant */
  badgeVariant?: "default" | "secondary" | "outline" | "danger" | "warning";
  /** Content to render when active */
  content: React.ReactNode;
  /** Additional action element on right side of tab */
  headerExtra?: React.ReactNode;
  /** If true, removes padding and hides overflow (e.g. for charts/tables) */
  flush?: boolean;
  /** Custom class for card container */
  cardClassName?: string;
  /** If true, card container is omitted */
  noCard?: boolean;
}

export interface DrawerRelatedDeckProps {
  /** List of related tabs */
  tabs?: DrawerRelatedTabItem[];
  /** Default active tab key */
  defaultTabKey?: string;
  /** Default collapsed state (default: false) */
  defaultCollapsed?: boolean;
  /** Custom fallback content instead of tabs */
  customContent?: React.ReactNode;
  /** Custom title for horizon divider */
  customTitle?: React.ReactNode;
  /** Callback when tab changes */
  onTabChange?: (tabKey: string) => void;
  /** Additional root className */
  className?: string;
  /** Additional card container className */
  cardClassName?: string;
}
