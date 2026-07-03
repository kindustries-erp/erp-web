import { useCallback } from "react";
import { RefreshCcw, Plus, MoreHorizontal } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";

interface TableActionGroupProps {
  onRefresh?: () => void;
  loading?: boolean;

  onFilterToggle?: () => void;
  activeFilterCount?: number;

  onCreate?: () => void;
  createLabel?: string;
  createActions?: import("@/shared/components/ActionDropdown").ActionDropdownItem[];

  extraActions?: React.ReactNode;
  children?: React.ReactNode;
  portalId?: string;
}

import { setPortalTarget } from "./portalStore";

export function TableActionGroup({
  onRefresh,
  loading,
  onFilterToggle,
  activeFilterCount = 0,
  onCreate,
  createLabel = "Tạo mới",
  createActions,
  extraActions,
  children,
  portalId = "default",
}: TableActionGroupProps) {
  const t = useT();

  const refCallback = useCallback(
    (el: Element | null) => {
      setPortalTarget(portalId, el);
    },
    [portalId],
  );
  return (
    <div className="flex items-center gap-2 w-full justify-end">
      {extraActions}
      {children}

      {onFilterToggle && (
        <FilterButton
          onClick={onFilterToggle}
          activeCount={activeFilterCount}
        />
      )}

      <div
        ref={refCallback}
        className="empty:hidden flex items-center justify-center"
      />

      {onRefresh && (
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 px-0"
          onClick={onRefresh}
          disabled={loading}
          title={t("Tải lại")}
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      )}

      {onCreate && (!createActions || createActions.length === 0) && (
        <Button onClick={onCreate} className="h-8 px-3">
          <Plus className="h-4 w-4 mr-1" />
          {t(createLabel)}
        </Button>
      )}

      {createActions && createActions.length > 0 && (
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 px-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              className="z-[9999] min-w-[160px] rounded-lg bg-surface border border-border shadow-md p-1 popup-content"
            >
              {createActions.map((action, index) => {
                if ("items" in action) {
                  if (action.hidden) return null;
                  const visibleItems = action.items.filter((i) => !i.hidden);
                  if (visibleItems.length === 0) return null;
                  return (
                    <div key={index} className="flex flex-col">
                      {index > 0 && <div className="h-px bg-border my-1" />}
                      {action.groupLabel && (
                        <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {action.groupLabel}
                        </div>
                      )}
                      {visibleItems.map((item, idx) => (
                        <Popover.Close key={idx} asChild>
                          <button
                            type="button"
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-[color:var(--popup-bg-hover)] focus:bg-[color:var(--popup-bg-hover)] w-full text-left",
                              item.disabled &&
                                "opacity-50 cursor-not-allowed pointer-events-none",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.disabled && !item.loading) {
                                setTimeout(() => {
                                  item.onClick();
                                }, 0);
                              }
                            }}
                            disabled={item.disabled}
                          >
                            {item.loading ? (
                              <svg
                                className="animate-spin w-4 h-4 flex-shrink-0 opacity-60 text-muted-foreground"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                              </svg>
                            ) : item.icon ? (
                              item.icon
                            ) : (
                              <Plus className="h-4 w-4 text-emerald-600" />
                            )}
                            <span
                              className={cn(
                                "font-medium",
                                item.variant === "danger"
                                  ? "text-red-500"
                                  : "text-foreground",
                              )}
                            >
                              {item.label}
                            </span>
                          </button>
                        </Popover.Close>
                      ))}
                    </div>
                  );
                }

                if (action.hidden) return null;
                return (
                  <Popover.Close key={index} asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-[color:var(--popup-bg-hover)] focus:bg-[color:var(--popup-bg-hover)] w-full text-left",
                        action.disabled &&
                          "opacity-50 cursor-not-allowed pointer-events-none",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!action.disabled && !action.loading) {
                          setTimeout(() => {
                            action.onClick();
                          }, 0);
                        }
                      }}
                      disabled={action.disabled}
                    >
                      {action.loading ? (
                        <svg
                          className="animate-spin w-4 h-4 flex-shrink-0 opacity-60 text-muted-foreground"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      ) : action.icon ? (
                        action.icon
                      ) : (
                        <Plus className="h-4 w-4 text-emerald-600" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          action.variant === "danger"
                            ? "text-red-500"
                            : "text-foreground",
                        )}
                      >
                        {action.label}
                      </span>
                    </button>
                  </Popover.Close>
                );
              })}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
