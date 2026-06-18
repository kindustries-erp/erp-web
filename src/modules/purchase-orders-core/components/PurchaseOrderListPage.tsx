import { FileText } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { useT } from "@/core/i18n";
import { PurchaseOrderTable } from "./PurchaseOrderTable";
import { PurchaseOrderDrawer } from "./PurchaseOrderDrawer";
import { usePurchaseOrderPage } from "../hooks/usePurchaseOrderPage";
import { SettlementDrawer } from "@/modules/operational/components/list/SettlementDrawer";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";

export function PurchaseOrderListPage() {
  const t = useT();
  const pageState = usePurchaseOrderPage();
  const {
    listData,
    formOpen,
    formLoading,
    viewOnly,
    editingRow,
    poReceipts,
    pageError,
    openDetail,
    openPostingDrawer,
    openSettlement,
    closeSettlement,
    saveSettlement,
    removePaymentLink,
    handleCreateNew,
    handleCloseForm,
    handleToggleEdit,
    handleFormSaved,
  } = pageState;

  const {
    filter,
    filterConfig,
    listQuery,
    page,
    pageSize,
    setPage,
    setPageSize,
    purchaseSort,
    togglePurchaseSort,
    expandedRowIds,
    toggleExpandRow,
  } = listData;

  const loading = listQuery.isLoading || listQuery.isFetching;
  const items = (listQuery.data?.items || []) as OperationalDocument[];
  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;
  const { activeStep } = useOperationalFlowStore();

  return (
    <PageLayout
      title={t("Đơn mua hàng")}
      desc={t("Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.")}
      icon={<FileText className="h-4 w-4" />}
      actions={
        <TableActionGroup
          loading={loading}
          onRefresh={listQuery.refetch}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={handleCreateNew}
          createLabel={t("Tạo mới")}
        />
      }
    >
      {pageError && (
        <div className="mb-4 text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {pageError}
        </div>
      )}

      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <PurchaseOrderTable
            items={items}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            setPageSize={setPageSize}
            purchaseSortArray={purchaseSort ? [purchaseSort] : undefined}
            togglePurchaseSort={togglePurchaseSort}
            expandedRowIds={expandedRowIds}
            toggleExpandRow={toggleExpandRow}
            onOpenDetail={openDetail}
            onOpenPosting={openPostingDrawer}
            onOpenSettlement={openSettlement}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <PurchaseOrderDrawer
        open={formOpen}
        loading={formLoading}
        editing={editingRow}
        viewOnly={viewOnly}
        poReceipts={poReceipts}
        onClose={handleCloseForm}
        onSaved={handleFormSaved}
        onToggleEdit={handleToggleEdit}
      />

      <SettlementDrawer
        open={activeStep === "settlement"}
        onClose={closeSettlement}
        onSave={saveSettlement}
        onRemoveLink={removePaymentLink}
      />
    </PageLayout>
  );
}
