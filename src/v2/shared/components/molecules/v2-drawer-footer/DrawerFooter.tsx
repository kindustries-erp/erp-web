import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerFooterProps, DrawerAction } from "./DrawerFooter.type";

const ACTION_VARIANTS: Record<string, string> = {
  primary:
    "bg-primary text-primary-fg shadow-sm hover:opacity-90 focus-visible:ring-primary",
  danger:
    "bg-destructive text-destructive-fg shadow-sm hover:opacity-90 focus-visible:ring-destructive",
  outline:
    "border border-border/80 bg-surface/80 hover:bg-surface-hover text-foreground shadow-xs",
  secondary: "bg-muted hover:bg-surface-hover text-foreground",
  ghost: "hover:bg-surface-hover text-muted-fg hover:text-foreground",
};

function ActionButton({ action }: { action: DrawerAction }) {
  const variant = action.primary
    ? "primary"
    : action.variant
      ? action.variant
      : "secondary";

  return (
    <button
      type={action.type || "button"}
      onClick={action.onClick}
      disabled={action.disabled || action.loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
        ACTION_VARIANTS[variant] || ACTION_VARIANTS.secondary,
      )}
    >
      {action.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      <span>{action.label}</span>
    </button>
  );
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  actions,
  footerLeft,
  className,
}) => {
  if (!actions?.length && !footerLeft) return null;

  const leftActions = actions?.filter((a) => a.align === "left") || [];
  const rightActions = actions?.filter((a) => a.align !== "left") || [];

  return (
    <div
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
      }}
      className={cn(
        "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-2.5",
        "border-t border-border/70 bg-[var(--drawer-footer-bg,rgba(246,248,252,0.75))] backdrop-blur-md shrink-0 gap-2 flex-wrap sm:flex-nowrap",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {footerLeft}
        {leftActions.map((action, idx) => (
          <ActionButton key={idx} action={action} />
        ))}
      </div>

      <div className="flex items-center gap-2 justify-end flex-1 flex-wrap sm:flex-nowrap">
        {rightActions.map((action, idx) => (
          <ActionButton key={idx} action={action} />
        ))}
      </div>
    </div>
  );
};
