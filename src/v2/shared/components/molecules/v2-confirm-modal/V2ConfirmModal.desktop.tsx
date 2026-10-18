import * as React from "react";
import { AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/v2/shared/ui/dialog";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type {
  V2ConfirmModalProps,
  V2ConfirmVariant,
} from "./V2ConfirmModal.type";

const ICON_MAP: Record<V2ConfirmVariant, React.ReactNode> = {
  danger: (
    <AlertTriangle
      className="h-5 w-5 text-destructive shrink-0"
      aria-hidden="true"
    />
  ),
  warning: (
    <AlertCircle className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
  ),
  primary: (
    <HelpCircle className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
  ),
};

export const V2ConfirmModalDesktop: React.FC<V2ConfirmModalProps> = ({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "primary",
  isLoading = false,
  confirmDisabled = false,
  hideIcon = false,
  onConfirm,
  onCancel,
  className,
}) => {
  const { t } = useV2Translation();

  const effectiveTitle =
    title ?? t("v2.confirmModal.defaultTitle", "Xác nhận hành động");
  const effectiveConfirmLabel =
    confirmLabel ?? t("v2.confirmModal.defaultConfirm", "Xác nhận");
  const effectiveCancelLabel =
    cancelLabel ?? t("v2.confirmModal.defaultCancel", "Hủy");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
        onOpenChange?.(v);
      }}
    >
      <DialogContent
        hideCloseButton
        className={cn("max-w-[380px] p-6 text-left", className)}
      >
        <DialogHeader className="space-y-2 mb-2 text-left">
          <div className="flex items-center gap-2.5">
            {!hideIcon && ICON_MAP[variant]}
            <DialogTitle className="text-sm font-semibold text-foreground leading-snug">
              {effectiveTitle}
            </DialogTitle>
          </div>
          {typeof message === "string" ? (
            <DialogDescription className="text-xs text-muted-fg leading-relaxed">
              {message}
            </DialogDescription>
          ) : (
            <div className="text-xs text-muted-fg leading-relaxed">
              {message}
            </div>
          )}
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2.5 mt-5">
          <V2Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {effectiveCancelLabel}
          </V2Button>
          <V2Button
            variant={variant === "danger" ? "destructive" : "primary"}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={confirmDisabled || isLoading}
            className="min-w-[88px]"
          >
            {effectiveConfirmLabel}
          </V2Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
