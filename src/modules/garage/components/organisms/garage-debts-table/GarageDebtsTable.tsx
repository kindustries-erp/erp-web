import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useGarageStore } from "@/modules/garage/store/garageStore";
import { useGarageCustomersList } from "@/modules/garage/hooks/useGarageCustomersList";
import { Users, Eye, FileSpreadsheet, DownloadCloud } from "lucide-react";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type {
  GarageDebtsTableProps,
  CustomerDebtItem,
} from "./GarageDebtsTable.type";
import { useGarageDebtsColumns } from "./GarageDebtsTable.columns";
import { useGarageDebtsSummaryRow } from "./GarageDebtsTable.summary";
import { buildGarageDebtsExportContext } from "@/modules/garage/export/garageDebtsExportContext";
import { usePageViewPresets } from "@/shared/hooks/usePageViewPresets";
import {
  useUserPreferencesStore,
  type TableViewPreset,
} from "@/shared/hooks/useUserPreferences";
import {
  GARAGE_RECEIVABLES_COLUMN_VIEW_PRESETS,
  DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY,
  GARAGE_DEBT_FILTER_ITEMS,
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
        preset.columnVisibility || DEFAULT_GARAGE_RECEIVABLES_COLUMN_VISIBILITY,
      activeView: preset.key,
    });
  };

  const [activeDebtFilter, setActiveDebtFilter] = useState<string>("ALL");

  const handleDebtFilterChange = useCallback(
    (val: string) => {
      setActiveDebtFilter(val);
      if (val === "ALL") {
        listHook.setColumnFilter("paymentProgress", []);
        listHook.setColumnFilter("maxAgingDays", []);
      } else if (val === "HAS_DEBT") {
        listHook.setColumnFilter("paymentProgress", ["PARTIAL", "UNPAID"]);
        listHook.setColumnFilter("maxAgingDays", []);
      } else {
        listHook.setColumnFilter("paymentProgress", []);
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

  const createActions = useMemo<ActionDropdownItem[]>(
    () => [
      {
        groupLabel: t("debts.actions.exportGroup", "Báo cáo & Xuất file"),
        items: [
          {
            label: t("debts.exportDetailed", "Xuất Excel theo kỳ / Nâng cao"),
            icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
            onClick: handleOpenExport,
          },
        ],
      },
      ...(canSyncGarage && onSyncCases
        ? [
            {
              groupLabel: t("cases.actions.syncOptions", "Tùy chọn đồng bộ"),
              items: [
                {
                  label: t("cases.actions.syncCases", "Đồng bộ phiếu dịch vụ"),
                  icon: <DownloadCloud className="w-4 h-4 text-blue-600" />,
                  onClick: onSyncCases,
                },
              ],
            },
          ]
        : []),
    ],
    [canSyncGarage, onSyncCases, handleOpenExport, t],
  );

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
      rowActions={(row: CustomerDebtItem) => [
        {
          groupLabel: "TRA CỨU",
          items: [
            {
              label: t("customers.viewDetail", "Xem chi tiết công nợ"),
              icon: <Eye className="w-4 h-4" />,
              onClick: () =>
                onOpenCustomerDetail({
                  code: row.customerCode,
                  name: row.customerName,
                  licensePlate: row.licensePlate,
                }),
            },
          ],
        },
      ]}
      summaryRow={summaryRow}
    />
  );
};
