import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageCustomersList } from "@/modules/garage/hooks/useGarageCustomersList";
import { Users, FileSpreadsheet } from "lucide-react";
import type {
  GarageDebtsTableProps,
  CustomerDebtItem,
} from "./GarageDebtsTable.type";
import { useGarageDebtsColumns } from "./GarageDebtsTable.columns";
import { useGarageDebtsSummaryRow } from "./GarageDebtsTable.summary";
import { useGarageDebtsActions } from "./GarageDebtsTable.actions";
import { buildGarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  GARAGE_RECEIVABLES_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY,
  GARAGE_RECEIVABLE_AGING_FILTER_ITEMS,
} from "@/modules/garage/utils/garageViewPresets";
import { GarageViewModeCombobox } from "@/modules/garage/components/molecules/garage-view-mode-combobox";

const columnPresetsTableId = "garage-debts-column-views";
const actualTableId = "garage-debts-table";

export const GarageDebtsTable: React.FC<GarageDebtsTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onOpenCustomerDetail,
  onOpenExportDrawer,
  canSyncGarage,
  onSyncCases,
  onCreateCashflow,
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageCustomersList(selectedBranchId || undefined);

  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: GARAGE_RECEIVABLES_COLUMN_VIEW_PRESETS,
  });

  const [activeColumnPresetKey, setActiveColumnPresetKey] = useState<string>(
    () => {
      const stored = useUserPreferencesStore
        .getState()
        .getTablePreference(actualTableId);
      return stored?.activeView || "overview";
    },
  );

  const handleColumnPresetChange = (preset: TableViewPreset) => {
    setActiveColumnPresetKey(preset.key);
    const pref = useUserPreferencesStore
      .getState()
      .getTablePreference(actualTableId);
    useUserPreferencesStore.getState().setTablePreferences(actualTableId, {
      columnOrder: [],
      columnVisibility:
        preset.columnVisibility || DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY,
      activeView: preset.key,
      ...pref,
    });
  };

  const [activeDebtFilter, setActiveDebtFilter] = useState<string>("ALL");

  const handleDebtFilterChange = useCallback(
    (val: string) => {
      setActiveDebtFilter(val);
      if (val === "ALL") {
        listHook.setColumnFilter("paymentProgress", []);
        listHook.setColumnFilter("agingBucket", []);
      } else if (val === "HAS_DEBT") {
        listHook.setColumnFilter("paymentProgress", ["PARTIAL", "UNPAID"]);
        listHook.setColumnFilter("agingBucket", []);
      } else {
        listHook.setColumnFilter("paymentProgress", []);
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
          items: GARAGE_RECEIVABLE_AGING_FILTER_ITEMS.map((item) => ({
            value: item.value,
            label: item.label,
            dotColor: item.dotColor,
          })),
        }}
      />
    </div>
  );

  const columns = useGarageDebtsColumns({
    listHook,
    selectedBranchId,
    t,
    onOpenCustomerDetail,
  });

  const summaryRow = useGarageDebtsSummaryRow({ listHook, t });

  const handleOpenExport = useCallback(() => {
    onOpenExportDrawer(buildGarageDebtsExportContext("customers", listHook));
  }, [listHook, onOpenExportDrawer]);

  const { createActions, getRowActions } = useGarageDebtsActions({
    t,
    canSyncGarage,
    onSyncCases,
    onOpenExport: handleOpenExport,
    onOpenCustomerDetail,
    onCreateCashflow,
  });

  return (
    <SpreadsheetPageTemplate<CustomerDebtItem>
      title={t("partners.title", "Công nợ garage")}
      desc={t(
        "partners.desc",
        "Theo dõi, đối soát và phân tích tổng hợp công nợ phải thu, tuổi nợ và danh sách phiếu dịch vụ theo từng khách hàng Garage (Dữ liệu công nợ ghi nhận từ tháng 07/2026)",
      )}
      icon={<Users className="w-5 h-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId="garage-debts-table"
      defaultColumnVisibility={DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY}
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
      emptyLabel={t("customers.empty", "Không có dữ liệu khách hàng")}
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
