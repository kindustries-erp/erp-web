import React from "react";
import { Building2, Wallet, Upload } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import type { TabItem } from "@/shared/components/PageLayout";
import {
  useBankStatementsTabLogic,
  type UseBankStatementsTabLogicProps,
} from "./useBankStatementsTabLogic";
import { BankStatementViewModeCombobox } from "./components/BankStatementViewModeCombobox";
import { BankStatementViewConfigDrawer } from "./components/BankStatementViewConfigDrawer";
import { BankStatementDrawers } from "./components/BankStatementDrawers";
import { useBankStatementActions } from "./hooks/useBankStatementActions";
import { DEFAULT_BANK_COLUMN_VISIBILITY } from "./utils";

export interface BankStatementSectionProps extends UseBankStatementsTabLogicProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  instanceIndex?: 1 | 2;
}

export function BankStatementSection(props: BankStatementSectionProps) {
  const { type, tabs, activeTab, onTabChange } = props;
  const logic = useBankStatementsTabLogic(props);
  const {
    t,
    tableId,
    page,
    pageSize,
    setPage,
    setPageSize,
    activeTransactionType,
    handleTransactionTypeChange,
    columnViewPresetsHook,
    activeColumnPresetKey,
    handleColumnPresetChange,
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleOpenCreateView,
    handleOpenEditView,
    handleSaveViewPreset,
    handleResetViewPreset,
    handleDeleteViewPreset,
    currentColumnVisibility,
    branches,
    accountsData,
    filter,
    tableState,
    data,
    isFetching,
    columns,
    summaryRow,
    handleRefresh,
    handleClearAllFilters,
    isExportOpen,
    setIsExportOpen,
    isOriginalFilesOpen,
    setIsOriginalFilesOpen,
    isImportOpen,
    setIsImportOpen,
    isCreateOpen,
    setIsCreateOpen,
    detailTransactionId,
    setDetailTransactionId,
    detailDefaultTab,
    detailMode,
    handleOpenDetail,
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    selectedPartner,
    openCustomFieldsDrawer,
  } = logic;

  const { rowActions, createActions } = useBankStatementActions({
    type,
    t,
    handleOpenDetail,
    openCustomFieldsDrawer,
    setIsCreateOpen,
    setIsExportOpen,
    setIsOriginalFilesOpen,
  });

  const viewTabsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        size="sm"
        items={[
          {
            value: "ALL",
            label: t("bankStatement.tabs.all", { defaultValue: "Tất cả" }),
          },
          {
            value: "IN",
            label: t("bankStatement.tabs.in", { defaultValue: "Thu" }),
          },
          {
            value: "OUT",
            label: t("bankStatement.tabs.out", { defaultValue: "Chi" }),
          },
        ]}
        value={activeTransactionType}
        onValueChange={handleTransactionTypeChange}
      />
      <div className="hidden sm:block h-4 w-px bg-border shrink-0" />
      <BankStatementViewModeCombobox
        presets={columnViewPresetsHook.presets}
        activePresetKey={activeColumnPresetKey}
        onSelect={handleColumnPresetChange}
        onCreateView={handleOpenCreateView}
        onEditView={handleOpenEditView}
        onDeleteView={handleDeleteViewPreset}
      />
    </div>
  );

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          type === "bank"
            ? t("bankStatement.bankTitle", { defaultValue: "Sao kê ngân hàng" })
            : t("bankStatement.cashTitle", { defaultValue: "Sổ quỹ tiền mặt" })
        }
        desc={
          type === "bank"
            ? t("bankStatement.bankDesc", {
                defaultValue: "Quản lý các dòng giao dịch sao kê ngân hàng",
              })
            : t("bankStatement.cashDesc", {
                defaultValue: "Quản lý giao dịch thu chi sổ quỹ tiền mặt",
              })
        }
        icon={
          type === "bank" ? (
            <Building2 className="h-5 w-5" />
          ) : (
            <Wallet className="h-5 w-5" />
          )
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tableId={tableId}
        items={data?.items || []}
        columns={columns}
        getRowKey={(row: any) => row.id}
        summaryRow={summaryRow}
        loading={isFetching}
        emptyLabel={t("emptyData", { defaultValue: "Chưa có giao dịch nào." })}
        minWidth={1200}
        page={page}
        pageSize={pageSize}
        total={data?.total || 0}
        totalPages={data?.totalPages || 0}
        onPage={setPage}
        onPageSize={setPageSize}
        onRefresh={handleRefresh}
        activeFilterCount={tableState.activeFilterCount || 0}
        onClearAllFilters={handleClearAllFilters}
        sortArray={tableState.sorts}
        onSort={(colKey) => {
          const currentSort = tableState.sorts[0];
          const nextState =
            currentSort === colKey
              ? "desc"
              : currentSort === `-${colKey}`
                ? "none"
                : "asc";
          tableState.setSort(colKey, nextState);
          setPage(1);
        }}
        defaultColumnVisibility={DEFAULT_BANK_COLUMN_VISIBILITY}
        customActionsNode={viewTabsNode}
        rowActions={rowActions}
        onCreate={() => setIsImportOpen(true)}
        createLabel={t("bankStatement.importBtn", {
          defaultValue: "Nhập sao kê",
        })}
        createIcon={<Upload className="w-4 h-4 mr-1 text-primary-foreground" />}
        createActions={createActions}
      />

      <BankStatementDrawers
        type={type}
        branches={branches}
        accountsData={accountsData}
        isExportOpen={isExportOpen}
        setIsExportOpen={setIsExportOpen}
        isOriginalFilesOpen={isOriginalFilesOpen}
        setIsOriginalFilesOpen={setIsOriginalFilesOpen}
        isImportOpen={isImportOpen}
        setIsImportOpen={setIsImportOpen}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        detailTransactionId={detailTransactionId}
        setDetailTransactionId={setDetailTransactionId}
        detailDefaultTab={detailDefaultTab}
        detailMode={detailMode}
        partnerDrawerOpen={partnerDrawerOpen}
        setPartnerDrawerOpen={setPartnerDrawerOpen}
        selectedPartner={selectedPartner}
        dateFrom={filter.state.dateFrom}
        dateTo={filter.state.dateTo}
        branchId={filter.state.custom.branchId as string}
        onRefresh={handleRefresh}
      />

      <BankStatementViewConfigDrawer
        open={viewConfigDrawerOpen}
        onClose={() => setViewConfigDrawerOpen(false)}
        preset={editingViewPreset}
        currentColumnVisibility={currentColumnVisibility}
        onSave={handleSaveViewPreset}
        onResetDefault={handleResetViewPreset}
      />
    </>
  );
}
