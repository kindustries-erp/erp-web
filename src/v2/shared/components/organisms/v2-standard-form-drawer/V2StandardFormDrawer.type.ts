import type { DrawerTopTabItem } from "@/v2/shared/components/molecules/v2-drawer-top-tab-bar";
import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer";
import type { DrawerRelatedTabItem } from "@/v2/shared/components/molecules/v2-drawer-related-deck";
import type {
  V2DropdownGroup,
  V2DropdownEntry,
} from "@/v2/shared/components/molecules/v2-dropdown";

export type {
  DrawerTopTabItem,
  DrawerAction,
  DrawerRelatedTabItem,
  V2DropdownGroup,
  V2DropdownEntry,
};

export type V2DrawerSize = "sm" | "md" | "lg" | "xl" | "full";
export type V2DrawerMode = "view" | "edit";
export type V2DrawerLayout = "1-column" | "2-columns";

export interface V2StandardFormDrawerProps {
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

  // Top Tabs for multi-facet documents
  tabs?: DrawerTopTabItem[];
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;
  tabBarExtra?: React.ReactNode;

  // Content Panels
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: React.ReactNode;

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
