import type * as React from "react";
import type { V2TabItemData } from "@/v2/shared/components/molecules/v2-tab-bar";
import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer";
import type { DrawerRelatedTabItem } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import type {
  V2DropdownGroup,
  V2DropdownEntry,
} from "@/v2/shared/components/molecules/v2-dropdown";

export type {
  V2TabItemData,
  DrawerAction,
  DrawerRelatedTabItem,
  V2DropdownGroup,
  V2DropdownEntry,
};

export type V2DrawerSize = "sm" | "md" | "lg" | "xl" | "full";
export type V2DrawerMode = "view" | "edit";
export type V2DrawerLayout = "1-column" | "2-columns";

export interface V2DrawerChildrenContext {
  activeTabKey: string;
  activeLeftTabKey?: string;
  activeRightTabKey?: string;
}

export type V2DrawerChildren =
  | React.ReactNode
  | ((context: V2DrawerChildrenContext) => React.ReactNode);

export interface V2StandardDrawerProps {
  open: boolean;
  mode?: V2DrawerMode;
  onClose: () => void;
  onToggleEdit?: () => void;

  title: string | React.ReactNode;
  titleExtra?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;

  layout?: V2DrawerLayout;
  size?: V2DrawerSize;

  // Fullscreen controls
  enableFullscreen?: boolean;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;

  // Right panel controls
  collapsibleRightPanel?: boolean;
  isRightPanelCollapsed?: boolean;
  onRightPanelCollapseChange?: (collapsed: boolean) => void;
  stickyRightPanel?: boolean;

  // 1. Header Tabs (Toàn cục qua V2TabBar variant="header")
  tabs?: V2TabItemData[];
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;
  tabBarExtra?: React.ReactNode;

  // 2. Left Sub-Tabs (Optional qua V2TabBar variant="sub")
  leftTabs?: V2TabItemData[];
  activeLeftTabKey?: string;
  defaultLeftTabKey?: string;
  onLeftTabChange?: (subTabKey: string) => void;
  leftTabExtra?: React.ReactNode;

  // 3. Right Sub-Tabs (Optional qua V2TabBar variant="sub")
  rightTabs?: V2TabItemData[];
  activeRightTabKey?: string;
  defaultRightTabKey?: string;
  onRightTabChange?: (subTabKey: string) => void;
  rightTabExtra?: React.ReactNode;

  // Content Panels
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: V2DrawerChildren;

  // Horizon Divider & Related Deck
  relatedTabs?: DrawerRelatedTabItem[];
  defaultRelatedTabKey?: string;
  defaultRelatedCollapsed?: boolean;
  bottomPanel?: React.ReactNode;
  bottomPanelTitle?: React.ReactNode;
  onRelatedTabChange?: (tabKey: string) => void;
  deckCardClassName?: string;

  // Actions & Footer
  actions?: DrawerAction[];
  actionGroups?: V2DropdownGroup[];
  actionDropdownItems?: V2DropdownEntry[];
  actionDropdownTriggerLabel?: string;
  footerLeft?: React.ReactNode;

  // State guards
  loading?: boolean;
  error?: string | null;
  confirmOnClose?: boolean;

  // Class overrides & Options
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
  closeAriaLabel?: string;
  floating?: boolean;
}
