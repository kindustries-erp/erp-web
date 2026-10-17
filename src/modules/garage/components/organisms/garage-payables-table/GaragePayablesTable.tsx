import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageSuppliersList } from "@/modules/garage/hooks/useGarageSuppliersList";
import { Truck, Eye, FileSpreadsheet } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type {
  GaragePayablesTableProps,
  SupplierDebtItem,
} from "./GaragePayablesTable.type";
import { useGaragePayablesColumns } from "./GaragePayablesTable.columns";
import { useGaragePayablesSummaryRow } from "./GaragePayablesTable.summary";
import { buildGarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  GARAGE_PAYABLES_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY,
  GARAGE_DEBT_FILTER_ITEMS,
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
}) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageSuppliersList(selectedBranchId || undefined);

  const columnViewPresetsHook = usePageViewPresets({
    tableId: columnPresetsTableId,
    defaultPresets: GARAGE_PAYABLES_COLUMN_VIEW_PRESETS,
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
    const currentPref = useUserPreferencesStore
      .getState()
      .getTablePreference(actualTableId) || {
      columnOrder: [],
      columnVisibility: {},
    };
    useUserPreferencesStore.getState().setTablePreferences(actualTableId, {
      ...currentPref,
      columnOrder: [],
      columnVisibility:
        preset.columnVisibility || DEFAULT_GARAGE_PAYABLES_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
  };

  const [activeDebtFilter, setActiveDebtFilter] = useState<string>("ALL");

  const handleDebtFilterChange = useCallback(
    (val: string) => {
      setActiveDebtFilter(val);
      if (val === "ALL") {
        listHook.setColumnFilter("balanceAmount", []);
        listHook.setColumnFilter("maxAgingDays", []);
      } else if (val === "HAS_DEBT") {
        listHook.setColumnFilter("balanceAmount", [
          "0-10m",
          "10m-20m",
          "20m-50m",
          ">50m",
        ]);
        listHook.setColumnFilter("maxAgingDays", []);
      } else {
        listHook.setColumnFilter("balanceAmount", []);
        listHook.setColumnFilter("maxAgingDays", [val]);
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
          items: GARAGE_DEBT_FILTER_ITEMS.map((item) => ({
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

  const handleOpenDetail = useCallback(
    (row: SupplierDebtItem) => {
      if (onOpenCustomerDetail) {
        onOpenCustomerDetail({
          code: row.customerCode,
          name: row.customerName,
          debtType: "payables",
        });
      } else if (onOpenSupplierDetail) {
        onOpenSupplierDetail({
          id: row.id,
          code: row.customerCode,
          name: row.customerName,
        });
      }
    },
    [onOpenCustomerDetail, onOpenSupplierDetail],
  );

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("common:search", "Tra cứu"),
        items: [
          {
            label: t("debts.exportDetailed", "Xuất Excel theo kỳ / Nâng cao"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: handleOpenExport,
          },
        ],
      },
    ],
    [handleOpenExport, t],
  );

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
      rowActions={(row: SupplierDebtItem) => [
        {
          groupLabel: t("common:search", "TRA CỨU"),
          items: [
            {
              label: t(
                "customers.actions.viewDetail",
                "Xem chi tiết khách hàng",
              ),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleOpenDetail(row),
            },
          ],
        },
      ]}
      summaryRow={summaryRow}
    />
  );
};
