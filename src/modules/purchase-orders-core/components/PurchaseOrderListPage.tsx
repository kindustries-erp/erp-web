import { FileText, PackagePlus } from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { useT } from "@/core/i18n";
import { StandardTable } from "@/shared/components/StandardTable";
import { Eye, Link2, Trash2, XCircle } from "lucide-react";
import { PurchaseOrderDrawer } from "./PurchaseOrderDrawer";
import { PurchaseSubRow } from "@/modules/operational/components/list/PurchaseSubRow";
import { usePurchaseColumns } from "@/modules/operational/components/list/columns/purchaseColumns";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { usePurchaseOrderPage } from "../hooks/usePurchaseOrderPage";
import { SettlementDrawer } from "@/modules/operational/components/list/SettlementDrawer";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { useOperationalFlowStore } from "@/modules/operational/hooks/useOperationalFlowStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { canReceiveInventory } from "@/modules/operational/utils/operationalHelpers";

export function PurchaseOrderListPage() {
  const t = useT();
  const pageState = usePurchaseOrderPage();
  const canCreateReceipt = useHasPermission("goods_receipts", "create");

  // GR drawer — reuses the same form as ErpWarehousePage
  const grDrawer = useGrDrawer({
    onSaved: async () => {
      await pageState.listData.listQuery.refetch();
    },
  });

  const {
    listData,
    formOpen,
    formLoading,
    viewOnly,
    editingRow,
    poReceipts,
    pageError,
    openDetail,
    openSettlement,
    closeSettlement,
    saveSettlement,
    removePaymentLink,
    handleCreateNew,
    handleCloseForm,
    handleToggleEdit,
    handleFormSaved,
    confirmDeleteDocument,
    confirmCancelDocument,
    confirmState,
    confirmLoading,
    handleConfirmAction,
    closeConfirmModal,
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

  const columns = usePurchaseColumns({
    variant: "purchase",
    expandedRowIds,
    onToggleExpand: toggleExpandRow,
  });

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
          <StandardTable<OperationalDocument>
            items={items}
            columns={columns}
            total={total}
            totalPages={totalPages}
            page={page}
            pageSize={pageSize}
            onPage={setPage}
            onPageSize={setPageSize}
            sortArray={purchaseSort ? [purchaseSort] : undefined}
            onSort={togglePurchaseSort}
            expandedRowIds={expandedRowIds}
            getRowKey={(row) => `${row.document_type || "purchase"}-${row.id}`}
            actions={(row) => [
              {
                label: t("Chi tiết"),
                icon: <Eye className="h-4 w-4" />,
                onClick: () => openDetail(row),
              },
              {
                label: t("common.receiveInventory"),
                icon: <PackagePlus className="h-4 w-4" />,
                onClick: () => grDrawer.openCreate(row.id),
                hidden: !canCreateReceipt || !canReceiveInventory(row),
              },
              {
                label: t("Liên kết tiền"),
                icon: <Link2 className="h-4 w-4" />,
                onClick: () => openSettlement(row),
                hidden: Number(row.open_amount || 0) <= 0,
              },
              {
                label: t("Xóa"),
                icon: <Trash2 className="h-4 w-4" />,
                variant: "danger",
                onClick: () => confirmDeleteDocument(row.id),
                hidden: row.status !== "DRAFT",
              },
              {
                label: t("Hủy phiếu"),
                icon: <XCircle className="h-4 w-4" />,
                variant: "danger",
                onClick: () => confirmCancelDocument(row.id),
                hidden: row.status === "DRAFT" || row.status === "CANCELLED",
              },
            ]}
            renderSubRow={(row) => <PurchaseSubRow rowId={row.id} />}
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

      <GrFormDrawer drawer={grDrawer} />

      <ConfirmModal
        open={!!confirmState}
        title={
          confirmState?.action === "delete"
            ? t("Xác nhận xóa")
            : t("Xác nhận hủy")
        }
        message={
          confirmState?.action === "delete"
            ? t("Bạn có chắc muốn xóa chứng từ này?")
            : t("Bạn có chắc muốn hủy chứng từ này?")
        }
        confirmLabel={confirmState?.action === "delete" ? t("Xóa") : t("Hủy")}
        cancelLabel={t("Quay lại")}
        onConfirm={() => void handleConfirmAction()}
        onCancel={closeConfirmModal}
        loading={confirmLoading}
        danger
      />
    </PageLayout>
  );
}
