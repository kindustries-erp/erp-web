import React from "react";
import { ChevronDown } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2Dropdown } from "@/v2/shared/components/molecules/v2-dropdown";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { GLASS_BAR_CLASS } from "@/v2/shared/ui/floating-surface";
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
      <V2Text as="span" variant="body-sm" className="leading-none text-inherit">
        {action.label}
      </V2Text>
    </V2Button>
  );
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  actions,
  actionGroups,
  actionDropdownItems,
  actionDropdownTriggerLabel,
  footerLeft,
  className,
  isScrolledBottom = false,
}) => {
  const { t } = useV2Translation();
  const dropdownLabel =
    actionDropdownTriggerLabel || t("v2.common.actions", "Thao tác");
  const hasDropdown =
    (actionGroups && actionGroups.length > 0) ||
    (actionDropdownItems && actionDropdownItems.length > 0);

  if (!actions?.length && !footerLeft && !hasDropdown) return null;

  const leftActions = actions?.filter((a) => a.align === "left") || [];
  const rightActions = actions?.filter((a) => a.align !== "left") || [];

  return (
    <div
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
      }}
      className={cn(
        "flex items-center justify-between px-3 sm:px-4 md:px-[18px] py-2.5",
        "border-t border-border/50 dark:border-white/[0.06] shrink-0 gap-2 flex-wrap sm:flex-nowrap transition-shadow duration-200",
        GLASS_BAR_CLASS,
        isScrolledBottom
          ? "shadow-[0_-4px_16px_-4px_rgba(15,23,42,0.08),0_-2px_4px_-2px_rgba(15,23,42,0.04)] dark:shadow-[0_-4px_18px_-4px_rgba(0,0,0,0.45),0_-2px_5px_-2px_rgba(0,0,0,0.3)]"
          : "shadow-none",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {hasDropdown && (
          <V2Dropdown
            groups={actionGroups}
            items={actionDropdownItems}
            modal={true}
            trigger={
              <V2Button
                type="button"
                variant="ghost"
                size="sm"
                rightIcon={
                  <ChevronDown className="w-3.5 h-3.5 text-muted-fg" />
                }
                className="h-auto px-3 py-1.5 rounded-lg text-xs font-medium border border-border/70 dark:border-white/[0.08] bg-surface/80 dark:bg-[#1d2129] hover:bg-surface-hover dark:hover:bg-[#252b34] text-foreground dark:text-zinc-200 dark:hover:text-white shadow-xs cursor-pointer select-none transition-colors"
              >
                <V2Text
                  as="span"
                  variant="body-sm"
                  className="leading-none text-inherit"
                >
                  {dropdownLabel}
                </V2Text>
              </V2Button>
            }
          />
        )}
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
