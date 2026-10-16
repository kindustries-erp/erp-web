import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/Button";
import {
  ALL_INVOICE_EXPORT_COLUMNS,
  type ExportColumnItem,
} from "../InvoiceExportDrawer.helper";

export interface InvoiceExportColumnSelectorProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
  onResetDefault: () => void;
  defaultCollapsed?: boolean;
}

const GROUP_KEYS = [
  "general",
  "partner",
  "amountTax",
  "operation",
  "netOff",
] as const;

export function InvoiceExportColumnSelector({
  selectedColumns,
  onChange,
  onResetDefault,
  defaultCollapsed = false,
}: InvoiceExportColumnSelectorProps) {
  const { t } = useTranslation("erpInvoices");

  const groupLabels: Record<(typeof GROUP_KEYS)[number], string> = useMemo(
    () => ({
      general: t("erpInvoices:exportDrawer.groupGeneral", "Thông tin chung"),
      partner: t("erpInvoices:exportDrawer.groupPartner", "Đối tác"),
      amountTax: t("erpInvoices:exportDrawer.groupAmountTax", "Số tiền & Thuế"),
      operation: t(
        "erpInvoices:exportDrawer.groupOperation",
        "Chi tiết nghiệp vụ",
      ),
      netOff: t("erpInvoices:exportDrawer.groupNetOff", "Cấn trừ & Thanh toán"),
    }),
    [t],
  );

  const columnsByGroup = useMemo(() => {
    const map: Record<(typeof GROUP_KEYS)[number], ExportColumnItem[]> = {
      general: [],
      partner: [],
      amountTax: [],
      operation: [],
      netOff: [],
    };
    for (const col of ALL_INVOICE_EXPORT_COLUMNS) {
      map[col.group].push(col);
    }
    return map;
  }, []);

  const handleSelectAll = () => {
    onChange(ALL_INVOICE_EXPORT_COLUMNS.map((c) => c.key));
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  const handleToggleColumn = (key: string) => {
    if (selectedColumns.includes(key)) {
      onChange(selectedColumns.filter((k) => k !== key));
    } else {
      onChange([...selectedColumns, key]);
    }
  };

  const handleToggleGroup = (group: (typeof GROUP_KEYS)[number]) => {
    const groupCols = columnsByGroup[group].map((c) => c.key);
    const allSelected = groupCols.every((k) => selectedColumns.includes(k));
    if (allSelected) {
      onChange(selectedColumns.filter((k) => !groupCols.includes(k)));
    } else {
      const merged = Array.from(new Set([...selectedColumns, ...groupCols]));
      onChange(merged);
    }
  };

  const totalCols = ALL_INVOICE_EXPORT_COLUMNS.length;
  const selectedCount = selectedColumns.length;

  return (
    <DrawerSection
      title={
        <div className="flex items-center justify-between w-full pr-2">
          <span>
            {t(
              "erpInvoices:exportDrawer.columnsSectionTitle",
              "Cột xuất dữ liệu",
            )}
          </span>
          <span className="text-xs font-normal text-muted-foreground">
            {t(
              "erpInvoices:exportDrawer.columnsSelectedCount",
              "Đã chọn {{count}}/{{total}} cột",
              {
                count: selectedCount,
                total: totalCols,
              },
            )}
          </span>
        </div>
      }
      collapsible
      defaultCollapsed={defaultCollapsed}
    >
      <div className="space-y-3 pt-1">
        {/* Quick action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pb-1 border-b border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleSelectAll}
          >
            {t("erpInvoices:exportDrawer.selectAllColumns", "Chọn tất cả")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={onResetDefault}
          >
            {t("erpInvoices:exportDrawer.defaultColumns", "Mặc định")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
            onClick={handleDeselectAll}
          >
            {t("erpInvoices:exportDrawer.deselectAllColumns", "Bỏ chọn")}
          </Button>
        </div>

        {/* Groups */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {GROUP_KEYS.map((group) => {
            const cols = columnsByGroup[group];
            const groupCols = cols.map((c) => c.key);
            const selectedInGroup = groupCols.filter((k) =>
              selectedColumns.includes(k),
            ).length;
            const isAllGroupSelected = selectedInGroup === groupCols.length;
            const isPartialGroup =
              selectedInGroup > 0 && selectedInGroup < groupCols.length;

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
                      aria-label={groupLabels[group]}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {groupLabels[group]}
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
      </div>
    </DrawerSection>
  );
}
