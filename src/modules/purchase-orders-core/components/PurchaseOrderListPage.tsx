import {
  FileText,
  PackagePlus,
  Network,
  Trash2,
  XCircle,
  Eye,
  Pencil,
  FileSpreadsheet,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { PurchaseOrderDrawer } from "./PurchaseOrderDrawer";
import { ConnectionGraphDrawer } from "./ConnectionGraphDrawer";
import { usePurchaseColumns } from "@/modules/operational/components/list/columns/purchaseColumns";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { usePurchaseOrderPage } from "../hooks/usePurchaseOrderPage";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { useT } from "@/core/i18n";
import { type OperationalDocument } from "@/modules/operational/api/operationalApi";
import { purchaseOrdersCoreApi } from "../api/purchaseOrdersCoreApi";

import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { canReceiveInventory } from "@/modules/operational/utils/operationalHelpers";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { useState, useEffect, useMemo } from "react";

export function PurchaseOrderListPage() {
  const t = useT();
  const pageState = usePurchaseOrderPage();
  const canCreatePo = useHasPermission(
    ErpResource.PURCHASE_ORDERS,
    ErpAction.CREATE,
  );
  const canUpdatePo = useHasPermission(
    ErpResource.PURCHASE_ORDERS,
    ErpAction.UPDATE,
  );
  const canDeletePo = useHasPermission(
    ErpResource.PURCHASE_ORDERS,
    ErpAction.DELETE,
  );
  const canCreateReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.CREATE,
  );
  const isAdmin = useHasPermission(ErpResource.SUPER_ADMIN, ErpAction.ALL);

  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);

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
    listQuery,
    page,
    pageSize,
    setPage,
    setPageSize,
    togglePurchaseSort,
    tableState,
    activeFilterCount,
    clearAllFilters,
  } = listData;

  const loading = listQuery.isLoading || listQuery.isFetching;
  const items = (listQuery.data?.items || []) as OperationalDocument[];

  const total = listQuery.data?.total || 0;
  const totalPages = listQuery.data?.totalPages || 0;

  const summaryRow = useMemo(() => {
    const totalQty = items.reduce(
      (acc, curr) =>
        acc +
        (curr.lines?.reduce(
          (sum, line: any) => sum + Number(line.qty || line.qtyOrdered || 0),
          0,
        ) || 0),
      0,
    );
    return {
      supplier: null,
      total_qty: (
        <span className="tabular-nums font-semibold text-primary">
          {totalQty.toLocaleString("vi-VN")}
        </span>
      ),
    };
  }, [items]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("viewId");
    if (viewId) {
      openDetail({ id: viewId } as OperationalDocument, "view");
      // Clean up the URL
      params.delete("viewId");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newUrl);
    }

    // Custom event listener from Tag connections drawer
    const handleOpenDoc = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.type === "erp_purchase_order" && detail.id) {
        openDetail({ id: detail.id } as OperationalDocument, "view");
      }
    };
    window.addEventListener("open_erp_document", handleOpenDoc);
    return () => window.removeEventListener("open_erp_document", handleOpenDoc);
  }, [openDetail]);

  const handleExportExcel = async (row: OperationalDocument) => {
    try {
      await purchaseOrdersCoreApi.exportExcel(
        row.id,
        row.purchase_no || (row as any).poNo || row.id,
        row.status,
      );
    } catch (e: any) {
      console.error("Failed to export Excel", e);
    }
  };

  const columns = usePurchaseColumns({
    variant: "purchase",
    onOpenDetail: (row) => openDetail(row, "view"),
    tableState,
    fetchColumnOptions: async ({
      columnKey,
      search,
      pageParam,
      filtersStr,
    }) => {
      const res = await purchaseOrdersCoreApi.getColumnOptions(
        columnKey,
        search,
        pageParam,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((i) => ({ label: i, value: i })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
  });

  return (
    <SpreadsheetPageTemplate<OperationalDocument>
      title={t("Đơn mua hàng")}
      desc={t("Phụ tùng, nguyên vật liệu; có thể định kỳ và trigger nhập kho.")}
      icon={<FileText className="h-4 w-4" />}
      tableId="purchase-orders-table"
      loading={loading}
      summaryRow={summaryRow}
      onRefresh={listQuery.refetch}
      activeFilterCount={activeFilterCount}
      onClearAllFilters={clearAllFilters}
      getRowClassName={(row) =>
        row.status === "CANCELLED"
          ? "opacity-40 text-muted-foreground"
          : undefined
      }
      createActions={
        canCreatePo
          ? [
              {
                groupLabel: t("groupThemMoi", "Thêm mới"),
                items: [
                  {
                    label: t("common.create", "Tạo mới"),
                    icon: <PackagePlus className="w-4 h-4 text-emerald-600" />,
                    onClick: handleCreateNew,
                  },
                ],
              },
            ]
          : undefined
      }
      error={pageError}
      items={items}
      columns={columns}
      total={total}
      totalPages={totalPages}
      page={page}
      pageSize={pageSize}
      onPage={setPage}
      onPageSize={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      sortArray={tableState.sorts}
      onSort={togglePurchaseSort}
      getRowKey={(row) => `${row.document_type || "purchase"}-${row.id}`}
      rowActions={(row) => [
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: [
            {
              label: t("Chi tiết"),
              icon: <Eye className="h-[13px] w-[13px]" />,
              onClick: () => openDetail(row, "view"),
            },
            {
              label: t("connectionGraph.action"),
              icon: <Network className="h-[13px] w-[13px]" />,
              onClick: () => void openConnectionGraph(row),
              hidden: !isAdmin,
            },
          ],
        },
        {
          groupLabel: t("groupThaoTac", "Thao tác"),
          items: [
            {
              label: t("Chỉnh sửa"),
              icon: <Pencil className="h-[13px] w-[13px]" />,
              onClick: () => openDetail(row, "edit"),
              disabled: !canUpdatePo || row.status === "CANCELLED",
            },
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
              hidden: row.status !== "DRAFT" || !canDeletePo,
            },
            {
              label: t("Hủy phiếu"),
              icon: <XCircle className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => confirmCancelDocument(row.id),
              hidden: row.status !== "CONFIRMED" || !canUpdatePo,
            },
          ],
        },
        {
          groupLabel: t("common.exportGroup", "Xuất dữ liệu"),
          items: [
            {
              label:
                row.status === "DRAFT"
                  ? t("Xuất phiếu đề xuất")
                  : t("Xuất bảng kê mua hàng"),
              icon: (
                <FileSpreadsheet className="h-[13px] w-[13px] text-emerald-600 dark:text-emerald-400" />
              ),
              onClick: () => void handleExportExcel(row),
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
        onClose={() => {
          handleCloseForm();
          setPendingTagIds([]);
        }}
        onSaved={handleFormSaved}
        onToggleEdit={canUpdatePo ? handleToggleEdit : undefined}
        onExportExcel={
          editingRow ? () => handleExportExcel(editingRow) : undefined
        }
        isAdminEmail={isAdminEmail}
        pendingTagIds={pendingTagIds}
        onPendingTagsChange={setPendingTagIds}
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
