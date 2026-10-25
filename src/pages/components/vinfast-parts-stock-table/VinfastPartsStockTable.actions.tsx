import React, { useMemo, useCallback } from "react";
import type { TFunction } from "i18next";
import { Download, Eye } from "lucide-react";
import { ViewModeCombobox } from "@/shared/components/ViewModeCombobox";
import type { TableViewPreset } from "@/shared/hooks/useUserPreferences";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type {
  VehicleStockType,
  VinfastPartsStockRow,
} from "./VinfastPartsStockTable.type";
import type { VinfastStockTab } from "@/pages/hooks/useVinfastPartsStockStore";

interface UseVinfastStockActionsParams {
  t: TFunction;
  vehicleType: VehicleStockType;
  stockTab: VinfastStockTab;
  setStockTab: (vehicleType: VehicleStockType, val: VinfastStockTab) => void;
  onSelectSku: (sku: string, row: VinfastPartsStockRow) => void;
  onOpenSync: () => void;
  onOpenExport: () => void;
  presets?: TableViewPreset[];
  activePresetKey?: string;
  onSelectPreset?: (preset: TableViewPreset) => void;
  onCreateView?: () => void;
  onEditView?: (preset: TableViewPreset) => void;
  onDeleteView?: (key: string) => void;
}

export function useVinfastPartsStockActions({
  t,
  vehicleType,
  stockTab,
  setStockTab,
  onSelectSku,
  onOpenExport,
  presets,
  activePresetKey,
  onSelectPreset,
  onCreateView,
  onEditView,
  onDeleteView,
}: UseVinfastStockActionsParams) {
  const getRowActions = useCallback(
    (row: VinfastPartsStockRow): ActionDropdownItem[] => [
      {
        groupLabel: t("vinfastParts:SEARCH", "TRA CỨU"),
        items: [
          {
            label: t("vinfastParts:VIEW_DETAILS", "Xem chi tiết"),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => {
              onSelectSku(row.sku, row);
            },
          },
        ],
      },
    ],
    [t, onSelectSku],
  );

  const defaultPresets = useMemo<TableViewPreset[]>(
    () => [
      {
        key: "overview",
        label: t("vinfastParts:OVERVIEW_VIEW", "Tổng quan"),
        filters: {},
        columnVisibility: {},
      },
    ],
    [t],
  );

  const customActionsNode = useMemo(
    () => (
      <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
        <ViewModeCombobox<VinfastStockTab>
          presets={presets && presets.length > 0 ? presets : defaultPresets}
          activePresetKey={activePresetKey || "overview"}
          onSelect={onSelectPreset || (() => {})}
          onCreateView={onCreateView || (() => {})}
          onEditView={onEditView || (() => {})}
          onDeleteView={onDeleteView || (() => {})}
          filterGroup={{
            title: t("vinfastParts:STOCK_STATUS", "Trạng thái tồn kho"),
            value: stockTab,
            onChange: (val) => setStockTab(vehicleType, val),
            items: [
              { value: "ALL", label: t("vinfastParts:ALL", "Tất cả") },
              {
                value: "IN_STOCK",
                label: t("vinfastParts:IN_STOCK", "Còn tồn kho"),
                dotColor: "emerald",
              },
              {
                value: "OUT_OF_STOCK",
                label: t("vinfastParts:OUT_OF_STOCK", "Hết hàng"),
                dotColor: "amber",
              },
              {
                value: "NEGATIVE",
                label: t("vinfastParts:NEGATIVE_STOCK", "Tồn âm"),
                dotColor: "rose",
              },
            ],
          }}
        />
      </div>
    ),
    [
      presets,
      defaultPresets,
      activePresetKey,
      onSelectPreset,
      onCreateView,
      onEditView,
      onDeleteView,
      t,
      stockTab,
      vehicleType,
      setStockTab,
    ],
  );

  // Nút chính là "Đồng bộ" (onOpenSync); menu chỉ còn các thao tác phụ, giống trang hóa đơn
  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("vinfastParts:SEARCH", "TRA CỨU"),
        items: [
          {
            label: t("vinfastParts:EXPORT_EXCEL", "Xuất Excel"),
            icon: <Download className="w-4 h-4 text-green-600" />,
            onClick: onOpenExport,
          },
        ],
      },
    ],
    [t, onOpenExport],
  );

  return {
    getRowActions,
    customActionsNode,
    createActions,
  };
}
