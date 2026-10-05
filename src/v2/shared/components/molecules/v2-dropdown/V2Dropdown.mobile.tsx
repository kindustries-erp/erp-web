import * as React from "react";
import { MoreHorizontal, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/v2/shared/ui/dialog";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type {
  V2DropdownProps,
  V2DropdownItem,
  V2DropdownGroup,
} from "./V2Dropdown.type";

export const V2DropdownMobile: React.FC<V2DropdownProps> = ({
  trigger,
  children,
  items,
  groups,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  title,
  className,
  triggerClassName,
}) => {
  const { t } = useV2Translation();
  const resolvedTitle =
    title ?? t("dropdown.optionsTitle", "Tùy chọn thao tác");
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (!isControlled) setInternalOpen(val);
    controlledOnOpenChange?.(val);
  };

  const triggerNode = trigger ?? children ?? (
    <button
      type="button"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-fg hover:bg-surface-hover hover:text-foreground cursor-pointer"
      aria-label={t("common.actions", "Thao tác")}
    >
      <MoreHorizontal className="w-4 h-4" />
    </button>
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={triggerClassName}>
        {triggerNode}
      </DialogTrigger>
      <DialogContent
        hideCloseButton={true}
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto left-0 translate-x-0 translate-y-0",
          "w-full max-w-none rounded-b-none rounded-t-2xl max-h-[85vh]",
          "flex flex-col p-0 overflow-hidden border-b-0",
          "bg-[var(--modal-bg,rgba(246,248,252,0.88))] backdrop-blur-[var(--glass-blur,16px)]",
          "border border-[color:var(--popup-border,rgba(226,232,240,0.8))]",
          className,
        )}
      >
        {/* Grab Handle */}
        <div
          data-testid="v2-dropdown-mobile-grab-handle"
          className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto my-2.5 shrink-0"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2.5 pt-0.5 border-b border-border/50 shrink-0">
          <DialogTitle className="text-xs font-semibold text-foreground">
            {resolvedTitle}
          </DialogTitle>
          <DialogClose
            aria-label={t("common.close", "Đóng")}
            className="rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-surface-hover text-muted-fg hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </div>

        {/* Content list */}
        <div className="px-3 py-2 flex-1 overflow-y-auto space-y-3">
          {normalizedGroups.map((group, gIdx) => {
            const visibleItems = group.items.filter((item) => !item.hidden);
            if (visibleItems.length === 0) return null;

            return (
              <div key={gIdx} className="space-y-1">
                {group.groupLabel && (
                  <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.groupLabel}
                  </div>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item, iIdx) => (
                    <button
                      key={item.key || item.label || iIdx}
                      type="button"
                      disabled={item.disabled || item.loading}
                      onClick={() => {
                        if (!item.disabled && !item.loading) {
                          if (!item.preventClose) setOpen(false);
                          item.onClick?.();
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors",
                        "hover:bg-surface-hover active:bg-surface-hover/80 text-foreground cursor-pointer",
                        item.variant === "danger" &&
                          "text-destructive hover:bg-destructive/10",
                        (item.disabled || item.loading) &&
                          "opacity-50 pointer-events-none",
                      )}
                    >
                      {item.loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-fg shrink-0" />
                      ) : item.icon ? (
                        <span className="shrink-0 text-muted-fg">
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="truncate flex-1">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
V2DropdownMobile.displayName = "V2DropdownMobile";
