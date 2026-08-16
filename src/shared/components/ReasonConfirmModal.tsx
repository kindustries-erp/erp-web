import { useState, useEffect, useRef } from "react";
import { cn } from "@/shared/utils";
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

export interface ReasonConfirmModalProps {
  open: boolean;
  title?: string;
  message?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
  zIndex?: number;
}

/**
 * A confirm modal that requires the user to enter a reason (text) before confirming.
 * Reusable for reject, cancel, or any action that needs a mandatory note.
 */
export function ReasonConfirmModal({
  open,
  title,
  message,
  placeholder = "Nhập lý do...",
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading = false,
  danger = true,
}: ReasonConfirmModalProps) {
  const t = useT();
  const [reason, setReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  const canConfirm = reason.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent
        hideCloseButton
        hideOverlay
        className={cn("max-w-[400px] p-6")}
      >
        <DialogHeader className="text-left space-y-1.5 mb-2">
          <DialogTitle className="text-sm font-semibold text-foreground">
            {title || t("confirmModal.defaultTitle")}
          </DialogTitle>
          {message && (
            <DialogDescription className="text-xs text-[color:var(--muted-fg)] leading-relaxed">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>

        <textarea
          ref={textareaRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full text-xs p-2.5 rounded-lg border border-[color:var(--popup-border)] bg-black/[0.03] dark:bg-white/[0.05] text-foreground placeholder:text-[color:var(--faint)] resize-none outline-none focus:border-primary transition-colors mb-4"
        />

        <DialogFooter className="flex-row justify-end gap-2 sm:space-x-0">
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
            onClick={() => canConfirm && onConfirm(reason.trim())}
            disabled={loading || !canConfirm}
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
