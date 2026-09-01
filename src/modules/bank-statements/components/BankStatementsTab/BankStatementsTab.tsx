import React, { useMemo } from "react";
import {
  Building2,
  Wallet,
  Upload,
  Plus,
  FileSpreadsheet,
  FolderArchive,
  Settings,
  Eye,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
import {
  useBankStatementsTabLogic,
  type UseBankStatementsTabLogicProps,
} from "./useBankStatementsTabLogic";
import { BankStatementViewModeCombobox } from "./components/BankStatementViewModeCombobox";
import { BankStatementViewConfigDrawer } from "./components/BankStatementViewConfigDrawer";
import { BankStatementDrawers } from "./components/BankStatementDrawers";
import { DEFAULT_BANK_COLUMN_VISIBILITY } from "./utils";

export type BankStatementsTabProps = UseBankStatementsTabLogicProps;

export function BankStatementsTab(props: BankStatementsTabProps) {
  const { type } = props;
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
    partnerDrawerOpen,
    setPartnerDrawerOpen,
    selectedPartner,
    openCustomFieldsDrawer,
  } = logic;

  // View Tabs (Switch Thu/Chi + View Mode Presets Combobox)
  const viewTabsNode = (
    <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
      <PillTabs
        className="w-full sm:w-auto shrink-0"
        listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
        triggerClassName="h-7 px-3.5 text-xs rounded-full"
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
        hideBorder
      />

      <div className="hidden sm:block h-4 w-px bg-slate-300/80 dark:bg-slate-700/80 shrink-0" />

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

  const rowActions = useMemo(
    () => (row: any) => [
      {
        groupLabel: t("groupTraCuu", { defaultValue: "Tra cứu" }),
        items: [
          {
            label: t("actionDetail", { defaultValue: "Chi tiết" }),
            icon: <Eye className="w-3.5 h-3.5" />,
            onClick: () => setDetailTransactionId(row.id),
          },
        ],
      },
      {
        groupLabel: t("groupCauHinh", { defaultValue: "Cấu hình" }),
        items: [
          {
            label: t("bankConfig.customFields", {
              defaultValue: "Cấu hình trường tùy chỉnh",
            }),
            icon: <Settings className="w-3.5 h-3.5 text-violet-500" />,
            onClick: () =>
              openCustomFieldsDrawer("BANK_TXN", "Sao kê ngân hàng"),
          },
        ],
      },
    ],
    [t, setDetailTransactionId, openCustomFieldsDrawer],
  );

  const createActions = useMemo(
    () => [
      {
        groupLabel: t("groupThaoTac", { defaultValue: "Thao tác" }),
        items: [
          ...(type === "cash"
            ? [
                {
                  label: t("bankStatement.createCash", {
                    defaultValue: "Tạo mới phiếu thu/chi",
                  }),
                  icon: <Plus className="w-4 h-4 text-emerald-600" />,
                  onClick: () => setIsCreateOpen(true),
                },
              ]
            : []),
          {
            label: t("bankStatement.exportExcel", {
              defaultValue: "Xuất Excel",
            }),
            icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
            onClick: () => setIsExportOpen(true),
          },
          {
            label: t("bankStatement.originalFiles", {
              defaultValue: "Quản lý file gốc",
            }),
            icon: <FolderArchive className="w-4 h-4 text-emerald-600" />,
            onClick: () => setIsOriginalFilesOpen(true),
          },
        ],
      },
      {
        groupLabel: t("groupCauHinh", { defaultValue: "Cấu hình" }),
        items: [
          {
            label: t("bankConfig.customFields", {
              defaultValue: "Cấu hình trường tùy chỉnh",
            }),
            icon: <Settings className="w-4 h-4 text-violet-500" />,
            onClick: () =>
              openCustomFieldsDrawer(
                "BANK_TXN",
                type === "bank" ? "Sao kê ngân hàng" : "Sổ quỹ tiền mặt",
              ),
          },
        ],
      },
    ],
    [
      t,
      type,
      setIsCreateOpen,
      setIsExportOpen,
      setIsOriginalFilesOpen,
      openCustomFieldsDrawer,
    ],
  );

  return (
    <>
      <SpreadsheetPageTemplate
        title={
          type === "bank"
            ? t("bankStatement.bankTitle", { defaultValue: "Sao kê ngân hàng" })
            : t("bankStatement.cashTitle", {
                defaultValue: "Sổ quỹ tiền mặt",
              })
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
        tableId={tableId}
        items={data?.items || []}
        columns={columns.map((c) => ({
          ...c,
          headerClassName: c.headerClassName
            ? `${c.headerClassName} text-center`
            : "text-center",
        }))}
        getRowKey={(row: any) => row.id}
        summaryRow={summaryRow}
        loading={isFetching}
        emptyLabel={t("emptyData", {
          defaultValue: "Chưa có giao dịch nào.",
        })}
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
        createIcon={<Upload className="w-4 h-4 mr-1 text-indigo-100" />}
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
