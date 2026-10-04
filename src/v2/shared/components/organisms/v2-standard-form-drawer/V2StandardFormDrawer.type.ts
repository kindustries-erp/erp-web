import * as React from "react";
import type { DrawerTopTabItem } from "@/v2/shared/components/molecules/v2-drawer-top-tab-bar";
import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer";

export type { DrawerTopTabItem, DrawerAction };

export type V2DrawerSize = "sm" | "md" | "lg" | "xl" | "full";
export type V2DrawerMode = "view" | "edit";
export type V2DrawerLayout = "1-column" | "2-columns";

export interface V2StandardFormDrawerProps {
  open: boolean;
  mode?: V2DrawerMode;
  onClose: () => void;
  onToggleEdit?: () => void;

  title: string;
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

  // Top Tabs for multi-facet documents
  tabs?: DrawerTopTabItem[];
  activeTabKey?: string;
  defaultTabKey?: string;
  onTabChange?: (tabKey: string) => void;

  // Content Panels
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  children?: React.ReactNode;

  // Actions & Footer
  actions?: DrawerAction[];
  footerLeft?: React.ReactNode;

  // State guards
  loading?: boolean;
  error?: string | null;
  confirmOnClose?: boolean;

  // Class overrides
  className?: string;
  panelClassName?: string;
  bodyClassName?: string;
  closeAriaLabel?: string;
}
