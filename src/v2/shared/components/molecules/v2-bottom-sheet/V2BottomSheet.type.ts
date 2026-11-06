import * as React from "react";

export interface V2BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  hideCloseButton?: boolean;
  hideDragHandle?: boolean;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  /** Custom height/max-height class (mặc định: "h-[100dvh] max-h-[100dvh]" cho full screen height) */
  maxHeightClass?: string;
  closeAriaLabel?: string;
}
