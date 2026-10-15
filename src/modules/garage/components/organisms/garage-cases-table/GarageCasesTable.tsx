import React, { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { FileText, DownloadCloud } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { GarageCaseViewModeCombobox } from "../../molecules/garage-case-view-mode-combobox";
import { buildGarageCasesColumns } from "./GarageCasesTable.columns";
import { useGarageCasesTable } from "./GarageCasesTable.hook";
import {
  buildCasesSummaryRow,
  getGarageCaseRowClassName,
} from "./GarageCasesTable.summary";
import {
  buildGarageCaseCreateActions,
  buildGarageCaseRowActions,
} from "./GarageCasesTable.actions";
import {
  DEFAULT_GARAGE_CASE_COLUMN_VISIBILITY,
  GARAGE_CASE_STATUS_TABS,
} from "../../../utils/garageCaseViewPresets";
import type { GarageCasesTableProps } from "./GarageCasesTable.type";

export function GarageCasesTable(props: GarageCasesTableProps) {
  const { t } = useTranslation("garage");
  const queryClient = useQueryClient();

  const translate = useCallback(
    (key: string, def?: string): string =>
      t(key, { defaultValue: def }) as string,
    [t],
  );

  const {
    tableState,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    visibleCases,
    profitCases,
    totals,
    isLoading,
    isFetching,
    refetch,
    activeFilterCount,
    handleSortChange,
    handleSearchChange,
    handleFilterChange,
    handleClearAllFilters,
    fetchCaseColumnOptions,
  } = useGarageCasesTable(props);

  const columns = useMemo(
    () =>
      buildGarageCasesColumns({
        t: translate,
        tableState,
        dateRanges: props.dateRanges,
        onDateRangeChange: props.onDateRangeChange,
        onSortChange: handleSortChange,
        onSearchChange: handleSearchChange,
        onFilterChange: handleFilterChange,
        fetchCaseColumnOptions,
        onOpenDetail: props.onOpenDetail,
        onOpenFinancials: props.onOpenFinancials,
        onOpenConfig: props.onOpenConfig,
        canUpdateGarage: props.canUpdateGarage,
        branches: props.branches,
        activeColumnPresetKey: props.activeColumnPresetKey,
        branchId: props.branchId,
      }),
    [
      translate,
      tableState,
      props.dateRanges,
      props.onDateRangeChange,
      handleSortChange,
      handleSearchChange,
      handleFilterChange,
      fetchCaseColumnOptions,
      props.onOpenDetail,
      props.onOpenFinancials,
      props.onOpenConfig,
      props.canUpdateGarage,
      props.branches,
      props.activeColumnPresetKey,
      props.branchId,
    ],
  );

  const totalLabelCol = useMemo(() => {
    const isHidden = props.columnViewPresetsHook?.isColumnHidden;
    const colVis = props.columnViewPresetsHook?.activePreset?.columnVisibility;
    const isCustVisible =
      typeof isHidden === "function"
        ? !isHidden("customer")
        : colVis?.customer !== false;
    if (isCustVisible) return "customer";
    const isCodeVisible =
      typeof isHidden === "function"
        ? !isHidden("caseCode")
        : colVis?.caseCode !== false;
    if (isCodeVisible) return "caseCode";
    return "customer";
  }, [props.columnViewPresetsHook]);

  const summaryRow = useMemo(
    () =>
      buildCasesSummaryRow({
        visibleCases,
        profitCases,
        totals,
        page,
        pageSize,
        totalCases: total,
        totalLabelCol,
        t: translate,
      }),
    [
      visibleCases,
      profitCases,
      totals,
      page,
      pageSize,
      total,
      totalLabelCol,
      translate,
    ],
  );

  const createActions = useMemo(
    () => buildGarageCaseCreateActions(props, translate),
    [props, translate],
  );

  const rowActions = useMemo(
    () => buildGarageCaseRowActions(props, translate),
    [props, translate],
  );

  const viewTabsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <GarageCaseViewModeCombobox
        presets={props.columnViewPresetsHook.presets}
        activePresetKey={props.activeColumnPresetKey}
        onSelect={props.onColumnPresetChange}
        onCreateView={props.onCreateViewPreset}
        onEditView={props.onEditViewPreset}
        onDeleteView={props.onDeleteViewPreset}
        filterGroup={{
          title: t("cases.statusGroup", { defaultValue: "Trạng thái phiếu" }),
          value: props.activeStatusTab,
          onChange: props.onStatusTabChange,
          items: GARAGE_CASE_STATUS_TABS.map((tab) => ({
            value: tab.value,
            label: t(tab.labelKey, { defaultValue: tab.defaultLabel }),
          })),
        }}
      />
    </div>
  );

  return (
    <SpreadsheetPageTemplate
      title={t("cases.title", "Phiếu dịch vụ")}
      desc={t("cases.desc", "Quản lý phiếu dịch vụ & sổ báo giá Garage")}
      icon={<FileText className="w-5 h-5 text-slate-700" />}
      tableId="garage-cases-table"
      tabs={props.tabs}
      activeTab={props.activeTab}
      onTabChange={props.onTabChange}
      items={visibleCases}
      columns={columns}
      defaultColumnVisibility={DEFAULT_GARAGE_CASE_COLUMN_VISIBILITY}
      getRowKey={(item: any) => item.id}
      getRowClassName={getGarageCaseRowClassName}
      loading={isLoading || isFetching}
      onRefresh={() => {
        refetch();
        queryClient.invalidateQueries({
          queryKey: ["garage", "grossProfitReport"],
        });
      }}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={handleClearAllFilters}
      summaryRow={summaryRow}
      createLabel={t("cases.actions.syncCases", "Đồng bộ")}
      createIcon={<DownloadCloud className="w-4 h-4 mr-1.5" />}
      onCreate={props.canSyncGarage ? props.onSyncCases : undefined}
      createActions={createActions}
      rowActions={rowActions}
      customActionsNode={viewTabsNode}
      containerClassName="max-h-[calc(100vh-220px)]"
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={Math.ceil(total / pageSize) || 1}
      onPage={(p) => setPage(p)}
      onPageSize={(s) => {
        setPageSize(s);
        setPage(1);
      }}
    />
  );
}
