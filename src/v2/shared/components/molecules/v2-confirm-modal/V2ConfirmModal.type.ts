import * as React from "react";

export type V2ConfirmVariant = "primary" | "danger" | "warning";

export interface V2ConfirmModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: V2ConfirmVariant;
  isLoading?: boolean;
  confirmDisabled?: boolean;
  hideIcon?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  className?: string;
}
