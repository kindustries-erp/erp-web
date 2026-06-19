/**
 * ErpWarehousePage — unified warehouse voucher list.
 * Shows both Goods Receipts (Nhập kho) and Goods Issues (Xuất kho) in one table.
 * Filter tabs: Tất cả / Nhập kho / Xuất kho
 */

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PackagePlus,
  PackageMinus,
  Trash2,
  XCircle,
  RefreshCcw,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/shared/utils";
import { Button } from "@/shared/components/ui/Button";
import { PageLayout } from "@/shared/components/PageLayout";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { FilterButton, FilterPanel } from "@/shared/components/FilterPanel";
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function KindBadge({ kind }: { kind: "receipt" | "issue" }) {
  const t = useT();
  return kind === "receipt" ? (
    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
      {t("Nhập kho")}
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200">
      {t("Xuất kho")}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ErpWarehousePage() {
  const t = useT();
  const canReadReceipts = useHasPermission("goods_receipts", "read");
  const canReadIssues = useHasPermission("goods_issues", "read");
  const showToast = useUIStore((s) => s.showToast);
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

  // ── Unified rows
  const rows: WarehouseRow[] = vouchersQuery.data?.items ?? [];
  const loading = vouchersQuery.isLoading || vouchersQuery.isFetching;
  const total = vouchersQuery.data?.total ?? 0;
  const totalPages = vouchersQuery.data?.totalPages ?? 1;

  function openGrCreate() {
    grDrawer.openCreate();
  }
  async function openGrDetail(id: string, viewOnly: boolean) {
    await grDrawer.openDetail(id, viewOnly);
  }

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
        key: "type",
        header: t("Loại"),
        className: "w-[110px]",
        cell: (row) => <KindBadge kind={row.type} />,
      },
      {
        key: "date",
        header: t("Ngày"),
        className: "w-[110px]",
        sortable: true,
        sortKey: "date",
        cell: (row) => format(new Date(row.createdAt), "dd/MM/yyyy HH:mm:ss"),
      },
      {
        key: "voucherNo",
        header: t("Số phiếu"),
        className: "w-[160px] font-mono text-sm",
        sortable: true,
        sortKey: "voucherNo",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span>{row.voucherNo}</span>
            {row.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                {t("Nháp")}
              </span>
            )}
            {row.status === "CANCELLED" && (
              <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                {t("Đã hủy")}
              </span>
            )}
          </div>
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
        cell: (row) => row.remarks ?? "—",
      },
    ],
    [],
  );

  // ── GR drawer actions (now delegated — kept for the URL-driven open logic below)

  if (!canReadReceipts && !canReadIssues) return <Forbidden />;

  return (
    <>
      <PageLayout
        title={t("Chứng từ kho")}
        desc={t("Quản lý phiếu nhập kho và xuất kho.")}
        icon={<ClipboardList className="h-5 w-5" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-2"
              disabled={loading}
              onClick={() => void vouchersQuery.refetch()}
            >
              <RefreshCcw
                className={cn("h-3.5 w-3.5 mr-1.5", loading && "animate-spin")}
              />
              <span>{t("Tải lại")}</span>
            </Button>
            <FilterButton
              onClick={() => filterPanel.togglePanel()}
              activeCount={filterPanel.activeFilterCount}
            />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg hover:bg-primary/90"
              onClick={() => openGrCreate()}
            >
              <PackagePlus className="h-3.5 w-3.5" />
              {t("Nhập kho")}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg hover:bg-primary/90"
              onClick={() => giDrawer.openCreate()}
            >
              <PackageMinus className="h-3.5 w-3.5" />
              {t("Xuất kho")}
            </button>
          </div>
        }
      >
        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        <div className="flex items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <StandardTable<WarehouseRow>
              items={rows}
              columns={columns}
              getRowKey={(r) => `${r.type}-${r.id}`}
              loading={loading}
              sortArray={
                activeSortKey
                  ? [
                      activeSortOrder === "desc"
                        ? `-${activeSortKey}`
                        : activeSortKey,
                    ]
                  : undefined
              }
              onSort={(key) => {
                if (activeSortKey === key) {
                  if (activeSortOrder === "asc") {
                    // lần 2: chuyển sang desc
                    setActiveSortOrder("desc");
                    setSortOrder("desc");
                  } else {
                    // lần 3: reset về default
                    setActiveSortKey(null);
                    setSortBy("date");
                    setSortOrder("desc");
                  }
                } else {
                  // click column mới: bắt đầu từ asc
                  setActiveSortKey(key);
                  setActiveSortOrder("asc");
                  setSortBy(key);
                  setSortOrder("asc");
                }
              }}
              emptyLabel={t("Chưa có chứng từ kho.")}
              minWidth={780}
              loadingRows={8}
              onRowClick={(row) => {
                if (row.type === "receipt") void openGrDetail(row.id, true);
                else if (row.type === "issue")
                  void giDrawer.openDetail(row.id, true);
              }}
              actions={(row) => [
                {
                  label: t("Xóa"),
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  variant: "danger",
                  hidden: row.status !== "DRAFT",
                  onClick: () => setDeleteTarget(row),
                },
                {
                  label:
                    grCancelId === row.id ? t("Đang hủy...") : t("Hủy phiếu"),
                  icon: <XCircle className="h-3.5 w-3.5" />,
                  variant: "danger",
                  hidden: row.type !== "receipt" || row.status !== "POSTED",
                  onClick: () => setCancelTarget(row),
                },
              ]}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              onPage={setPage}
              onPageSize={(v) => {
                setPage(1);
                setPageSize(v);
              }}
            />
          </div>
          <FilterPanel config={filterConfig} filter={filterPanel} />
        </div>
      </PageLayout>

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
    </>
  );
}
