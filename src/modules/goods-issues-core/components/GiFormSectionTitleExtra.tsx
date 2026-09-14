import { useCallback } from "react";
import { Button } from "@/shared/components/ui/Button";
import { FilterButton } from "@/shared/components/FilterPanel";
import { setPortalTarget } from "@/shared/components/portalStore";

interface GiFormSectionTitleExtraProps {
  activeFilterCount: number;
  onResetFilters: () => void;
  canAddLine: boolean;
  onAddLine: () => void;
  onOpenImport: () => void;
  tableId?: string;
  t: (key: string, ...args: any[]) => string;
}

export function GiFormSectionTitleExtra({
  activeFilterCount,
  onResetFilters,
  canAddLine,
  onAddLine,
  onOpenImport,
  tableId = "gi-details-table",
  t,
}: GiFormSectionTitleExtraProps) {
  const portalRefCallback = useCallback(
    (el: Element | null) => {
      setPortalTarget(tableId, el);
    },
    [tableId],
  );

  const clearFilterBtn =
    activeFilterCount > 0 ? (
      <FilterButton
        activeCount={activeFilterCount}
        onClick={() => {}}
        onClear={onResetFilters}
      />
    ) : null;

  return (
    <div className="flex items-center gap-2">
      {clearFilterBtn}
      <div
        ref={portalRefCallback}
        className="empty:hidden flex items-center justify-center"
      />
      {canAddLine && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={onAddLine}
          >
            + {t("Thêm dòng")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={onOpenImport}
          >
            {t("Nhập từ Excel")}
          </Button>
        </>
      )}
    </div>
  );
}
