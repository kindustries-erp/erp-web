import React, { useMemo } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  ALL_GARAGE_CASHFLOW_EXPORT_COLUMNS,
  DEFAULT_GARAGE_CASHFLOW_EXPORT_COLUMNS,
  GARAGE_CASHFLOW_EXPORT_GROUPS,
  GARAGE_CASHFLOW_EXPORT_GROUP_KEYS,
  type GarageCashflowExportColumnItem,
  type GarageCashflowExportGroupKey,
} from "../GarageCashflowExportDrawer.columns.config";

import { GarageCashflowExportColumnActions } from "./GarageCashflowExportColumnActions";

export interface GarageCashflowExportColumnSelectorProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
  defaultCollapsed?: boolean;
}

export function GarageCashflowExportColumnSelector({
  selectedColumns,
  onChange,
  defaultCollapsed = true,
}: GarageCashflowExportColumnSelectorProps) {
  const columnsByGroup = useMemo(() => {
    const map: Record<
      GarageCashflowExportGroupKey,
      GarageCashflowExportColumnItem[]
    > = {
      general: [],
      amount: [],
      related: [],
    };
    for (const col of ALL_GARAGE_CASHFLOW_EXPORT_COLUMNS) {
      map[col.group].push(col);
    }
    return map;
  }, []);

  const handleSelectAll = () => {
    onChange(ALL_GARAGE_CASHFLOW_EXPORT_COLUMNS.map((c) => c.key));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const handleResetDefault = () => {
    onChange(DEFAULT_GARAGE_CASHFLOW_EXPORT_COLUMNS);
  };

  const handleToggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      onChange(selectedColumns.filter((k) => k !== key));
    } else {
      onChange([...selectedColumns, key]);
    }
  };

  const handleToggleGroup = (group: GarageCashflowExportGroupKey) => {
    const groupCols = columnsByGroup[group].map((c) => c.key);
    const allSelected = groupCols.every((k) => selectedColumns.includes(k));
    if (allSelected) {
      onChange(selectedColumns.filter((k) => !groupCols.includes(k)));
    } else {
      const merged = Array.from(new Set([...selectedColumns, ...groupCols]));
      onChange(merged);
    }
  };

  const totalCols = ALL_GARAGE_CASHFLOW_EXPORT_COLUMNS.length;
  const selectedCount = selectedColumns.length;

  return (
    <DrawerSection
      title={
        <div className="flex items-center gap-1.5">
          <span>CỘT XUẤT DỮ LIỆU</span>
          <span className="text-[11px] font-normal normal-case text-muted-foreground tracking-normal">
            ({selectedCount}/{totalCols})
          </span>
        </div>
      }
      titleExtra={
        <GarageCashflowExportColumnActions
          onSelectAll={handleSelectAll}
          onResetDefault={handleResetDefault}
          onDeselectAll={handleDeselectAll}
        />
      }
      collapsible
      defaultCollapsed={defaultCollapsed}
    >
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 pt-1">
        {GARAGE_CASHFLOW_EXPORT_GROUP_KEYS.map((group) => {
          const groupDef = GARAGE_CASHFLOW_EXPORT_GROUPS[group];
          const cols = columnsByGroup[group];
          const groupCols = cols.map((c) => c.key);
          const selectedInGroup = groupCols.filter((k) =>
            selectedColumns.includes(k),
          ).length;
          const isAllGroupSelected = selectedInGroup === groupCols.length;
          const isPartialGroup =
            selectedInGroup > 0 && selectedInGroup < groupCols.length;
          const groupLabel = groupDef.label;

          return (
            <div
              key={group}
              className="rounded border border-border/60 bg-muted/20 p-2 space-y-1.5"
            >
              <div
                className="flex items-center justify-between cursor-pointer select-none pb-1 border-b border-border/40"
                onClick={() => handleToggleGroup(group)}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      isAllGroupSelected
                        ? true
                        : isPartialGroup
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={() => handleToggleGroup(group)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={groupLabel}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {groupLabel}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {selectedInGroup}/{groupCols.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pt-0.5">
                {cols.map((col) => {
                  const isChecked = selectedColumns.includes(col.key);
                  return (
                    <label
                      key={col.key}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-0.5"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => handleToggleColumn(col.key)}
                        aria-label={col.defaultLabel}
                      />
                      <span className="truncate" title={col.defaultLabel}>
                        {col.defaultLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DrawerSection>
  );
}
