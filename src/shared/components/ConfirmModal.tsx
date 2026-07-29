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
      className="fixed inset-0 transition-all duration-300"
      style={{
        zIndex,
        backgroundColor: "rgba(0, 0, 0, 0.025)",
        // backdropFilter: "blur(0.75px)",
        // WebkitBackdropFilter: "blur(0.75px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border/50 rounded-2xl shadow-xl p-6 w-full max-w-[340px]">
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
