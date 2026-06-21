import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { Button } from "@/shared/components/ui/Button";
import { ConfirmModal } from "./ConfirmModal";

// ── Types ──────────────────────────────────────────────────────────────────

export interface DrawerAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  /** When 'left', button is pushed to the left side of the footer */
  align?: "left" | "right";
  /** Visual variant — 'outline' renders a distinct outlined style */
  variant?: "danger" | "outline" | "secondary" | "ghost" | "link";
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
  /** Inline element rendered right after the title text (e.g. status badge) */
  titleExtra?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Extra element rendered to the right of title+subtitle, before the × button */
  headerExtra?: React.ReactNode;

  /** Footer action buttons (right-aligned) */
  actions?: DrawerAction[];

  /** When true, clicking the backdrop / pressing Escape / clicking × shows a confirm dialog */
  confirmOnClose?: boolean;

  children: React.ReactNode;

  /** z-index tier — defaults to 400 (same as SlidePanel) */
  stackOffset?: number;
  zIndex?: number;

  /** Optional classes for special drawer layouts */
  panelClassName?: string;
  bodyClassName?: string;
}

// ── Btn helper ─────────────────────────────────────────────────────────────

function Btn({ action }: { action: DrawerAction }) {
  const variant = action.primary
    ? "primary"
    : action.variant
      ? action.variant
      : "secondary";

  return (
    <Button
      variant={variant}
      size="sm"
      disabled={action.disabled || action.loading}
      onClick={action.onClick}
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
    </Button>
  );
}

// ── DrawerModal ────────────────────────────────────────────────────────────

export function DrawerModal({
  open,
  onClose,
  icon,
  title,
  titleExtra,
  subtitle,
  headerExtra,
  actions,
  confirmOnClose = false,
  children,
  zIndex = 400,
  stackOffset,
  panelClassName,
  bodyClassName,
}: DrawerModalProps) {
  const t = useT();
  const [showConfirm, setShowConfirm] = useState(false);

  // Mount/unmount portal: mount immediately on open, delay unmount for exit animation
  const [mounted, setMounted] = useState(open);
  // Separate "visible" state to trigger enter animation after mount
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Trigger enter animation on next frame after portal is in DOM
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      // Wait for exit animation before unmounting
      const timer = setTimeout(() => setMounted(false), 280);
      return () => clearTimeout(timer);
    }
  }, [open]);

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
    if (stackOffset !== undefined) return stackOffset;
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

  // Don't render portal when not mounted (no DOM footprint when closed)
  if (!mounted) return null;

  return createPortal(
    <div
      className={cn("slide-panel-overlay", visible && "open")}
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
            <div className="text-sm font-semibold text-foreground leading-tight truncate flex items-center gap-2">
              <span className="truncate">{title}</span>
              {titleExtra}
            </div>
            {subtitle && (
              <div className="text-xs text-[color:var(--muted-fg)] truncate mt-[1px]">
                {subtitle}
              </div>
            )}
          </div>
          {headerExtra}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={requestClose}
            className="ml-1 text-[color:var(--faint)] text-xl leading-none"
          >
            ×
          </Button>
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
            className="mt-auto px-[18px] py-3 border-t border-[rgba(228,231,236,0.6)] flex gap-2 flex-shrink-0"
            style={{
              background: "rgba(249,251,255,0.82)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            {/* Left-aligned actions */}
            <div className="flex gap-2 flex-1 min-w-0">
              {actions
                .filter((a) => a.align === "left")
                .map((a) => (
                  <Btn key={a.label} action={a} />
                ))}
            </div>
            {/* Right-aligned actions (default) */}
            <div className="flex gap-2">
              {actions
                .filter((a) => a.align !== "left")
                .map((a) => (
                  <Btn key={a.label} action={a} />
                ))}
            </div>
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
  titleExtra,
  collapsible,
  collapsed,
  onToggleCollapse,
  children,
}: {
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 rounded-xl border border-border bg-surface p-3 card-shadow">
      <div
        className={cn(
          "text-[11px] font-bold text-foreground/80 uppercase tracking-[0.06em] mb-[10px] pb-[6px] border-b border-[color:var(--border)] flex justify-between items-center",
          collapsible && "cursor-pointer select-none",
        )}
        onClick={collapsible ? onToggleCollapse : undefined}
      >
        <div className="flex items-center gap-2">
          <span>{title}</span>
          {collapsible && (
            <svg
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                collapsed ? "-rotate-90" : "rotate-0",
              )}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </div>
        {titleExtra && (
          <div className="text-foreground normal-case font-semibold text-sm">
            {titleExtra}
          </div>
        )}
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
