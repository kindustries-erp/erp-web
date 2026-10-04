import * as React from "react";

export interface DrawerHeaderProps {
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  headerExtra?: React.ReactNode;

  // Actions
  onClose: () => void;
  onToggleEdit?: () => void;
  isEditing?: boolean;

  // Fullscreen
  enableFullscreen?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;

  // Right panel collapse
  collapsibleRightPanel?: boolean;
  isRightPanelCollapsed?: boolean;
  onToggleRightPanel?: () => void;

  className?: string;
  closeAriaLabel?: string;
}
