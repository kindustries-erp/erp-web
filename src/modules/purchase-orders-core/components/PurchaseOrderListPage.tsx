import { FileText, PackagePlus, Network } from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useT } from "@/core/i18n";
import { Link2, Trash2, XCircle, Eye } from "lucide-react";
import { PurchaseOrderDrawer } from "./PurchaseOrderDrawer";
import { ConnectionGraphDrawer } from "./ConnectionGraphDrawer";
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
    // Connection Graph
    connectionGraphOpen,
    connectionGraphRow,
    graphNodes,
    graphEdges,
    graphLoading,
    graphError,
    graphLayout,
    toggleGraphLayout,
    openConnectionGraph,
    closeConnectionGraph,
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
    <SpreadsheetPageTemplate<OperationalDocument>
      title={t("Đơn mua hàng")}
      desc={t("Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.")}
      icon={<FileText className="h-4 w-4" />}
      tableId="purchase-orders-table"
      loading={loading}
      onRefresh={listQuery.refetch}
      onCreate={handleCreateNew}
      createLabel={t("Tạo mới")}
      error={pageError}
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
      expandedRowKeys={
        expandedRowIds
          ? Object.keys(expandedRowIds).filter((k) => expandedRowIds[k])
          : undefined
      }
      getRowKey={(row) => `${row.document_type || "purchase"}-${row.id}`}
      onRowClick={(row) => openDetail(row)}
      filterConfig={filterConfig}
      filter={filter}
      renderSubRow={(row) => <PurchaseSubRow rowId={row.id} />}
      rowActions={(row) => [
        {
          groupLabel: t("Tra cứu"),
          items: [
            {
              label: t("Chi tiết"),
              icon: <Eye className="h-[13px] w-[13px]" />,
              onClick: () => openDetail(row),
            },
            {
              label: t("connectionGraph.action"),
              icon: <Network className="h-[13px] w-[13px]" />,
              onClick: () => void openConnectionGraph(row),
            },
            {
              label: t("Liên kết tiền"),
              icon: <Link2 className="h-[13px] w-[13px]" />,
              onClick: () => openSettlement(row),
              hidden: Number(row.open_amount || 0) <= 0,
            },
          ],
        },
        {
          groupLabel: t("Thao tác"),
          items: [
            {
              label: t("common.receiveInventory"),
              icon: <PackagePlus className="h-[13px] w-[13px]" />,
              onClick: () => grDrawer.openCreate(row.id),
              hidden: !canCreateReceipt || !canReceiveInventory(row),
            },
            {
              label: t("Xóa"),
              icon: <Trash2 className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => confirmDeleteDocument(row.id),
              hidden: row.status !== "DRAFT",
            },
            {
              label: t("Hủy phiếu"),
              icon: <XCircle className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => confirmCancelDocument(row.id),
              hidden: row.status === "DRAFT" || row.status === "CANCELLED",
            },
          ],
        },
      ]}
    >
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

      <ConnectionGraphDrawer
        open={connectionGraphOpen}
        onClose={closeConnectionGraph}
        title={t("Đồ thị liên kết chứng từ")}
        subtitle={
          connectionGraphRow
            ? `${connectionGraphRow.purchase_no || connectionGraphRow.order_no || connectionGraphRow.id} (${
                connectionGraphRow.supplier_name_snapshot ?? t("common.unknown")
              })`
            : undefined
        }
        loading={graphLoading}
        error={graphError}
        initialNodes={graphNodes}
        initialEdges={graphEdges}
        layout={graphLayout}
        toggleLayout={toggleGraphLayout}
        onNodeClick={(nodeData) => {
          if (!nodeData.docId) return;
          switch (nodeData.nodeType) {
            case "purchase_order":
              if (connectionGraphRow) openDetail(connectionGraphRow);
              break;
            case "goods_receipt":
              grDrawer.openDetail(nodeData.docId);
              break;
            default:
              // Other drawers (Invoice, Payment Voucher) not available in this page context yet
              break;
          }
        }}
      />

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
    </SpreadsheetPageTemplate>
  );
}
