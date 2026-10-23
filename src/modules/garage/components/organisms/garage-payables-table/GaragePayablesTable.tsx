import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageSuppliersList } from "@/modules/garage/hooks/useGarageSuppliersList";
import { Truck, FileSpreadsheet } from "lucide-react";
import type {
  GaragePayablesTableProps,
  SupplierDebtItem,
} from "./GaragePayablesTable.type";
import { useGaragePayablesColumns } from "./GaragePayablesTable.columns";
import { useGaragePayablesSummaryRow } from "./GaragePayablesTable.summary";
import { useGaragePayablesActions } from "./GaragePayablesTable.actions";
import { buildGarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  GARAGE_PAYABLES_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY,
  GARAGE_PAYABLE_AGING_FILTER_ITEMS,
} from "@/modules/garage/utils/garageViewPresets";
import { GarageViewModeCombobox } from "@/modules/garage/components/molecules/garage-view-mode-combobox";

const columnPresetsTableId = "garage-payables-column-views";
const actualTableId = "garage-payables-table";

export const GaragePayablesTable: React.FC<GaragePayablesTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCustomerDetail,
  onOpenSupplierDetail,
  onOpenExportDrawer,
  canSyncGarage,
  onSyncCases,
  onCreateCashflow,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageSuppliersList(selectedBranchId || undefined);

  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: GARAGE_PAYABLES_COLUMN_VIEW_PRESETS,
  });

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () =>
      useUserPreferencesStore.getState().getTablePreference(actualTableId)
        ?.activeView || "overview",
  );

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);
    const pref = useUserPreferencesStore
      .getState()
      .getTablePreference(actualTableId);
    useUserPreferencesStore.getState().setTablePreferences(actualTableId, {
      columnOrder: [],
      columnVisibility:
        preset.columnVisibility || DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY,
      activeView: preset.key,
      ...pref,
    });
  };

  const [activeDebtFilter, setActiveDebtFilter] = useState<string>("ALL");

  const handleDebtFilterChange = useCallback(
    (val: string) => {
      setActiveDebtFilter(val);
      if (val === "ALL") {
        listHook.setColumnFilter("balanceAmount", []);
        listHook.setColumnFilter("agingBucket", []);
      } else if (val === "HAS_DEBT") {
        listHook.setColumnFilter("balanceAmount", [
          "0-10m",
          "10m-20m",
          "20m-50m",
          ">50m",
        ]);
        listHook.setColumnFilter("agingBucket", []);
      } else {
        listHook.setColumnFilter("balanceAmount", []);
        listHook.setColumnFilter("agingBucket", [val]);
      }
    },
    [listHook],
  );

  const viewTabsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <GarageViewModeCombobox
        presets={columnViewPresetsHook.presets}
        activePresetKey={activeColumnPresetKey}
        onSelect={handleColumnPresetChange}
        onCreateView={() => {}}
        onEditView={() => {}}
        onDeleteView={(key) => columnViewPresetsHook.deleteView(key)}
        filterGroup={{
          title: t("debts.filterGroup", { defaultValue: "Trạng thái nợ" }),
          value: activeDebtFilter,
          onChange: handleDebtFilterChange,
          items: GARAGE_PAYABLE_AGING_FILTER_ITEMS.map((item) => ({
            value: item.value,
            label: item.label,
            dotColor: item.dotColor,
          })),
        }}
      />
    </div>
  );

  const columns = useGaragePayablesColumns({
    listHook,
    selectedBranchId,
    t,
    onOpenCustomerDetail,
    onOpenSupplierDetail,
  });

  const summaryRow = useGaragePayablesSummaryRow({ listHook, t });

  const handleOpenExport = useCallback(() => {
    onOpenExportDrawer(buildGarageDebtsExportContext("suppliers", listHook));
  }, [listHook, onOpenExportDrawer]);

  const { createActions, getRowActions } = useGaragePayablesActions({
    t,
    canSyncGarage,
    onSyncCases,
    onOpenExport: handleOpenExport,
    onOpenCustomerDetail,
    onOpenSupplierDetail,
    onCreateCashflow,
  });

  return (
    <SpreadsheetPageTemplate<SupplierDebtItem>
      title={t("payables.titleGrouped", "Công nợ phải trả theo biển số xe")}
      desc={t(
        "payables.descGrouped",
        "Theo dõi, đối soát và phân tích chi phí sổ báo giá theo từng biển số xe, phân tầng 4 mốc tuổi nợ phải chi (Dữ liệu ghi nhận từ tháng 07/2026)",
      )}
      icon={<Truck className="w-5 h-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId="garage-payables-table"
      defaultColumnVisibility={DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY}
      customActionsNode={viewTabsNode}
      createLabel={t("debts.exportExcel", "Xuất Excel")}
      createIcon={
        <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-600" />
      }
      onCreate={handleOpenExport}
      createActions={createActions}
      items={listHook.data}
      columns={columns}
      getRowKey={(row) =>
        `${row.licensePlate || "no_bks"}_${row.customerCode}_${row.branchExternalId || "all"}`
      }
      loading={listHook.isLoading}
      emptyLabel={t("payables.empty", "Không có dữ liệu công nợ phải trả")}
      page={listHook.page}
      pageSize={listHook.pageSize}
      total={listHook.total}
      totalPages={listHook.totalPages}
      onPage={(p) => listHook.setPage(p)}
      onPageSize={(s) => {
        listHook.setPageSize(s);
        listHook.setPage(1);
      }}
      onRefresh={() => listHook.refetch()}
      activeFilterCount={listHook.activeFilterCount}
      onClearAllFilters={() => {
        listHook.clearAllFilters();
        setActiveDebtFilter("ALL");
      }}
      rowActions={getRowActions}
      summaryRow={summaryRow}
    />
  );
};
