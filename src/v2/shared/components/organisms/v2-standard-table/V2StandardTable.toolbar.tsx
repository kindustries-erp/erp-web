import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2ColumnToggle } from "@/v2/shared/components/molecules/v2-column-toggle";
import type { V2ColumnToggleProps } from "@/v2/shared/components/molecules/v2-column-toggle";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

interface V2TableToolbarProps {
  activeFilterCount: number;
  onClearAllFilters: () => void;
  selectedCount: number;
  toolbarExtra?: React.ReactNode;
  /** Bỏ trống ở mobile: không có tùy chỉnh cột */
  columnToggle?: V2ColumnToggleProps;
}

export const V2TableToolbar: React.FC<V2TableToolbarProps> = ({
  activeFilterCount,
  onClearAllFilters,
  selectedCount,
  toolbarExtra,
  columnToggle,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="flex min-h-8 flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {toolbarExtra}
        {selectedCount > 0 && (
          <span className="text-xs text-muted-fg">
            {t("v2.table.selectedCount", { count: selectedCount })}
          </span>
        )}
        {activeFilterCount > 0 && (
          <V2Button
            variant="destructive-outline"
            size="xs"
            onClick={onClearAllFilters}
          >
            {t("v2.table.clearAllFilters", { count: activeFilterCount })}
          </V2Button>
        )}
      </div>
      {columnToggle && <V2ColumnToggle {...columnToggle} />}
    </div>
  );
};
