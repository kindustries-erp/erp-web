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

export const V2_DRAWER_SIZE_CLASSES: Record<V2DrawerSize, string> = {
  sm: "w-full min-w-0 max-w-full md:w-[90vw] lg:w-[42vw] xl:w-[38vw] 2xl:w-[32vw] lg:min-w-[420px] lg:max-w-[660px]",
  md: "w-full min-w-0 max-w-full md:w-[92vw] lg:w-[60vw] xl:w-[54vw] 2xl:w-[48vw] lg:min-w-[620px] lg:max-w-[980px]",
  lg: "w-full min-w-0 max-w-full md:w-[95vw] lg:w-[78vw] xl:w-[74vw] 2xl:w-[68vw] lg:min-w-[840px] lg:max-w-[1380px]",
  xl: "w-full min-w-0 max-w-full md:w-[96vw] lg:w-[93vw] xl:w-[90vw] 2xl:w-[88vw] lg:min-w-[1020px] lg:max-w-[1780px]",
  full: "w-full min-w-0 max-w-full md:w-[98vw] lg:w-[calc(100vw-36px)] xl:w-[calc(100vw-40px)] lg:min-w-[1020px]",
};

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

  // Multi-drawer stacking & depth
  id?: string;
  stackOffsetPx?: number;
  disableStackOffset?: boolean;

  // Class overrides & Options
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
  closeAriaLabel?: string;
  floating?: boolean;
}
