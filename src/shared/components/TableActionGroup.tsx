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
import { ActionDropdown } from "@/shared/components/ActionDropdown";

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
        <ActionDropdown
          items={createActions}
          customTrigger={
            <Button variant="secondary" size="icon" className="h-8 w-8 px-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          }
        />
      )}
    </div>
  );
}
