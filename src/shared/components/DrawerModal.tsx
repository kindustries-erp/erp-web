import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { ConfirmModal } from "./ConfirmModal";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DrawerAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const DEFAULT_STACK_OFFSET = -2;

let drawerStackSeq = 0;
const drawerStackOrder = new Map<number, number>();

export interface DrawerModalProps {
  /** Controls open/close */
  open: boolean;
  onClose: () => void;

  /** Header */
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Extra element rendered to the right of title+subtitle, before the × button */
  headerExtra?: React.ReactNode;

  /** Footer action buttons (right-aligned) */
  actions?: DrawerAction[];

  /** When true, clicking the backdrop / pressing Escape / clicking × shows a confirm dialog */
  confirmOnClose?: boolean;

  children: React.ReactNode;

  /** z-index tier — defaults to 400 (same as SlidePanel) */
  zIndex?: number;

  /**
   * Percentage of this panel's own width to translate when stacked.
   * Negative = shift left (front panel peeks left, revealing the back panel on the right).
   * Positive = shift right (back panel slides right, showing its left edge peeking).
   * Uses CSS translateX(N%) — percentage is relative to the panel's own width.
   * CSS transition animates this automatically.
   * e.g. front=-42, back=+42 → ~16px gap between 420px/620px panels.
   */
  stackOffset?: number;

  /** Optional classes for special drawer layouts */
  panelClassName?: string;
  bodyClassName?: string;
}

// ── Btn helper ─────────────────────────────────────────────────────────────

function Btn({ action }: { action: DrawerAction }) {
  return (
    <button
      disabled={action.disabled || action.loading}
      onClick={action.onClick}
      className={cn(
        "px-[14px] py-[7px] rounded-lg border text-xs font-medium cursor-pointer flex items-center gap-[6px] whitespace-nowrap",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        action.primary
          ? "bg-primary text-primary-fg border-primary hover:opacity-90"
          : "bg-surface text-foreground border-border hover:bg-surface-hover",
      )}
    >
      {action.loading ? (
        <>
          <svg
            className="animate-spin w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          {action.label}
        </>
      ) : (
        action.label
      )}
    </button>
  );
}

// ── DrawerModal ────────────────────────────────────────────────────────────

export function DrawerModal({
  open,
  onClose,
  icon,
  title,
  subtitle,
  headerExtra,
  actions,
  confirmOnClose = false,
  children,
  zIndex = 400,
  stackOffset = 2.5,
  panelClassName,
  bodyClassName,
}: DrawerModalProps) {
  const t = useT();
  const [showConfirm, setShowConfirm] = useState(false);
  const [instanceId] = useState(() => {
    drawerStackSeq += 1;
    return drawerStackSeq;
  });

  useEffect(() => {
    if (open && !drawerStackOrder.has(instanceId)) {
      drawerStackOrder.set(instanceId, drawerStackOrder.size + 1);
    }
    if (!open && drawerStackOrder.has(instanceId)) {
      drawerStackOrder.delete(instanceId);
    }
    return () => {
      drawerStackOrder.delete(instanceId);
    };
  }, [instanceId, open]);

  const computedStackOffset = useMemo(() => {
    if (stackOffset !== 0) return stackOffset;
    const order = drawerStackOrder.get(instanceId);
    if (!order || order <= 1) return 0;
    return (order - 1) * DEFAULT_STACK_OFFSET;
  }, [instanceId, stackOffset]);

  const requestClose = useCallback(() => {
    if (confirmOnClose) setShowConfirm(true);
    else onClose();
  }, [confirmOnClose, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, requestClose]);

  return createPortal(
    <div
      className={cn("slide-panel-overlay", open && "open")}
      style={{
        zIndex,
        // backdropFilter: "blur(1px)",
        // WebkitBackdropFilter: "blur(1px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className={cn(
          "slide-panel min-h-0 min-[1024px]:min-w-[450px]",
          panelClassName,
        )}
        style={
          open && computedStackOffset !== 0
            ? { transform: `translateX(${computedStackOffset}%)` }
            : undefined
        }
      >
        {/* ── Header ── */}
        <div className="px-[18px] py-[14px] border-b border-border flex items-center gap-[10px] flex-shrink-0">
          {icon && (
            <div className="w-[30px] h-[30px] bg-[color:var(--muted)] rounded-lg flex items-center justify-center flex-shrink-0 text-[color:var(--muted-fg)]">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground leading-tight truncate">
              {title}
            </div>
            {subtitle && (
              <div className="text-xs text-[color:var(--muted-fg)] truncate mt-[1px]">
                {subtitle}
              </div>
            )}
          </div>
          {headerExtra}
          <button
            onClick={requestClose}
            className="ml-1 text-[color:var(--faint)] text-xl leading-none px-1 hover:text-foreground flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* ── Body ── */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-[18px]",
            "min-h-0",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {/* ── Footer ── */}
        {actions && actions.length > 0 && (
          <div
            className="mt-auto px-[18px] py-3 border-t border-[rgba(228,231,236,0.6)] flex gap-2 justify-end flex-shrink-0"
            style={{
              background: "rgba(249,251,255,0.82)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {actions.map((a) => (
              <Btn key={a.label} action={a} />
            ))}
          </div>
        )}

        {/* ── Confirm-before-close overlay ── */}
        <ConfirmModal
          open={showConfirm}
          title={t("voucher.drawer.closeConfirmTitle")}
          message={t("voucher.drawer.closeConfirmDesc")}
          confirmLabel={t("voucher.drawer.closeConfirmBtn")}
          cancelLabel={t("voucher.drawer.continueEdit")}
          onConfirm={() => {
            setShowConfirm(false);
            onClose();
          }}
          onCancel={() => setShowConfirm(false)}
          danger={true}
          zIndex={zIndex + 100}
        />
      </div>
    </div>,
    document.body,
  );
}

// ── Section / Row helpers (re-exported for use inside drawers) ─────────────

export function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <div className="text-[10px] font-semibold text-[color:var(--faint)] uppercase tracking-[0.1em] mb-[10px] pb-[6px] border-b border-[color:var(--border-light)]">
        {title}
      </div>
      {children}
    </div>
  );
}

export function DrawerRow({
  label,
  value,
  cls = "",
}: {
  label: string;
  value: React.ReactNode;
  cls?: string;
}) {
  return (
    <div className="flex justify-between items-start py-[7px] border-b border-[color:var(--border-light)] text-xs last:border-b-0">
      <span className="text-[color:var(--muted-fg)] flex-shrink-0">
        {label}
      </span>
      <span className={cn("text-foreground font-medium text-right ml-3", cls)}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export function DrawerField({
  label,
  required,
  labelExtra,
  children,
}: {
  label: string;
  required?: boolean;
  /** Optional node rendered at the right side of the label row (e.g. action buttons) */
  labelExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[10px]">
      <div className="text-[11px] font-medium text-[color:var(--muted-fg)] mb-1 flex items-center gap-[3px]">
        <span className="flex items-center gap-[3px] flex-1 min-w-0">
          {label}
          {required && <span className="text-[#e24b4a]">*</span>}
        </span>
        {labelExtra}
      </div>
      {children}
    </div>
  );
}

export const inputCls =
  "w-full text-xs text-foreground bg-[color:var(--muted)] border border-[color:var(--border)] rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors";

export const selectCls =
  "form-select w-full text-xs text-foreground bg-[color:var(--muted)] border border-[color:var(--border)] rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors";
