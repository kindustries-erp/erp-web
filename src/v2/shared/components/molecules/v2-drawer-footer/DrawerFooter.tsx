import React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { cn } from "@/v2/shared/utils/cn";
import type { DrawerFooterProps, DrawerAction } from "./DrawerFooter.type";

function ActionButton({ action }: { action: DrawerAction }) {
  const variant = action.primary
    ? "primary"
    : action.variant === "danger"
      ? "destructive"
      : (action.variant ?? "secondary");

  return (
    <V2Button
      type={action.type || "button"}
      variant={variant as any}
      size="sm"
      isLoading={action.loading}
      disabled={action.disabled}
      onClick={action.onClick}
    >
      {action.label}
    </V2Button>
  );
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  actions,
  footerLeft,
  className,
  isScrolledBottom = false,
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
        "border-t border-border/70 backdrop-blur-md shrink-0 gap-2 flex-wrap sm:flex-nowrap transition-shadow duration-200",
        isScrolledBottom
          ? "shadow-[0_-4px_16px_-4px_rgba(15,23,42,0.08),0_-2px_4px_-2px_rgba(15,23,42,0.04)] bg-[var(--drawer-footer-scrolled-bg,rgba(246,248,252,0.92))]"
          : "shadow-none bg-[var(--drawer-footer-bg,rgba(246,248,252,0.75))]",
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
