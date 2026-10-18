import * as React from "react";

export type V2ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface V2ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: V2ModalSize;
  hideCloseButton?: boolean;
  hideOverlay?: boolean;
  closeAriaLabel?: string;
  className?: string;
  bodyClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
}
