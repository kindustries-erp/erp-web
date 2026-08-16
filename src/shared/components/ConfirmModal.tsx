import * as React from "react";
import { useT } from "@/core/i18n";
import { Button } from "@/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { cn } from "@/shared/utils";

export interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: React.ReactNode | string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
  zIndex?: number;
  confirmDisabled?: boolean;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
  confirmDisabled = false,
}: ConfirmModalProps) {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        hideCloseButton
        hideOverlay
        className={cn("max-w-[380px] p-6")}
      >
        <DialogHeader className="text-left space-y-1.5 mb-2">
          <DialogTitle className="text-sm font-semibold text-foreground">
            {title || t("confirmModal.defaultTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-[color:var(--muted-fg)] leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2 mt-4 sm:space-x-0">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel || t("confirmModal.defaultCancel")}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="md"
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            className="min-w-[100px]"
          >
            {loading && (
              <svg
                className="animate-spin w-3 h-3 mr-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            )}
            {loading
              ? t("common.processing")
              : confirmLabel || t("confirmModal.defaultConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
