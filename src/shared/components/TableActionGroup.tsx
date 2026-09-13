import { useCallback } from "react";
import { RefreshCcw, Plus, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
import { useT } from "@/core/i18n";

interface TableActionGroupProps {
  onRefresh?: () => void;
  loading?: boolean;

  onFilterToggle?: () => void;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;

  onCreate?: () => void;
  createLabel?: string;
  createIcon?: React.ReactNode;
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
  createIcon,
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
    <div className="flex items-center gap-2 w-full flex-wrap justify-start sm:justify-end">
      {extraActions}
      {children}

      {(onFilterToggle || (activeFilterCount > 0 && onClearAllFilters)) && (
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
          className="h-8 w-8 px-0 shrink-0"
          onClick={onRefresh}
          disabled={loading}
          title={t("Tải lại")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      )}

      {onCreate && (!createActions || createActions.length === 0) && (
        <Button onClick={onCreate} className="h-8 px-3 shrink-0">
          {createIcon || <Plus className="h-4 w-4 mr-1" />}
          {t(createLabel)}
        </Button>
      )}

      {!onCreate && createActions && createActions.length > 0 && (
        <ActionDropdown
          items={createActions}
          align="end"
          customTrigger={
            <Button className="h-8 px-3 shrink-0">
              {createIcon}
              {t(createLabel)}
              <ChevronDown className="h-4 w-4 ml-1 opacity-70" />
            </Button>
          }
        />
      )}

      {onCreate && createActions && createActions.length > 0 && (
        <div className="flex items-center shrink-0">
          <Button
            onClick={onCreate}
            className="h-8 rounded-r-none px-3 border-r-0 focus:z-10"
          >
            {createIcon || <Plus className="h-4 w-4 mr-1" />}
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
