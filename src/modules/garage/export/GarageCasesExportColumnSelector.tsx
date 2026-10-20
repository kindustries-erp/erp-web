import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  ALL_GARAGE_CASES_EXPORT_COLUMNS,
  DEFAULT_GARAGE_CASES_EXPORT_COLUMNS,
  GARAGE_CASES_EXPORT_GROUP_KEYS,
  type GarageCasesExportColumnItem,
  type GarageCasesExportGroupKey,
} from "./garageCasesExportColumns";
import { GarageCasesExportColumnActions } from "./GarageCasesExportColumnActions";

export interface GarageCasesExportColumnSelectorProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
  defaultCollapsed?: boolean;
}

/** Chọn cột xuất của bảng kê phiếu dịch vụ, theo nhóm có checkbox gộp. */
export function GarageCasesExportColumnSelector({
  selectedColumns,
  onChange,
  defaultCollapsed = true,
}: GarageCasesExportColumnSelectorProps) {
  const { t } = useTranslation("garage");

  const columnsByGroup = useMemo(() => {
    const map: Record<
      GarageCasesExportGroupKey,
      GarageCasesExportColumnItem[]
    > = {
      general: [],
      receivable: [],
      payable: [],
      profit: [],
      system: [],
    };
    for (const col of ALL_GARAGE_CASES_EXPORT_COLUMNS) {
      map[col.group].push(col);
    }
    return map;
  }, []);

  const totalCols = ALL_GARAGE_CASES_EXPORT_COLUMNS.length;
  const selectedSet = new Set(selectedColumns);

  const handleToggleColumn = (key: string) => {
    onChange(
      selectedSet.has(key)
        ? selectedColumns.filter((k) => k !== key)
        : [...selectedColumns, key],
    );
  };

  const handleToggleGroup = (group: GarageCasesExportGroupKey) => {
    const groupKeys = columnsByGroup[group].map((c) => c.key);
    const allSelected = groupKeys.every((k) => selectedSet.has(k));
    onChange(
      allSelected
        ? selectedColumns.filter((k) => !groupKeys.includes(k))
        : Array.from(new Set([...selectedColumns, ...groupKeys])),
    );
  };

  return (
    <DrawerSection
      title={
        <div className="flex items-center gap-1.5">
          <span>
            {t("exportReport.casesColumns.title", "CỘT XUẤT DỮ LIỆU")}
          </span>
          <span className="text-[11px] font-normal normal-case text-muted-foreground tracking-normal">
            ({selectedColumns.length}/{totalCols})
          </span>
        </div>
      }
      titleExtra={
        <GarageCasesExportColumnActions
          onSelectAll={() =>
            onChange(ALL_GARAGE_CASES_EXPORT_COLUMNS.map((c) => c.key))
          }
          onResetDefault={() => onChange(DEFAULT_GARAGE_CASES_EXPORT_COLUMNS)}
          onDeselectAll={() => onChange([])}
        />
      }
      collapsible
      defaultCollapsed={defaultCollapsed}
    >
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 pt-1">
        {GARAGE_CASES_EXPORT_GROUP_KEYS.map((group) => {
          const cols = columnsByGroup[group];
          const selectedInGroup = cols.filter((c) =>
            selectedSet.has(c.key),
          ).length;
          const isAll = selectedInGroup === cols.length;
          const isPartial = selectedInGroup > 0 && !isAll;
          const groupLabel = t(`exportReport.casesColumns.groups.${group}`);

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
                    checked={isAll ? true : isPartial ? "indeterminate" : false}
                    onCheckedChange={() => handleToggleGroup(group)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={groupLabel}
                  />
                  <span className="text-xs font-semibold text-foreground">
                    {groupLabel}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {selectedInGroup}/{cols.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pt-0.5">
                {cols.map((col) => {
                  const label = t(
                    `exportReport.casesColumns.columns.${col.key}`,
                    col.defaultLabel,
                  );
                  return (
                    <label
                      key={col.key}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none py-0.5"
                    >
                      <Checkbox
                        checked={selectedSet.has(col.key)}
                        onCheckedChange={() => handleToggleColumn(col.key)}
                        aria-label={label}
                      />
                      <span className="truncate" title={label}>
                        {label}
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
