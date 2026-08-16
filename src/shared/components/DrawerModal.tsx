import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import { X } from "lucide-react";
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
  type?: "button" | "submit" | "reset";
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

  /** Footer action buttons */
  actions?: DrawerAction[];
  /** Custom element on left side of footer (e.g. status indicator, delete button) */
  footerLeft?: React.ReactNode;

  /** Width / style overrides */
  panelClassName?: string;
  bodyClassName?: string;

  /** Confirm prompt before closing when form is dirty */
  confirmOnClose?: boolean;

  /** Disable open/close slide transition */
  noAnimation?: boolean;

  /**
   * Override stacking offset percentage (default: auto -2% per deeper drawer).
   * Set 0 to disable stacking shift.
   */
  stackOffset?: number;

  /** Custom z-index (default: 400) */
  zIndex?: number;

  children: React.ReactNode;
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
      type={action.type || "button"}
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
  footerLeft,
  panelClassName,
  bodyClassName,
  confirmOnClose = false,
  noAnimation = false,
  stackOffset,
  zIndex = 400,
  children,
}: DrawerModalProps) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const hasScroll = el.scrollHeight > el.clientHeight;
    setIsScrolledTop(el.scrollTop > 0);
    setIsScrolledBottom(
      hasScroll && el.scrollTop + el.clientHeight < el.scrollHeight - 1,
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener("scroll", checkScrollState, { passive: true });
    const ro = new ResizeObserver(checkScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScrollState);
      ro.disconnect();
    };
  }, [open, checkScrollState]);

  // Mount/unmount lifecycle for CSS transitions
  useEffect(() => {
    if (open) {
      setMounted(true);
      if (noAnimation) {
        setVisible(true);
      } else {
        // Double RAF ensures browser has painted mounted DOM before transition starts
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setVisible(true);
          });
        });
      }
    } else {
      setVisible(false);
      if (noAnimation) {
        setMounted(false);
      } else {
        // Wait for exit animation before unmounting
        const timer = setTimeout(() => setMounted(false), 280);
        return () => clearTimeout(timer);
      }
    }
  }, [open, noAnimation]);

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
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className={cn(
          "slide-panel min-h-0 min-[1024px]:min-w-[450px] flex flex-col",
          panelClassName,
        )}
        style={
          open && computedStackOffset !== 0
            ? { transform: `translateX(${computedStackOffset}%)` }
            : undefined
        }
      >
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 relative"
        >
          {/* ── Sticky Header ── */}
          <div
            className={cn(
              "sticky top-0 z-20 px-5 py-3.5 border-b border-border/80 table-header-glass flex items-center gap-2.5 flex-shrink-0 transition-shadow duration-200",
              isScrolledTop
                ? "shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08),0_2px_4px_-2px_rgba(15,23,42,0.04)]"
                : "shadow-none",
            )}
            style={{
              backgroundColor: isScrolledTop
                ? "var(--drawer-header-scrolled-bg, rgba(246, 248, 252, 0.90))"
                : "var(--drawer-header-bg, rgba(246, 248, 252, 0.75))",
            }}
          >
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
              className="text-[color:var(--faint)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* ── Body ── */}
          <div className={cn("flex-1 p-[18px]", bodyClassName)}>{children}</div>

          {/* ── Sticky Footer ── */}
          {(footerLeft || (actions && actions.length > 0)) && (
            <div
              className={cn(
                "sticky bottom-0 z-20 mt-auto px-5 py-3 border-t border-border/80 table-footer-glass flex gap-2 flex-shrink-0 transition-shadow duration-200",
                isScrolledBottom
                  ? "shadow-[0_-4px_16px_-4px_rgba(15,23,42,0.08),0_-2px_4px_-2px_rgba(15,23,42,0.04)]"
                  : "shadow-none",
              )}
              style={{
                backgroundColor: isScrolledBottom
                  ? "var(--drawer-footer-scrolled-bg, rgba(246, 248, 252, 0.90))"
                  : "var(--drawer-footer-bg, rgba(246, 248, 252, 0.75))",
              }}
            >
              {/* Left-aligned actions or custom footerLeft */}
              <div className="flex gap-2 flex-1 min-w-0 items-center">
                {footerLeft}
                {actions
                  ?.filter((a) => a.align === "left")
                  .map((a) => (
                    <Btn key={a.label} action={a} />
                  ))}
              </div>
              {/* Right-aligned actions (default) */}
              <div className="flex gap-2">
                {actions
                  ?.filter((a) => a.align !== "left")
                  .map((a) => (
                    <Btn key={a.label} action={a} />
                  ))}
              </div>
            </div>
          )}
        </div>

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
  className,
}: {
  title: React.ReactNode;
  titleExtra?: React.ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 rounded-xl border border-border/80 p-3 card-shadow",
        className,
      )}
      style={{
        background: "var(--drawer-section-bg, rgba(255,255,255,0.65))",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
      }}
    >
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
