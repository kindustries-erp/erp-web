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
  Trash2,
  XCircle,
  Printer,
  Eye,
} from "lucide-react";
import { formatGMT7 } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { ReceiptText } from "lucide-react";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import { goodsIssuesCoreApi } from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { useT } from "@/core/i18n";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useUIStore } from "@/core/config/uiStore";
import { useWarehouseVouchersQuery } from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { useGiDrawer } from "@/modules/goods-issues-core/hooks/useGiDrawer";
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
  const isAdmin = useHasPermission("*", "*");

  const showToast = useUIStore((s) => s.showToast);
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  const queryClient = useQueryClient();

  // ── filter state (same pattern as page mua hàng)
  // ── list state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // activeSortKey: column đang được user chọn sort; null = default (không có active sort)
  const [activeSortKey, setActiveSortKey] = useState<string | null>(null);
  const [activeSortOrder, setActiveSortOrder] = useState<"asc" | "desc">("asc");
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── GR drawer — delegated to useGrDrawer
  const grDrawer = useGrDrawer({ invalidateWarehouseQuery: true });
  const grCancelId = grDrawer.cancelId;
  const [deleteTarget, setDeleteTarget] = useState<WarehouseRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<WarehouseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── GI drawer — delegated to useGiDrawer
  const giDrawer = useGiDrawer({ invalidateWarehouseQuery: true });

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

  // Lookup hooks for basic masters
  const { data: suppliersData } = useBasicMasterInfinite({
    search: "",
    limit: 50,
    entities: "suppliers",
  });
  const supplierOptions = useMemo(() => {
    return (
      suppliersData?.pages.flatMap((p) =>
        (p.items.suppliers || []).map((s) => ({
          value: s.id,
          label: s.name,
        })),
      ) || []
    );
  }, [suppliersData]);

  const { data: customersData } = useBasicMasterInfinite({
    search: "",
    limit: 50,
    entities: "customers",
  });
  const customerOptions = useMemo(() => {
    return (
      customersData?.pages.flatMap((p) =>
        (p.items.customers || []).map((c) => ({
          value: c.id,
          label: `${c.code} — ${c.displayName || c.name}`,
        })),
      ) || []
    );
  }, [customersData]);

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "DRAFT", label: t("Nháp") },
      { value: "POSTED", label: t("Đã vào sổ") },
      { value: "CANCELLED", label: t("Đã hủy") },
    ],
    [t],
  );

  const filterConfig: FilterPanelConfig = {
    search: true,
    period: true,
    status: {
      placeholder: t("Trạng thái"),
      options: STATUS_OPTIONS,
    },
    custom: [
      {
        key: "partnerId",
        label: t("Đối tác"),
        placeholder: t("Tất cả đối tác"),
        type: "select",
        options: [...supplierOptions, ...customerOptions],
      },
    ],
  };

  const filterPanel = useFilterPanel(filterConfig);

  const dateFrom = filterPanel.state.dateFrom;
  const dateTo = filterPanel.state.dateTo;
  const status = filterPanel.state.status;
  const partnerId = filterPanel.state.custom?.partnerId;

  const vouchersQuery = useWarehouseVouchersQuery({
    page,
    pageSize,
    search: filterPanel.state.search || undefined,
    type: undefined,
    dateFrom,
    dateTo,
    status,
    partnerId,
    sort: sortOrder === "desc" ? [`-${sortBy}`] : [sortBy],
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

  // ── GR cancel (still used for the cancel confirm modal)
  async function handleGrCancel(id: string) {
    await grDrawer.handleCancel(id);
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
      } else {
        await goodsIssuesCoreApi.remove(deleteTarget.id);
        showToast({ title: "Đã xóa phiếu xuất kho", variant: "success" });
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
        key: "voucherNo",
        header: t("Số phiếu"),
        className: "w-[200px] font-mono text-sm",
        sortable: true,
        sortKey: "voucherNo",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span
              title={row.type === "receipt" ? t("Nhập kho") : t("Xuất kho")}
              className="flex-shrink-0"
            >
              {row.type === "receipt" ? (
                <PackagePlus className="h-4 w-4 text-emerald-600" />
              ) : (
                <PackageMinus className="h-4 w-4 text-orange-600" />
              )}
            </span>
            <span className="font-medium text-foreground">{row.voucherNo}</span>
          </div>
        ),
      },
      {
        key: "date",
        header: t("Ngày"),
        className: "w-[110px]",
        sortable: true,
        sortKey: "date",
        cell: (row) => (
          <Tooltip
            content={formatGMT7(row.createdAt, "datetime-sec")}
            side="top"
          >
            <span className="cursor-help border-b border-dotted border-gray-400">
              {formatGMT7(row.createdAt, "date")}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "poNo",
        header: t("Số PO"),
        className: "w-[160px] font-mono text-sm",
        cell: (row) => row.poNo ?? "—",
      },
      {
        key: "partnerName",
        header: t("Đối tác"),
        cell: (row) => row.partnerName ?? "—",
      },
      {
        key: "remarks",
        header: t("Ghi chú"),
        className: "min-w-[300px]",
        cell: (row) => row.remarks ?? "—",
      },
      {
        key: "status",
        header: t("Trạng thái"),
        className: "w-[140px] text-center",
        headerClassName: "text-center",
        cell: (row) => (
          <div className="w-full flex justify-center">
            <StatusBadge status={row.status || ""} />
          </div>
        ),
      },
    ],
    [],
  );

  // Actions are now passed to SpreadsheetPageTemplate

  if (!canReadReceipts && !canReadIssues) return <Forbidden />;

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
        sortArray={
          activeSortKey
            ? [activeSortOrder === "desc" ? `-${activeSortKey}` : activeSortKey]
            : undefined
        }
        onSort={(key) => {
          if (activeSortKey === key) {
            if (activeSortOrder === "asc") {
              setActiveSortOrder("desc");
              setSortOrder("desc");
            } else {
              setActiveSortKey(null);
              setSortBy("date");
              setSortOrder("desc");
            }
          } else {
            setActiveSortKey(key);
            setActiveSortOrder("asc");
            setSortBy(key);
            setSortOrder("asc");
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
            label: t("Chi tiết"),
            icon: <Eye className="h-3.5 w-3.5" />,
            onClick: () => {
              if (row.type === "receipt") {
                grDrawer.openDetail(row.id);
              } else {
                giDrawer.openDetail(row.id);
              }
            },
          },
          {
            label: t("common.print"),
            icon: <Printer className="h-3.5 w-3.5" />,
            hidden: row.status === "DRAFT" || !isAdmin,
            disabled: !!printTargetId,
            onClick: () => handlePrintRow(row),
          },
          {
            label: t("Xóa"),
            icon: <Trash2 className="h-3.5 w-3.5" />,
            variant: "danger",
            hidden:
              row.status !== "DRAFT" ||
              (row.type === "receipt" && !canDeleteReceipt) ||
              (row.type === "issue" && !canDeleteIssue),
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
              (row.type === "issue" && !canUpdateIssue),
            onClick: () => {
              setCancelTarget(row);
            },
          },
        ]}
        createActions={[
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
                : t("phiếu xuất")) +
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
                : t("phiếu xuất")) +
              ` "${cancelTarget.voucherNo}"? ` +
              t("Hệ thống sẽ tạo một bút toán đảo để cân bằng giá trị.")
            : ""
        }
        confirmLabel={t("Hủy phiếu")}
        cancelLabel={t("Đóng")}
        onConfirm={() => {
          if (cancelTarget && cancelTarget.type === "receipt") {
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
