import React, { useMemo, useCallback } from "react";
import { Plus, ReceiptText } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { createColumnHeaderFilter } from "@/shared/components/DataTable/createColumnHeaderFilter";
import type { GarageCashflowVoucher } from "../../../api/garageCashflowApi";
import type { GarageCashflowTableProps } from "./GarageCashflowTable.type";
import { useGarageCashflowTable } from "./GarageCashflowTable.hook";
import { useT } from "@/core/i18n";
import { getGarageCashflowColumns } from "./GarageCashflowTable.columns";
import {
  getGarageCashflowRowActions,
  buildGarageCashflowCreateActions,
} from "./GarageCashflowTable.actions";
import { buildGarageCashflowSummaryRow } from "./GarageCashflowTable.summary";
import { DEFAULT_GARAGE_CASHFLOW_COLUMN_VISIBILITY } from "../../../utils/garageViewPresets";
import { GarageViewModeCombobox } from "../../molecules/garage-view-mode-combobox";
import {
  useGarageCashflowPresets,
  useGarageCashflowFilterItems,
} from "./GarageCashflowTable.presets";

export { getGarageCashflowColumns } from "./GarageCashflowTable.columns";

export const GarageCashflowTable: React.FC<GarageCashflowTableProps> = ({
  tabs,
  activeTab,
  onTabChange,
  tabKey = "vouchers",
  onCreate,
  onView,
  onEdit,
  onDelete,
  onOpenCaseDetail,
  canDelete = true,
  onExportExcel,
}) => {
  const t = useT();
  const tableHook = useGarageCashflowTable({ tabKey });

  const {
    actualTableId,
    columnViewPresetsHook,
    activeColumnPresetKey,
    handleColumnPresetChange,
  } = useGarageCashflowPresets(tabKey);

  const filterItems = useGarageCashflowFilterItems(tabKey, t);

  const currentVoucherType = useMemo(() => {
    const filterVal = tableHook.columnFilters["voucherType"];
    return filterVal && filterVal.length > 0 ? filterVal[0] : "ALL";
  }, [tableHook.columnFilters]);

  const handleVoucherTypeChange = useCallback(
    (val: string) => {
      tableHook.setColumnFilter("voucherType", val === "ALL" ? [] : [val]);
    },
    [tableHook],
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
          title: t("garage.cashflow.filterGroup", "Loại phiếu"),
          value: currentVoucherType,
          onChange: handleVoucherTypeChange,
          items: filterItems,
        }}
      />
    </div>
  );

  const filterBuilder = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook as any,
        fetchOptions: tableHook.getColumnOptions,
        queryKeyPrefix: `garage-cashflow-options-${tabKey}`,
      }),
    [tableHook, tabKey],
  );

  const openDetail = useCallback(
    (row: GarageCashflowVoucher, mode: "view" | "edit") => {
      if (mode === "view" && onView) onView(row);
      if (mode === "edit" && onEdit) onEdit(row);
    },
    [onView, onEdit],
  );

  const columns = useMemo(
    () =>
      getGarageCashflowColumns(
        filterBuilder,
        openDetail,
        onOpenCaseDetail,
        tableHook,
        tabKey,
        t,
      ),
    [filterBuilder, openDetail, onOpenCaseDetail, tableHook, tabKey, t],
  );

  const rowActions = useMemo(
    () =>
      getGarageCashflowRowActions(
        openDetail,
        canDelete ? onDelete : undefined,
        Boolean(onEdit),
        canDelete,
        t,
      ),
    [openDetail, onDelete, onEdit, canDelete, t],
  );

  const createActions = useMemo(
    () => buildGarageCashflowCreateActions(onExportExcel, tableHook, t),
    [onExportExcel, tableHook, t],
  );

  const summaryRow = useMemo(
    () =>
      buildGarageCashflowSummaryRow({
        items: tableHook.data,
        totals: tableHook.totals,
        page: tableHook.page,
        pageSize: tableHook.pageSize,
        total: tableHook.total,
        totalPages: tableHook.totalPages,
        tabKey,
        t,
      }),
    [
      tableHook.data,
      tableHook.totals,
      tableHook.page,
      tableHook.pageSize,
      tableHook.total,
      tableHook.totalPages,
      tabKey,
      t,
    ],
  );

  const pageTitle =
    tabKey === "forecast"
      ? t("garage.cashflow.forecastTitle", "Dự thu chi garage")
      : t("nav.items.garageCashflow", "Thu chi garage");

  const pageDesc =
    tabKey === "forecast"
      ? t(
          "garage.cashflow.forecastDesc",
          "Quản lý các khoản dự thu và dự chi tại xưởng",
        )
      : t(
          "garage.cashflow.desc",
          "Quản lý Thu/Chi nội bộ tại xưởng và đối soát với dòng tiền ERP",
        );

  return (
    <SpreadsheetPageTemplate
      title={pageTitle}
      desc={pageDesc}
      icon={<ReceiptText className="w-5 h-5 text-slate-700" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tableId={actualTableId}
      columns={columns}
      defaultColumnVisibility={DEFAULT_GARAGE_CASHFLOW_COLUMN_VISIBILITY}
      customActionsNode={viewTabsNode}
      summaryRow={summaryRow}
      items={tableHook.data}
      total={tableHook.total}
      totalPages={tableHook.totalPages}
      page={tableHook.page}
      pageSize={tableHook.pageSize}
      onPage={tableHook.setPage}
      onPageSize={tableHook.setPageSize}
      loading={tableHook.isLoading}
      onRefresh={tableHook.refetch}
      getRowKey={(row) => row.id}
      listHook={tableHook as any}
      activeFilterCount={tableHook.activeFilterCount}
      onClearAllFilters={tableHook.clearAllFilters}
      sortArray={tableHook.sorts.length > 0 ? tableHook.sorts : undefined}
      onSort={tableHook.toggleSort}
      rowActions={rowActions}
      onCreate={onCreate}
      createLabel={
        tabKey === "forecast"
          ? t("garage.cashflow.createForecast", "Tạo dự thu/chi mới")
          : t("garage.cashflow.createVoucher", "Tạo phiếu mới")
      }
      createIcon={<Plus className="w-4 h-4 mr-1 text-primary-foreground" />}
      createActions={createActions}
    />
  );
};
