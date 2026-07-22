/**
 * ErpWarehousePage — unified warehouse voucher list.
 * Shows both Goods Receipts (Nhập kho) and Goods Issues (Xuất kho) in one table.
 * Filter tabs: Tất cả / Nhập kho / Xuất kho
 */

import { useEffect, useMemo, useState, useRef } from "react";
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
} from "lucide-react";
import { formatGMT7 } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { ReceiptText } from "lucide-react";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { useWarehouseVouchersQuery } from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import {
  warehouseVouchersCoreApi,
  type WarehouseRow,
} from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
import { IaFormDrawer } from "@/modules/inventory-adjustments/components/IaFormDrawer";
import { useIaDrawer } from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { useReactToPrint } from "react-to-print";
import {
  GoodsReceiptPrintTemplate,
  type GoodsReceiptPrintData,
} from "@/shared/components/print-templates/GoodsReceiptPrintTemplate";
import {
  GoodsIssuePrintTemplate,
  type GoodsIssuePrintData,
} from "@/shared/components/print-templates/GoodsIssuePrintTemplate";
import { useCompanyProfile } from "@/core/api/companyProfileApi";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import { StatusBadge } from "@/shared/components/badges";

// ─── Main page ────────────────────────────────────────────────────────────────

export function ErpWarehouseTab() {
  const t = useT();
  const canReadReceipts = useHasPermission("goods_receipts", "read");
  const canCreateReceipt = useHasPermission("goods_receipts", "create");
  const canUpdateReceipt = useHasPermission("goods_receipts", "update");
  const canDeleteReceipt = useHasPermission("goods_receipts", "delete");

  const canReadIssues = useHasPermission("goods_issues", "read");
  const canCreateIssue = useHasPermission("goods_issues", "create");
  const canUpdateIssue = useHasPermission("goods_issues", "update");
  const canDeleteIssue = useHasPermission("goods_issues", "delete");

  const canReadAdjustments = useHasPermission("inventory_adjustments", "read");
  const canCreateAdjustment = useHasPermission(
    "inventory_adjustments",
    "create",
  );
  const canUpdateAdjustment = useHasPermission(
    "inventory_adjustments",
    "update",
  );
  const canDeleteAdjustment = useHasPermission(
    "inventory_adjustments",
    "delete",
  );

  const isAdmin = useHasPermission("*", "*");

  const showToast = useUIStore((s) => s.showToast);
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  const queryClient = useQueryClient();

  // ── filter state (same pattern as page mua hàng)
  // ── list state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── GR drawer — delegated to useGrDrawer
  const grDrawer = useGrDrawer({ invalidateWarehouseQuery: true });
  const grCancelId = grDrawer.cancelId;
  const [deleteTarget, setDeleteTarget] = useState<WarehouseRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WarehouseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── GI drawer — delegated to useGiDrawer
  const giDrawer = useGiDrawer({ invalidateWarehouseQuery: true });

  // ── IA drawer
  const iaDrawer = useIaDrawer({ invalidateWarehouseQuery: true });

  // ── Background Print Setup
  const { data: companyProfile } = useCompanyProfile();

  const printGrRef = useRef<HTMLDivElement>(null);
  const printGiRef = useRef<HTMLDivElement>(null);
  const [printGrData, setPrintGrData] = useState<{
    id: string;
    data: GoodsReceiptPrintData;
  } | null>(null);
  const [printGiData, setPrintGiData] = useState<{
    id: string;
    data: GoodsIssuePrintData;
  } | null>(null);
  const [printTargetId, setPrintTargetId] = useState<string | null>(null);
  const [xlsxExportingId, setXlsxExportingId] = useState<string | null>(null);

  const handlePrintGr = useReactToPrint({
    contentRef: printGrRef,
    documentTitle: `PhieuNhapKho_${printGrData?.data.receiptNo || ""}`,
    onAfterPrint: () => setPrintTargetId(null),
  });

  const handlePrintGi = useReactToPrint({
    contentRef: printGiRef,
    documentTitle: `PhieuXuatKho_${printGiData?.data.issueNo || ""}`,
    onAfterPrint: () => setPrintTargetId(null),
  });

  useEffect(() => {
    setGlobalLoading(!!printTargetId);
  }, [printTargetId, setGlobalLoading]);

  useEffect(() => {
    if (printTargetId && printGrData && printGrData.id === printTargetId) {
      handlePrintGr();
    }
  }, [printTargetId, printGrData, handlePrintGr]);

  useEffect(() => {
    if (printTargetId && printGiData && printGiData.id === printTargetId) {
      handlePrintGi();
    }
  }, [printTargetId, printGiData, handlePrintGi]);

  const handlePrintRow = async (row: WarehouseRow) => {
    setPrintTargetId(row.id);
    try {
      if (row.type === "receipt") {
        const detail = await goodsReceiptsCoreApi.get(row.id);
        const itemIds = [
          ...new Set(
            detail.lines?.map((l) => l.itemId).filter(Boolean) as string[],
          ),
        ];
        let itemsDict: Record<
          string,
          { itemCode?: string; itemName?: string }
        > = {};
        if (itemIds.length > 0) {
          const res = await inventoryCoreApi.list({
            ids: itemIds.join(","),
            pageSize: 1000,
          });
          itemsDict = Object.fromEntries(res.items.map((i) => [i.id, i]));
        }

        setPrintGrData({
          id: row.id,
          data: {
            receiptNo: detail.receiptNo,
            receiptDate: detail.receiptDate,
            supplierName: detail.supplierName || "",
            remarks: detail.remarks || "",
            lines:
              detail.lines?.map((l) => {
                const dictItem = l.itemId ? itemsDict[l.itemId] : null;
                return {
                  itemId: l.itemId || "",
                  itemCode: dictItem?.itemCode || l.itemId || "",
                  itemName: l.itemName || dictItem?.itemName || "",
                  qtyReceived: l.qtyReceived,
                  unitCost: l.unitCost,
                };
              }) || [],
          },
        });
      } else {
        const detail = await goodsIssuesCoreApi.get(row.id);
        const itemIds = [
          ...new Set(
            detail.lines?.map((l) => l.itemId).filter(Boolean) as string[],
          ),
        ];
        let itemsDict: Record<
          string,
          { itemCode?: string; itemName?: string }
        > = {};
        if (itemIds.length > 0) {
          const res = await inventoryCoreApi.list({
            ids: itemIds.join(","),
            pageSize: 1000,
          });
          itemsDict = Object.fromEntries(res.items.map((i) => [i.id, i]));
        }

        setPrintGiData({
          id: row.id,
          data: {
            issueNo: detail.issueNo,
            issueDate: detail.issueDate,
            customerName: detail.customerName || "",
            remarks: detail.remarks || "",
            lines:
              detail.lines?.map((l) => {
                const dictItem = l.itemId ? itemsDict[l.itemId] : null;
                return {
                  itemId: l.itemId || "",
                  itemCode: dictItem?.itemCode || l.itemId || "",
                  itemName: l.itemName || dictItem?.itemName || "",
                  qtyIssued: l.qtyIssued,
                  unitCost: l.unitCost,
                };
              }) || [],
          },
        });
      }
    } catch (e) {
      console.error(e);
      setPrintTargetId(null);
      showToast({ title: "Lỗi tải dữ liệu in", variant: "destructive" });
    }
  };

  const handleExportXlsx = async (row: WarehouseRow) => {
    try {
      setXlsxExportingId(row.id);
      let blob: Blob;
      let filename = "";
      if (row.type === "receipt") {
        blob = await goodsReceiptsCoreApi.exportXlsx(row.id);
        filename = `PhieuNhapKho_${row.voucherNo}.xlsx`;
      } else {
        blob = await goodsIssuesCoreApi.exportXlsx(row.id);
        filename = `PhieuXuatKho_${row.voucherNo}.xlsx`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export XLSX error:", error);
      showToast({
        title: t("Lỗi xuất file"),
        description: t("Không thể xuất file XLSX, vui lòng thử lại sau."),
        variant: "destructive",
      });
    } finally {
      setXlsxExportingId(null);
    }
  };

  const filterConfig: FilterPanelConfig = {
    search: false,
    period: true,
    noDefaultPeriod: true,
  };

  const filterPanel = useFilterPanel(filterConfig);

  const dateFrom = filterPanel.state.dateFrom;
  const dateTo = filterPanel.state.dateTo;

  const tableState = useTableColumnState("inventory-vouchers-table");

  const fetchColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const res = await warehouseVouchersCoreApi.getColumnOptions(
      columnKey,
      search,
      pageParam,
      20,
      filtersStr,
      undefined, // No specific type filter
    );
    return {
      items: res.items.map((i: string) => ({
        label: String(i),
        value: String(i),
      })),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
    };
  };

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
    setPage(1);
  };

  const renderHeaderFilter = (key: string, label: string) => {
    let formatOptionLabel: ((val: string) => string) | undefined;
    if (["qtyReceipt", "qtyIssue", "qtyAdjustment"].includes(key)) {
      formatOptionLabel = (val: string | number) => {
        const n = Number(val || 0);
        if (isNaN(n)) return String(val);
        return n.toLocaleString("vi-VN");
      };
    }

    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={getSortState(key)}
        onSortChange={(state) => handleSortChange(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => handleSearchChange(key, val)}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => handleFilterChange(key, vals)}
        columnKey={key}
        allFilters={tableState.columnFilters}
        fetchOptions={fetchColumnOptions}
        formatOptionLabel={formatOptionLabel}
        queryKeyPrefix="warehouse-vouchers-col-options"
      />
    );
  };

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

  // ── Unified rows
  const rows: WarehouseRow[] = vouchersQuery.data?.items ?? [];
  const loading = vouchersQuery.isLoading || vouchersQuery.isFetching;
  const total = vouchersQuery.data?.total ?? 0;
  const totalPages = vouchersQuery.data?.totalPages ?? 1;

  // ── GR/IA cancel (still used for the cancel confirm modal)
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
        showToast({ title: "Đã xóa phiếu nhập kho", variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: ["warehouse-vouchers", "unified"],
        });
      } else if (deleteTarget.type === "issue") {
        await goodsIssuesCoreApi.remove(deleteTarget.id);
        showToast({ title: "Đã xóa phiếu xuất kho", variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: ["warehouse-vouchers", "unified"],
        });
      } else if (deleteTarget.type === "adjustment") {
        const { inventoryAdjustmentsApi } =
          await import("@/modules/inventory-adjustments/api/inventoryAdjustmentsApi");
        await inventoryAdjustmentsApi.delete(deleteTarget.id);
        showToast({ title: "Đã xóa phiếu điều chỉnh", variant: "success" });
        await queryClient.invalidateQueries({
          queryKey: ["warehouse-vouchers", "unified"],
        });
      }
      setDeleteTarget(null);
    } catch (e) {
      showToast({
        title: e instanceof Error ? e.message : "Lỗi xóa phiếu",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  // ── Columns
  const columns: DataTableColumn<WarehouseRow>[] = useMemo(
    () => [
      {
        key: "date",
        header: renderHeaderFilter("date", t("Ngày")),
        size: 100,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <Tooltip
            content={formatGMT7(row.createdAt, "datetime-sec")}
            side="top"
          >
            <span className="cursor-help border-b border-dotted border-gray-400">
              {formatGMT7(row.date || row.createdAt, "date")}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "voucherNo",
        header: renderHeaderFilter("voucherNo", t("Số phiếu")),
        size: 150,
        className: "font-mono text-sm text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span
              title={
                row.type === "receipt"
                  ? t("Nhập kho")
                  : row.type === "issue"
                    ? t("Xuất kho")
                    : t("Điều chỉnh")
              }
              className="flex-shrink-0"
            >
              {row.type === "receipt" ? (
                <PackagePlus className="h-4 w-4 text-emerald-600" />
              ) : row.type === "issue" ? (
                <PackageMinus className="h-4 w-4 text-orange-600" />
              ) : (
                <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              )}
            </span>
            <button
              className="font-medium text-primary hover:underline"
              onClick={() => {
                if (row.type === "receipt") {
                  grDrawer.openDetail(row.id);
                } else if (row.type === "issue") {
                  giDrawer.openDetail(row.id);
                } else if (row.type === "adjustment") {
                  iaDrawer.openDetail(row.id);
                }
              }}
            >
              {row.voucherNo}
            </button>
          </div>
        ),
      },
      {
        key: "qtyReceipt",
        header: renderHeaderFilter("qtyReceipt", t("SL Nhập")),
        size: 150,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (row.type !== "receipt") return "";
          const qty = Number(row.totalQty);
          return isNaN(qty) ? (
            ""
          ) : (
            <span className="font-medium text-emerald-600">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        key: "qtyIssue",
        header: renderHeaderFilter("qtyIssue", t("SL Xuất")),
        size: 150,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (row.type !== "issue") return "";
          const qty = Number(row.totalQty);
          return isNaN(qty) ? (
            ""
          ) : (
            <span className="font-medium text-orange-600">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        key: "qtyAdjustment",
        header: renderHeaderFilter("qtyAdjustment", t("SL Điều chỉnh")),
        size: 150,
        className: "text-right",
        headerClassName: "p-0 h-full",
        cell: (row) => {
          if (row.type !== "adjustment") return "";
          const qty = Number(row.totalQty);
          return isNaN(qty) ? (
            ""
          ) : (
            <span className="font-medium text-blue-600">
              {qty.toLocaleString("vi-VN")}
            </span>
          );
        },
      },
      {
        key: "poNo",
        header: renderHeaderFilter("poNo", t("Số PO")),
        size: 150,
        className: "font-mono text-sm text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <Tooltip content={row.poNo || ""}>
            <div className="whitespace-normal break-words w-full">
              {row.poNo ?? ""}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "partnerName",
        header: renderHeaderFilter("partnerName", t("Đối tác")),
        size: 200,
        className: "text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <Tooltip content={row.partnerName || ""}>
            <div className="whitespace-normal break-words w-full">
              {row.partnerName ?? ""}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "remarks",
        header: renderHeaderFilter("remarks", t("Ghi chú")),
        size: 300,
        className: "text-left",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <Tooltip content={row.remarks || ""}>
            <div className="whitespace-normal break-words w-full">
              {row.remarks ?? ""}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "status",
        header: renderHeaderFilter("status", t("Trạng thái")),
        size: 150,
        className: "text-center",
        headerClassName: "p-0 h-full",
        cell: (row) => (
          <div className="w-full flex justify-center">
            <StatusBadge status={row.status || ""} />
          </div>
        ),
      },
    ],

    [t, tableState, grDrawer, giDrawer, iaDrawer],
  );

  // Actions are now passed to SpreadsheetPageTemplate

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
        filterConfig={filterConfig}
        filter={filterPanel}
        rowActions={(row) => [
          {
            groupLabel: t("groupTraCuu", "Tra cứu"),
            items: [
              {
                label: t("Chi tiết"),
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
            ],
          },
          {
            groupLabel: t("groupDuLieu", "Dữ liệu"),
            items: [
              {
                label: t("common.print"),
                icon: <Printer className="h-3.5 w-3.5" />,
                hidden: row.status === "DRAFT" || !isAdmin,
                disabled: !!printTargetId,
                onClick: () => handlePrintRow(row),
              },
              {
                label: t("Xuất XLSX"),
                icon: <FileSpreadsheet className="h-3.5 w-3.5" />,
                hidden: row.status === "DRAFT" || row.type === "adjustment",
                disabled: xlsxExportingId === row.id,
                onClick: () => handleExportXlsx(row),
              },
            ],
          },
          {
            groupLabel: t("groupThaoTac", "Thao tác"),
            items: [
              {
                label: t("Xóa"),
                icon: <Trash2 className="h-3.5 w-3.5" />,
                variant: "danger",
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
                label: t("Hủy phiếu"),
                icon: <XCircle className="h-3.5 w-3.5" />,
                variant: "danger",
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
        ]}
        createActions={[
          {
            groupLabel: t("groupThemMoi", "Thêm mới"),
            items: [
              {
                label: t("Nhập kho"),
                icon: <PackagePlus className="h-4 w-4 text-emerald-600" />,
                onClick: () => grDrawer.openCreate(),
                hidden: !canCreateReceipt,
              },
              {
                label: t("Xuất kho"),
                icon: <PackageMinus className="h-4 w-4 text-orange-600" />,
                onClick: () => giDrawer.openCreate(),
                hidden: !canCreateIssue,
              },
              {
                label: t("Điều chỉnh kho"),
                icon: <SlidersHorizontal className="h-4 w-4 text-blue-600" />,
                onClick: () => iaDrawer.openCreate(),
                hidden: !canCreateAdjustment,
              },
            ],
          },
        ]}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title={t("Xác nhận xóa")}
        message={
          deleteTarget
            ? t("Xóa") +
              " " +
              (deleteTarget.type === "receipt"
                ? t("phiếu nhập")
                : deleteTarget.type === "issue"
                  ? t("phiếu xuất")
                  : t("phiếu điều chỉnh")) +
              ` "${deleteTarget.voucherNo}"? ` +
              t("Hành động này sẽ ẩn phiếu này khỏi danh sách.")
            : ""
        }
        confirmLabel={t("Xóa")}
        cancelLabel={t("Hủy")}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!cancelTarget}
        title={t("Xác nhận hủy phiếu")}
        message={
          cancelTarget
            ? t("Hủy phiếu") +
              " " +
              (cancelTarget.type === "receipt"
                ? t("phiếu nhập")
                : cancelTarget.type === "issue"
                  ? t("phiếu xuất")
                  : t("phiếu điều chỉnh")) +
              ` "${cancelTarget.voucherNo}"? ` +
              t("Hệ thống sẽ tạo một bút toán đảo để cân bằng giá trị.")
            : ""
        }
        confirmLabel={t("Hủy phiếu")}
        cancelLabel={t("Đóng")}
        onConfirm={() => {
          if (
            cancelTarget &&
            (cancelTarget.type === "receipt" ||
              cancelTarget.type === "adjustment")
          ) {
            void handleGrCancel(cancelTarget.id);
          }
        }}
        onCancel={() => {
          if (!grCancelId) setCancelTarget(null);
        }}
        loading={!!grCancelId}
        danger
      />

      {/* ─── GR Drawer ──────────────────────────────────────────────────────── */}
      <GrFormDrawer drawer={grDrawer} />

      {/* ─── GI Drawer ──────────────────────────────────────────────────────── */}
      <GiFormDrawer drawer={giDrawer} />

      {/* ─── IA Drawer ──────────────────────────────────────────────────────── */}
      <IaFormDrawer drawer={iaDrawer} />

      <div style={{ display: "none" }}>
        {printGrData && (
          <GoodsReceiptPrintTemplate
            ref={printGrRef}
            companyProfile={companyProfile}
            data={printGrData.data}
          />
        )}
        {printGiData && (
          <GoodsIssuePrintTemplate
            ref={printGiRef}
            companyProfile={companyProfile}
            data={printGiData.data}
          />
        )}
      </div>
    </>
  );
}
