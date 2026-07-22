import { useCallback } from "react";
import { RefreshCcw, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";

interface TableActionGroupProps {
  onRefresh?: () => void;
  loading?: boolean;

  onFilterToggle?: () => void;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;

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
  onClearAllFilters,
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
          onClear={onClearAllFilters}
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

      {!onCreate && createActions && createActions.length > 0 && (
        <ActionDropdown
          items={createActions}
          align="end"
          customTrigger={
            <Button className="h-8 px-3">
              {t(createLabel)}
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
            </Button>
          }
        />
      )}

      {onCreate && createActions && createActions.length > 0 && (
        <div className="flex items-center">
          <Button
            onClick={onCreate}
            className="h-8 rounded-r-none px-3 border-r-0 focus:z-10"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t(createLabel)}
          </Button>
          <div className="w-[1px] h-8 bg-primary-foreground/20 z-10" />
          <ActionDropdown
            items={createActions}
            align="end"
            customTrigger={
              <Button className="h-8 w-8 px-0 rounded-l-none border-l-0 focus:z-10">
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
