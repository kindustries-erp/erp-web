import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";

interface ReasonConfirmModalProps {
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
  zIndex = 600,
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

  if (!open) return null;

  const canConfirm = reason.trim().length > 0;

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
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div
        className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-[400px] animate-in fade-in-0 zoom-in-95 duration-150"
        style={{
          boxShadow:
            "0 24px 48px -12px rgba(15, 23, 42, 0.22), 0 4px 16px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h3 className="text-sm font-semibold text-foreground mb-1.5">
          {title || "Xác nhận"}
        </h3>
        {message && (
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            {message}
          </p>
        )}
        <textarea
          ref={textareaRef}
          className="w-full text-xs text-foreground bg-muted/20 border border-border rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors resize-none mb-4"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-border text-xs font-medium bg-surface text-foreground hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel || t("confirmModal.defaultCancel")}
          </button>
          <button
            onClick={() => canConfirm && onConfirm(reason.trim())}
            disabled={loading || !canConfirm}
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
            {loading ? t("common.processing") : confirmLabel || "Xác nhận"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
