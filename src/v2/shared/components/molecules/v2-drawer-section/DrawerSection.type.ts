import * as React from "react";

export interface DrawerSectionProps {
  title?: React.ReactNode;
  titleExtra?: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onToggleCollapse?: () => void;
  fitViewportHeight?: boolean;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  hideHeader?: boolean;
  hideTitle?: boolean;
}
