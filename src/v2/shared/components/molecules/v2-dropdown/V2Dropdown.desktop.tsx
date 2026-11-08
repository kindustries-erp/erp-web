import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { V2Button, V2Icon, V2Text } from "@/v2/shared/components/atoms";
import { AppPopover } from "@/v2/shared/components/molecules/v2-popover";
import { useV2PopoverDismiss } from "@/v2/shared/hooks/useV2PopoverDismiss";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { V2Tooltip } from "@/v2/shared/components/atoms/v2-tooltip";
import type {
  V2DropdownProps,
  V2DropdownItem,
  V2DropdownGroup,
} from "./V2Dropdown.type";

const GLASS_STYLE: React.CSSProperties = {
  backdropFilter: "blur(var(--glass-blur, 8px)) saturate(180%)",
  WebkitBackdropFilter: "blur(var(--glass-blur, 8px)) saturate(180%)",
};

export const V2DropdownDesktop: React.FC<V2DropdownProps> = ({
  trigger,
  children,
  items,
  groups,
  open,
  onOpenChange,
  align = "start",
  side = "bottom",
  sideOffset = 6,
  className,
  triggerClassName,
  modal = false,
}) => {
  const { t } = useV2Translation();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  useV2PopoverDismiss({
    open: isOpen,
    onClose: () => handleOpenChange(false),
    containerRef,
    panelSelector: "[data-v2-dropdown-panel]",
  });

  const triggerNode = trigger ?? children ?? (
    <V2Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="w-7 h-7 rounded-lg text-muted-fg hover:bg-surface-hover hover:text-foreground"
      aria-label={t("v2.common.actions", "Thao tác")}
    >
      <V2Icon icon={MoreHorizontal} size={16} />
    </V2Button>
  );

  const normalizedGroups: V2DropdownGroup[] = React.useMemo(() => {
    if (groups && groups.length > 0) {
      return groups.filter((g) => !g.hidden);
    }
    if (items && items.length > 0) {
      const result: V2DropdownGroup[] = [];
      let currentUngrouped: V2DropdownItem[] = [];

      for (const entry of items) {
        if (entry.hidden) continue;
        if ("items" in entry) {
          if (currentUngrouped.length > 0) {
            result.push({ items: currentUngrouped });
            currentUngrouped = [];
          }
          result.push(entry);
        } else {
          currentUngrouped.push(entry);
        }
      }
      if (currentUngrouped.length > 0) {
        result.push({ items: currentUngrouped });
      }
      return result;
    }
    return [];
  }, [groups, items]);

  const handleItemClick = (item: V2DropdownItem) => {
    if (item.disabled || item.loading) return;
    item.onClick?.();
    handleOpenChange(false);
  };

  const dropdownMenuContent = (
    <div data-v2-dropdown-panel="" className="flex flex-col py-0.5 space-y-0.5">
      {normalizedGroups.map((group, groupIdx) => {
        const visibleItems = group.items.filter((item) => !item.hidden);
        if (visibleItems.length === 0) return null;

        return (
          <React.Fragment key={groupIdx}>
            {groupIdx > 0 && (
              <div className="my-1 -mx-1 h-[1px] bg-border/60 dark:bg-white/[0.06]" />
            )}
            <div className="flex flex-col">
              {group.groupLabel && (
                <V2Text
                  as="div"
                  variant="caption"
                  weight="semibold"
                  className="px-2.5 py-1 text-[10px] tracking-wider text-muted-fg dark:text-teal-400/80 uppercase select-none"
                >
                  {group.groupLabel}
                </V2Text>
              )}
              {visibleItems.map((item, itemIdx) => {
                const iconNode = item.icon ? (
                  typeof item.icon === "function" ||
                  (typeof item.icon === "object" &&
                    !React.isValidElement(item.icon)) ? (
                    <V2Icon
                      icon={item.icon as any}
                      size={15}
                      className="shrink-0 text-muted-fg opacity-85"
                    />
                  ) : (
                    <span className="shrink-0 text-muted-fg opacity-85 inline-flex items-center [&>svg]:h-3.5 [&>svg]:w-3.5">
                      {item.icon}
                    </span>
                  )
                ) : null;

                const btn = (
                  <V2Button
                    key={item.key || item.label || itemIdx}
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={item.disabled}
                    isLoading={item.loading}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "h-auto w-full justify-start gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-left whitespace-nowrap transition-colors",
                      "text-foreground hover:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.05))] hover:text-foreground dark:hover:bg-teal-500/10 dark:hover:text-teal-300 active:bg-[color:var(--sidebar-hover-bg,rgba(0,0,0,0.08))] dark:active:bg-teal-500/15",
                      item.variant === "danger" &&
                        "text-destructive hover:bg-destructive/10 active:bg-destructive/15",
                    )}
                  >
                    {iconNode}
                    <V2Text
                      as="span"
                      variant="body-sm"
                      className="truncate text-left font-medium text-inherit whitespace-nowrap"
                    >
                      {item.label}
                    </V2Text>
                  </V2Button>
                );

                if (item.disabled && item.disabledReason) {
                  return (
                    <V2Tooltip
                      key={item.key || item.label || itemIdx}
                      content={item.disabledReason}
                      side="right"
                    >
                      <span className="block w-full">{btn}</span>
                    </V2Tooltip>
                  );
                }

                return btn;
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div ref={containerRef} className="inline-flex">
      <AppPopover
        open={isOpen}
        onOpenChange={handleOpenChange}
        align={align}
        side={side}
        sideOffset={sideOffset}
        glass={true}
        arrow={false}
        hideCloseButton={true}
        modal={modal}
        triggerClassName={triggerClassName}
        style={GLASS_STYLE}
        className={cn(
          "w-max min-w-0 max-w-xs p-1 rounded-xl",
          "border border-border/70 shadow-[var(--popup-shadow)]",
          className,
        )}
        content={dropdownMenuContent}
      >
        {triggerNode}
      </AppPopover>
    </div>
  );
};
V2DropdownDesktop.displayName = "V2DropdownDesktop";
