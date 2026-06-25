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

      {(onCreate || (createActions && createActions.length > 0)) && (
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
              {createActions && createActions.length > 0 ? (
                createActions.map((action, index) => {
                  // We handle only ActionItem here since it's a simple list in Popover.
                  // For groups, one would use ActionDropdown, but here we just map items.
                  if ("items" in action) return null;
                  return (
                    <button
                      key={index}
                      type="button"
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-[color:var(--popup-bg-hover)] focus:bg-[color:var(--popup-bg-hover)] w-full text-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!action.disabled && !action.loading) {
                          action.onClick();
                        }
                      }}
                      disabled={action.disabled}
                      hidden={action.hidden}
                    >
                      {action.icon || (
                        <Plus className="h-4 w-4 text-emerald-600" />
                      )}
                      <span className="font-medium">{action.label}</span>
                    </button>
                  );
                })
              ) : (
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-[color:var(--popup-bg-hover)] focus:bg-[color:var(--popup-bg-hover)] w-full text-left"
                  onClick={onCreate}
                >
                  <Plus className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">{t(createLabel)}</span>
                </button>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}
    </div>
  );
}
