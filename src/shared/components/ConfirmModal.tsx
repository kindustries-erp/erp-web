import { createPortal } from "react-dom";

import { useT } from "@/core/i18n";
import { Button } from "@/shared/components/ui/Button";

interface ConfirmModalProps {
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
  zIndex = 500,
  confirmDisabled = false,
}: ConfirmModalProps) {
  const t = useT();

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 transition-all duration-300 flex items-center justify-center p-4"
      style={{
        zIndex,
        backgroundColor: "rgba(15, 23, 42, 0.20)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-[360px] animate-in fade-in-0 zoom-in-95 duration-150"
        style={{
          boxShadow:
            "0 24px 48px -12px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-1.5">
          {title || t("confirmModal.defaultTitle")}
        </h3>
        <div className="text-xs text-[color:var(--muted-fg)] mb-6 leading-relaxed">
          {message}
        </div>
        <div className="flex gap-2 justify-end">
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
                className="animate-spin w-3 h-3"
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
        </div>
      </div>
    </div>,
    document.body,
  );
}
