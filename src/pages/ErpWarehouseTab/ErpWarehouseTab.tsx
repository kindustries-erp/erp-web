import { ReceiptText } from "lucide-react";
import { Forbidden } from "@/pages/Forbidden";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { InventoryVoucherDrawer } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherDrawer";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";

import { useErpWarehouseTabLogic } from "./useErpWarehouseTabLogic";
import { WarehouseModals } from "./components/WarehouseModals";
import { WarehousePrintSlot } from "./components/WarehousePrintSlot";
import { WarehouseViewConfigDrawer } from "./components/WarehouseViewConfigDrawer";

export function ErpWarehouseTab() {
  const {
    t,
    canReadReceipts,
    canReadIssues,
    canReadAdjustments,
    page,
    setPage,
    pageSize,
    setPageSize,
    loadError,
    rows,
    columns,
    summaryRow,
    loading,
    total,
    totalPages,
    tableState,
    unifiedDrawer,
    deleteTarget,
    setDeleteTarget,
    deleting,
    handleDeleteConfirm,
    cancelTarget,
    setCancelTarget,
    grCancelId,
    handleGrCancel,
    printGrRef,
    printGiRef,
    companyProfile,
    printGrData,
    printGiData,
    rowActions,
    createActions,
    vouchersQuery,
    customActionsNode,
    handleClearAllFilters,
    viewConfigDrawerOpen,
    setViewConfigDrawerOpen,
    editingViewPreset,
    handleSaveViewPreset,
    handleResetViewPreset,
    currentColumnVisibility,
  } = useErpWarehouseTabLogic();

  if (!canReadReceipts && !canReadIssues && !canReadAdjustments)
    return <Forbidden />;

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("inventory.tabVouchers")}
        desc={t("inventory.descVouchers")}
        icon={<ReceiptText className="h-5 w-5" />}
        tableId="inventory-vouchers-table"
        items={rows}
        columns={columns}
        getRowKey={(r) => `${r.type}-${r.id}`}
        getRowClassName={(row: WarehouseRow) => {
          const s = (row.status || "").toUpperCase();
          if (
            s === "CANCELLED" ||
            s === "CANCELED" ||
            s === "VOID" ||
            s.includes("HỦY")
          ) {
            return "opacity-40 text-muted-foreground";
          }
          return undefined;
        }}
        summaryRow={summaryRow}
        loading={loading}
        error={loadError}
        emptyLabel={t("Chưa có chứng từ kho.")}
        minWidth={1000}
        sortArray={tableState.sorts}
        onSort={(key) => {
          const current = tableState.sorts[0];
          if (current === key) {
            tableState.setSort(key, "desc");
          } else if (current === `-${key}`) {
            tableState.setSort(key, "none");
          } else {
            tableState.setSort(key, "asc");
          }
        }}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(v) => {
          setPage(1);
          setPageSize(v);
        }}
        onRefresh={() => void vouchersQuery.refetch()}
        activeFilterCount={tableState.activeFilterCount || 0}
        onClearAllFilters={handleClearAllFilters}
        customActionsNode={customActionsNode}
        rowActions={rowActions}
        onCreate={() => unifiedDrawer.openUnifiedCreate("receipt")}
        createLabel={t("Tạo mới")}
        createActions={createActions}
      />

      <WarehouseModals
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        deleting={deleting}
        onDeleteConfirm={handleDeleteConfirm}
        cancelTarget={cancelTarget}
        setCancelTarget={setCancelTarget}
        onCancelConfirm={() => {
          if (cancelTarget) {
            return handleGrCancel(cancelTarget.id);
          }
          return Promise.resolve();
        }}
        grCancelId={grCancelId}
      />

      <InventoryVoucherDrawer unifiedDrawer={unifiedDrawer} />

      <WarehousePrintSlot
        printGrRef={printGrRef}
        printGiRef={printGiRef}
        companyProfile={companyProfile}
        printGrData={printGrData}
        printGiData={printGiData}
      />

      <WarehouseViewConfigDrawer
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
