import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
  zIndex?: number;
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
}: ConfirmModalProps) {
  const t = useT();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 transition-all duration-300"
      style={{
        zIndex,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        // backdropFilter: "blur(1px)",
        // WebkitBackdropFilter: "blur(1px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-border/50 rounded-2xl shadow-xl p-6 w-full max-w-[340px]">
        <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
          {title || t("confirmModal.defaultTitle")}
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border text-xs font-medium bg-surface text-foreground hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel || t("confirmModal.defaultCancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50 flex items-center gap-[6px] shadow-sm active:scale-95",
              danger
                ? "bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/20"
                : "bg-primary text-primary-fg border border-primary hover:opacity-90",
            )}
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
          </button>
        </div>
      </div>
    </div>
  );
}
