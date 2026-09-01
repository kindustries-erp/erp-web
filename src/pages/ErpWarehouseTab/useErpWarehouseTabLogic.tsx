import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  Trash2,
  XCircle,
  Printer,
  Eye,
  FileSpreadsheet,
  FileText,
  Pencil,
} from "lucide-react";

import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { getDefaultPageSize } from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { useInventoryVoucherDrawer } from "@/modules/inventory-core/hooks/useInventoryVoucherDrawer";
import { useWarehouseVouchersQuery } from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { inventoryAdjustmentsApi } from "@/modules/inventory-adjustments/api/inventoryAdjustmentsApi";

import { useWarehousePrintExport } from "./hooks/useWarehousePrintExport";
import { useWarehouseColumns } from "./hooks/useWarehouseColumns";

export function useErpWarehouseTabLogic() {
  const t = useT();
  const canReadReceipts = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.READ,
  );
  const canCreateReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.CREATE,
  );
  const canUpdateReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.UPDATE,
  );
  const canDeleteReceipt = useHasPermission(
    ErpResource.GOODS_RECEIPTS,
    ErpAction.DELETE,
  );

  const canReadIssues = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.READ,
  );
  const canCreateIssue = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.CREATE,
  );
  const canUpdateIssue = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.UPDATE,
  );
  const canDeleteIssue = useHasPermission(
    ErpResource.GOODS_ISSUES,
    ErpAction.DELETE,
  );

  const canReadAdjustments = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.READ,
  );
  const canCreateAdjustment = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.CREATE,
  );
  const canUpdateAdjustment = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.UPDATE,
  );
  const canDeleteAdjustment = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.DELETE,
  );

  const isAdmin = useHasPermission(ErpResource.SUPER_ADMIN, ErpAction.ALL);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [loadError, setLoadError] = useState<string | null>(null);

  const unifiedDrawer = useInventoryVoucherDrawer({
    invalidateWarehouseQuery: true,
  });
  const { grDrawer, giDrawer, iaDrawer } = unifiedDrawer;
  const grCancelId = grDrawer.cancelId;
  const [deleteTarget, setDeleteTarget] = useState<WarehouseRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WarehouseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const printExport = useWarehousePrintExport();
  const {
    companyProfile,
    printGrRef,
    printGiRef,
    printGrData,
    printGiData,
    printTargetId,
    xlsxExportingId,
    handlePrintRow,
    handleExportXlsx,
  } = printExport;

  const filterConfig: FilterPanelConfig = {
    search: false,
    period: true,
    noDefaultPeriod: true,
  };
  const filterPanel = useFilterPanel(filterConfig);
  const { dateFrom, dateTo } = filterPanel.state;

  const tableState = useTableColumnState("inventory-vouchers-table");

  const vouchersQuery = useWarehouseVouchersQuery({
    page,
    pageSize,
    search: undefined,
    type: undefined,
    dateFrom,
    dateTo,
    status: undefined,
    partnerId: undefined,
    sort: tableState.sorts.length > 0 ? tableState.sorts : undefined,
    column_search:
      Object.keys(tableState.columnSearch).length > 0
        ? JSON.stringify(tableState.columnSearch)
        : undefined,
    column_filters:
      Object.keys(tableState.columnFilters).length > 0
        ? JSON.stringify(tableState.columnFilters)
        : undefined,
  });

  useEffect(() => {
    const error =
      vouchersQuery.error instanceof Error ? vouchersQuery.error.message : null;
    setLoadError(error);
  }, [vouchersQuery.error]);

  useEffect(() => {
    const grPrefill = window.sessionStorage.getItem("gr_prefill_mo");
    if (grPrefill) {
      window.sessionStorage.removeItem("gr_prefill_mo");
      grDrawer.openCreate(undefined, grPrefill);
    }
    const giPrefill = window.sessionStorage.getItem("gi_prefill_mo");
    if (giPrefill) {
      window.sessionStorage.removeItem("gi_prefill_mo");
      giDrawer.openCreate(giPrefill);
    }
  }, [grDrawer, giDrawer]);

  const rows: WarehouseRow[] = vouchersQuery.data?.items ?? [];
  const loading = vouchersQuery.isLoading || vouchersQuery.isFetching;
  const total = vouchersQuery.data?.total ?? 0;
  const totalPages = vouchersQuery.data?.totalPages ?? 1;

  const { columns, summaryRow } = useWarehouseColumns({
    tableState,
    dateFrom,
    dateTo,
    setDateRange: (from?: string, to?: string) => {
      filterPanel.setDateFrom(from || "");
      filterPanel.setDateTo(to || "");
      setPage(1);
    },
    setPage,
    unifiedDrawer,
    rows,
  });

  async function handleGrCancel(id: string) {
    if (cancelTarget?.type === "adjustment") {
      await iaDrawer.handleCancel(id);
    } else {
      await grDrawer.handleCancel(id);
    }
    setCancelTarget(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "receipt") {
        await goodsReceiptsCoreApi.remove(deleteTarget.id);
        showToast({
          title: t(
            "inventory.toastDeleteReceiptSuccess",
            "Đã xóa phiếu nhập kho",
          ),
          variant: "success",
        });
      } else if (deleteTarget.type === "issue") {
        await goodsIssuesCoreApi.remove(deleteTarget.id);
        showToast({
          title: t(
            "inventory.toastDeleteIssueSuccess",
            "Đã xóa phiếu xuất kho",
          ),
          variant: "success",
        });
      } else if (deleteTarget.type === "adjustment") {
        await inventoryAdjustmentsApi.delete(deleteTarget.id);
        showToast({
          title: t(
            "inventory.toastDeleteAdjustmentSuccess",
            "Đã xóa phiếu điều chỉnh",
          ),
          variant: "success",
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "unified"],
      });
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title:
          e instanceof Error
            ? e.message
            : t("inventory.toastDeleteError", "Lỗi xóa phiếu"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  const rowActions = (row: WarehouseRow) => [
    {
      groupLabel: t("common.groupSearch", "Tra cứu"),
      items: [
        {
          label: t("common.detail", "Chi tiết"),
          icon: <Eye className="h-3.5 w-3.5" />,
          onClick: () => {
            if (row.type === "receipt") {
              grDrawer.openDetail(row.id);
            } else if (row.type === "issue") {
              giDrawer.openDetail(row.id);
            } else if (row.type === "adjustment") {
              iaDrawer.openDetail(row.id);
            }
          },
        },
        ...(row.poNo || row.purchaseOrderId || row.salesOrderId
          ? [
              {
                label:
                  row.type === "receipt" || row.purchaseOrderId
                    ? t("purchasing.viewPo", "Xem đơn mua hàng")
                    : t("sales.viewSo", "Xem đơn bán hàng"),
                icon: <FileText className="h-3.5 w-3.5" />,
                onClick: () => {
                  if (row.purchaseOrderId || row.type === "receipt") {
                    window.dispatchEvent(
                      new CustomEvent("open_erp_document", {
                        detail: {
                          type: "erp_purchase_order",
                          id: row.purchaseOrderId || row.poNo,
                        },
                      }),
                    );
                  } else if (row.salesOrderId || row.type === "issue") {
                    window.dispatchEvent(
                      new CustomEvent("open_erp_document", {
                        detail: {
                          type: "erp_sales_order",
                          id: row.salesOrderId || row.poNo,
                        },
                      }),
                    );
                  }
                },
              },
            ]
          : []),
      ],
    },
    {
      groupLabel: t("common.groupActions", "Thao tác"),
      items: [
        {
          label: t("common.edit", "Chỉnh sửa"),
          icon: <Pencil className="h-3.5 w-3.5" />,
          hidden:
            row.status === "CANCELLED" ||
            (row.type === "receipt" && !canUpdateReceipt) ||
            (row.type === "issue" && !canUpdateIssue) ||
            (row.type === "adjustment" && !canUpdateAdjustment),
          onClick: () => {
            if (row.type === "receipt") {
              grDrawer.openDetail(row.id, false);
            } else if (row.type === "issue") {
              giDrawer.openDetail(row.id, false);
            } else if (row.type === "adjustment") {
              iaDrawer.openDetail(row.id, false);
            }
          },
        },
        {
          label: t("common.print", "In"),
          icon: <Printer className="h-3.5 w-3.5" />,
          hidden: row.status === "DRAFT" || !isAdmin,
          disabled: !!printTargetId,
          onClick: () => handlePrintRow(row),
        },
        {
          label: t("common.exportXlsx", "Xuất XLSX"),
          icon: <FileSpreadsheet className="h-3.5 w-3.5" />,
          hidden: row.status === "DRAFT" || row.type === "adjustment",
          disabled: xlsxExportingId === row.id,
          onClick: () => handleExportXlsx(row),
        },
        {
          label: t("common.delete", "Xóa"),
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger" as const,
          hidden:
            row.status !== "DRAFT" ||
            (row.type === "receipt" && !canDeleteReceipt) ||
            (row.type === "issue" && !canDeleteIssue) ||
            (row.type === "adjustment" && !canDeleteAdjustment),
          onClick: () => {
            setDeleteTarget(row);
          },
        },
        {
          label: t("inventory.cancelVoucher", "Hủy phiếu"),
          icon: <XCircle className="h-3.5 w-3.5" />,
          variant: "danger" as const,
          hidden:
            row.status !== "POSTED" ||
            (row.type === "receipt" && !canUpdateReceipt) ||
            (row.type === "issue" && !canUpdateIssue) ||
            (row.type === "adjustment" && !canUpdateAdjustment),
          onClick: () => {
            setCancelTarget(row);
          },
        },
      ],
    },
  ];

  const createActions = [
    {
      groupLabel: t("common.groupAddNew", "Thêm mới"),
      items: [
        {
          label: t("inventory.receipt", "Nhập kho"),
          icon: <PackagePlus className="h-4 w-4 text-emerald-600" />,
          onClick: () => grDrawer.openCreate(),
          hidden: !canCreateReceipt,
        },
        {
          label: t("inventory.issue", "Xuất kho"),
          icon: <PackageMinus className="h-4 w-4 text-orange-600" />,
          onClick: () => giDrawer.openCreate(),
          hidden: !canCreateIssue,
        },
        {
          label: t("inventory.adjustment", "Điều chỉnh kho"),
          icon: <SlidersHorizontal className="h-4 w-4 text-blue-600" />,
          onClick: () => iaDrawer.openCreate(),
          hidden: !canCreateAdjustment,
        },
      ],
    },
  ];

  return {
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
  };
}
