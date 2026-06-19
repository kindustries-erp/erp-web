/**
 * ErpWarehousePage — unified warehouse voucher list.
 * Shows both Goods Receipts (Nhập kho) and Goods Issues (Xuất kho) in one table.
 * Filter tabs: Tất cả / Nhập kho / Xuất kho
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  PackagePlus,
  PackageMinus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Pencil,
  Plus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ReceiptText,
  Trash2,
  XCircle,
  RefreshCcw,
  ClipboardList,
  Eye,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BookCheck,
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
import { type DrawerAction } from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { goodsReceiptsCoreApi } from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  goodsIssuesCoreApi,
  type CreateGiPayload,
  type ErpGoodsIssue,
} from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { manufacturingApi } from "@/modules/manufacturing/api/manufacturingApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useUIStore } from "@/core/config/uiStore";
import { useWarehouseVouchersQuery } from "@/modules/inventory-core/hooks/useWarehouseVoucherQueries";
import type { WarehouseRow } from "@/modules/inventory-core/api/warehouseVouchersCoreApi";
import { GrFormDrawer } from "@/modules/goods-receipts-core/components/GrFormDrawer";
import { useGrDrawer } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

const LOOKUP_LIMIT = 200;
const ISSUE_TYPE_OPTIONS = [
  { value: "SALE", label: "SALE — Xuất bán" },
  { value: "OTHER", label: "OTHER — Xuất khác" },
];
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "POSTED", label: "Đã vào sổ" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// ─── GI Form types ────────────────────────────────────────────────────────────

interface GiLineForm {
  salesOrderLineId: string;
  itemId: string;
  itemName: string;
  serialId: string;
  vehicleId: string;
  qtyIssued: string;
  unitCost: string;
}
interface GiForm {
  issueNo: string;
  issueDate: string;
  issueType: string;
  customerId: string;
  status: string;
  remarks: string;
  lines: GiLineForm[];
}
const emptyGiLine = (): GiLineForm => ({
  salesOrderLineId: "",
  itemId: "",
  itemName: "",
  serialId: "",
  vehicleId: "",
  qtyIssued: "1",
  unitCost: "",
});
const emptyGiForm = (): GiForm => ({
  issueNo: "",
  issueDate: new Date().toISOString().slice(0, 10),
  issueType: "SALE",
  customerId: "",
  status: "DRAFT",
  remarks: "",
  lines: [emptyGiLine()],
});
function buildGiForm(gi: ErpGoodsIssue): GiForm {
  return {
    issueNo: gi.issueNo ?? "",
    issueDate: gi.issueDate ? gi.issueDate.slice(0, 10) : "",
    issueType: gi.issueType ?? "SALE",
    customerId: gi.customerId ?? "",
    status: gi.status ?? "DRAFT",
    remarks: gi.remarks ?? "",
    lines: gi.lines?.length
      ? gi.lines.map((line) => ({
          salesOrderLineId: line.salesOrderLineId ?? "",
          itemId: line.itemId ?? "",
          itemName: line.itemName ?? "",
          serialId: line.serialId ?? "",
          vehicleId: line.vehicleId ?? "",
          qtyIssued: line.qtyIssued ?? "1",
          unitCost: line.unitCost ?? "",
        }))
      : [emptyGiLine()],
  };
}
function buildGiPayload(form: GiForm): CreateGiPayload {
  return {
    issueNo: form.issueNo.trim(),
    issueDate: form.issueDate,
    issueType: form.issueType || "SALE",
    customerId: form.customerId || undefined,
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      salesOrderLineId: line.salesOrderLineId || undefined,
      itemId: line.itemId || undefined,
      itemName: line.itemName || undefined,
      serialId: line.serialId || undefined,
      vehicleId: line.vehicleId || undefined,
      qtyIssued: line.qtyIssued,
      unitCost: line.unitCost || undefined,
    })),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StatusBadge({ status }: { status?: string | null }) {
  const s = status ?? "DRAFT";
  let cls =
    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ";
  if (s === "POSTED") cls += "bg-emerald-50 text-emerald-700 ring-emerald-200";
  else if (s === "VOIDED" || s === "CANCELLED")
    cls += "bg-red-50 text-red-600 ring-red-200";
  else cls += "bg-amber-50 text-amber-700 ring-amber-200";
  return <span className={cls}>{s}</span>;
}

function KindBadge({ kind }: { kind: "receipt" | "issue" }) {
  return kind === "receipt" ? (
    <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 ring-1 ring-blue-200">
      Nhập kho
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200">
      Xuất kho
    </span>
  );
}

type TabFilter = "all" | "receipt" | "issue";

// ─── Main page ────────────────────────────────────────────────────────────────

export function ErpWarehousePage() {
  const canReadReceipts = useHasPermission("goods_receipts", "read");
  const canReadIssues = useHasPermission("goods_issues", "read");
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  // ── filter state (same pattern as page mua hàng)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tabFilter, setTabFilter] = useState<TabFilter>("all");

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

  // ── GI drawer state
  const [giDrawerOpen, setGiDrawerOpen] = useState(false);
  const [giDrawerLoading, setGiDrawerLoading] = useState(false);
  const [giEditing, setGiEditing] = useState<ErpGoodsIssue | null>(null);
  const [giViewOnly, setGiViewOnly] = useState(false);
  const [giForm, setGiForm] = useState<GiForm>(emptyGiForm);
  const [giSaveError, setGiSaveError] = useState<string | null>(null);
  const [giSaving, setGiSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [giPostingId, setGiPostingId] = useState<string | null>(null);

  // Lookup hooks for basic masters
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [supplierSearch, setSupplierSearch] = useState("");
  const {
    data: suppliersData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchNextPage: fetchNextSuppliers,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetchingNextPage: loadingSuppliers,
  } = useBasicMasterInfinite({
    search: supplierSearch,
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

  const [customerSearch, setCustomerSearch] = useState("");
  const {
    data: customersData,
    fetchNextPage: fetchNextCustomers,
    isFetchingNextPage: loadingCustomers,
  } = useBasicMasterInfinite({
    search: customerSearch,
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

  const [vehicleOptions, setVehicleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const filterConfig: FilterPanelConfig = {
    search: true,
    period: true,
    status: {
      placeholder: "Trạng thái",
      options: STATUS_OPTIONS,
    },
    custom: [
      {
        key: "partnerId",
        label: "Đối tác",
        placeholder: "Tất cả đối tác",
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
    type: tabFilter === "all" ? undefined : tabFilter,
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

  // ── Item search (for GI drawer item combobox)
  const [itemSearch, setItemSearch] = useState("");
  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingItems,
  } = useBasicMasterInfinite({
    search: itemSearch,
    limit: 50,
    entities: "inventoryItems",
  });
  const itemOptions = useMemo(
    () =>
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
        })),
      ) ?? [],
    [itemsData],
  );

  // ── Load GI lookups
  const loadGiLookups = useCallback(async () => {
    try {
      const vehRes = await manufacturingApi.listVehicles({
        page: 1,
        pageSize: LOOKUP_LIMIT,
      });
      const vehList = vehRes.items ?? [];
      setVehicleOptions(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vehList.map((v: any) => ({
          value: v.id,
          label: `${v.frame_no ?? v.vin ?? v.id}${v.engine_no ? ` / ${v.engine_no}` : ""}`,
        })),
      );
    } catch {
      /* silent */
    }
  }, []);

  function openGrCreate() {
    grDrawer.openCreate();
  }
  async function openGrDetail(id: string, viewOnly: boolean) {
    await grDrawer.openDetail(id, viewOnly);
  }

  // ── GI open helpers
  function openGiCreate() {
    setGiEditing(null);
    setGiViewOnly(false);
    setGiForm(emptyGiForm());
    setGiSaveError(null);
    void loadGiLookups();
    setGiDrawerOpen(true);
  }
  async function openGiDetail(id: string, viewOnly: boolean) {
    setGiViewOnly(viewOnly);
    setGiSaveError(null);
    setGiDrawerLoading(true);
    setGiDrawerOpen(true);
    void loadGiLookups();
    try {
      const detail = await goodsIssuesCoreApi.get(id);
      setGiEditing(detail);
      setGiForm(buildGiForm(detail));
    } finally {
      setGiDrawerLoading(false);
    }
  }

  // ── GR cancel (still used for the cancel confirm modal)
  async function handleGrCancel(id: string) {
    await grDrawer.handleCancel(id);
    setCancelTarget(null);
  }

  // ── GI save / post
  async function handleGiSave(statusOverride?: string) {
    setGiSaving(true);
    setGiSaveError(null);
    try {
      const payload = buildGiPayload(giForm);
      if (statusOverride) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload as any).status = statusOverride;
      }
      if (giEditing) {
        await goodsIssuesCoreApi.update(giEditing.id, payload);
        if (statusOverride === "POSTED") {
          await goodsIssuesCoreApi.post(giEditing.id);
        }
        showToast({ title: "Đã cập nhật phiếu xuất kho", variant: "success" });
      } else {
        const created = await goodsIssuesCoreApi.create(payload);
        if (statusOverride === "POSTED") {
          await goodsIssuesCoreApi.post(created.id);
        }
        showToast({
          title: "Tạo phiếu xuất kho thành công",
          variant: "success",
        });
      }
      setGiDrawerOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "unified"],
      });
    } catch (e) {
      setGiSaveError(e instanceof Error ? e.message : "Lỗi lưu phiếu xuất kho");
    } finally {
      setGiSaving(false);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleGiPost(id: string) {
    setGiPostingId(id);
    try {
      await goodsIssuesCoreApi.post(id);
      showToast({ title: "Đã ghi sổ phiếu xuất kho", variant: "success" });
      await queryClient.invalidateQueries({
        queryKey: ["warehouse-vouchers", "unified"],
      });
    } catch (e) {
      showToast({
        title: e instanceof Error ? e.message : "Lỗi ghi sổ",
        variant: "destructive",
      });
    } finally {
      setGiPostingId(null);
    }
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
        header: "Loại",
        className: "w-[110px]",
        cell: (row) => <KindBadge kind={row.type} />,
      },
      {
        key: "date",
        header: "Ngày",
        className: "w-[160px]",
        sortable: true,
        sortKey: "date",
        cell: (row) => format(new Date(row.createdAt), "dd/MM/yyyy HH:mm:ss"),
      },
      {
        key: "voucherNo",
        header: "Số phiếu",
        className: "w-[160px] font-mono text-sm",
        sortable: true,
        sortKey: "voucherNo",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span>{row.voucherNo}</span>
            {row.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                Nháp
              </span>
            )}
            {row.status === "CANCELLED" && (
              <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                Đã Hủy
              </span>
            )}
          </div>
        ),
      },
      {
        key: "poNo",
        header: "Số PO",
        className: "w-[160px] font-mono text-sm",
        cell: (row) => row.poNo ?? "—",
      },
      {
        key: "partnerName",
        header: "Đối tác",
        cell: (row) => row.partnerName ?? "—",
      },
      {
        key: "remarks",
        header: "Ghi chú",
        cell: (row) => row.remarks ?? "—",
      },
    ],
    [],
  );

  // ── GR drawer actions (now delegated — kept for the URL-driven open logic below)

  // ── GI drawer actions
  const giDrawerActions: DrawerAction[] = giViewOnly
    ? [{ label: "Đóng", onClick: () => setGiDrawerOpen(false) }]
    : [
        {
          label: "Hủy",
          onClick: () => setGiDrawerOpen(false),
          variant: "outline",
        },
        {
          label: "Lưu nháp",
          onClick: () => void handleGiSave("DRAFT"),
          variant: "secondary",
          loading: giSaving,
        },
        {
          label: giEditing ? "Cập nhật" : "Tạo mới",
          onClick: () => void handleGiSave("POSTED"),
          primary: true,
          loading: giSaving,
        },
      ];

  if (!canReadReceipts && !canReadIssues) return <Forbidden />;

  return (
    <>
      <PageLayout
        title="Chứng từ kho"
        desc="Quản lý phiếu nhập kho và xuất kho."
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
              <span>Tải lại</span>
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
              Nhập kho
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg hover:bg-primary/90"
              onClick={openGiCreate}
            >
              <PackageMinus className="h-3.5 w-3.5" />
              Xuất kho
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
              emptyLabel="Chưa có chứng từ kho."
              minWidth={780}
              loadingRows={8}
              actions={(row) => [
                {
                  label: "Chi tiết",
                  icon: <Eye className="h-3.5 w-3.5" />,
                  onClick: () => {
                    if (row.type === "receipt") void openGrDetail(row.id, true);
                    else if (row.type === "issue")
                      void openGiDetail(row.id, true);
                  },
                },
                {
                  label: "Xóa",
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  variant: "danger",
                  hidden: row.status !== "DRAFT",
                  onClick: () => setDeleteTarget(row),
                },
                {
                  label: grCancelId === row.id ? "Đang hủy..." : "Hủy phiếu",
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
        title="Xác nhận xóa"
        message={
          deleteTarget
            ? `Xóa ${deleteTarget.type === "receipt" ? "phiếu nhập" : "phiếu xuất"} "${deleteTarget.voucherNo}"? Hành động này sẽ ẩn phiếu này khỏi danh sách.`
            : ""
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!cancelTarget}
        title="Xác nhận hủy phiếu"
        message={
          cancelTarget
            ? `Hủy ${cancelTarget.type === "receipt" ? "phiếu nhập" : "phiếu xuất"} "${cancelTarget.voucherNo}"? Hệ thống sẽ tạo một bút toán đảo để cân bằng giá trị.`
            : ""
        }
        confirmLabel="Hủy phiếu"
        cancelLabel="Đóng"
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
      <StandardFormDrawer
        open={giDrawerOpen}
        mode={giViewOnly ? "view" : giEditing ? "edit" : "create"}
        onClose={() => setGiDrawerOpen(false)}
        onToggleEdit={
          giViewOnly &&
          giEditing &&
          !["POSTED", "CANCELLED", "VOIDED"].includes(
            giEditing.status || "DRAFT",
          )
            ? () => setGiViewOnly(false)
            : undefined
        }
        title={
          giEditing
            ? giViewOnly
              ? "Phiếu xuất kho"
              : "Sửa xuất kho"
            : "Tạo phiếu xuất kho"
        }
        subtitle={
          <div className="flex items-center gap-2">
            <span>{giEditing?.issueNo ?? "Xuất kho"}</span>
            {giEditing?.status === "DRAFT" && (
              <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                Nháp
              </span>
            )}
            {giEditing?.status === "CANCELLED" && (
              <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
                Đã hủy
              </span>
            )}
          </div>
        }
        actions={giDrawerActions}
        rightPanelTitle="Thông tin chung"
        leftPanel={
          <>
            {giSaveError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {giSaveError}
              </div>
            )}

            {giDrawerLoading ? (
              <DrawerSection title="Dòng xuất kho">
                <div className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </DrawerSection>
            ) : (
              <DrawerSection title={`Dòng xuất kho (${giForm.lines.length})`}>
                {giForm.lines.map((line, idx) => {
                  if (giViewOnly && Number(line.qtyIssued) <= 0) return null;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-muted/10 p-3 mb-2 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Dòng {idx + 1}
                        </span>
                        {!giViewOnly && (
                          <button
                            type="button"
                            className="text-xs text-red-500 hover:underline"
                            onClick={() =>
                              setGiForm((f) => ({
                                ...f,
                                lines: f.lines.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                      <DrawerField label="Hàng hóa">
                        <Combobox
                          options={itemOptions}
                          value={line.itemId}
                          disabled={giViewOnly}
                          placeholder="Chọn inventory item"
                          searchPlaceholder="Tìm SKU / tên"
                          onSearch={setItemSearch}
                          onScrollBottom={fetchNextItems}
                          loading={loadingItems}
                          onChange={(v) => {
                            const found = itemOptions.find(
                              (o) => o.value === v,
                            );
                            setGiForm((f) => {
                              const lines = [...f.lines];
                              lines[idx] = {
                                ...lines[idx],
                                itemId: v,
                                itemName: found?.label ?? "",
                              };
                              return { ...f, lines };
                            });
                          }}
                        />
                      </DrawerField>
                      <div className="flex gap-2">
                        <DrawerField label="Số lượng">
                          <input
                            type="number"
                            className={cn(inputCls, "w-28")}
                            value={line.qtyIssued}
                            disabled={giViewOnly}
                            onChange={(e) => {
                              const v = e.target.value;
                              setGiForm((f) => {
                                const lines = [...f.lines];
                                lines[idx] = { ...lines[idx], qtyIssued: v };
                                return { ...f, lines };
                              });
                            }}
                          />
                        </DrawerField>
                        <DrawerField label="Đơn giá">
                          <input
                            type="number"
                            className={cn(inputCls, "w-28")}
                            value={line.unitCost}
                            disabled={giViewOnly}
                            placeholder="Tùy chọn"
                            onChange={(e) => {
                              const v = e.target.value;
                              setGiForm((f) => {
                                const lines = [...f.lines];
                                lines[idx] = { ...lines[idx], unitCost: v };
                                return { ...f, lines };
                              });
                            }}
                          />
                        </DrawerField>
                      </div>
                      {vehicleOptions.length > 0 && (
                        <DrawerField label="Xe (tùy chọn)">
                          <Combobox
                            options={vehicleOptions}
                            value={line.vehicleId}
                            disabled={giViewOnly}
                            placeholder="Chọn xe..."
                            onChange={(v) => {
                              setGiForm((f) => {
                                const lines = [...f.lines];
                                lines[idx] = { ...lines[idx], vehicleId: v };
                                return { ...f, lines };
                              });
                            }}
                          />
                        </DrawerField>
                      )}
                    </div>
                  );
                })}
                {!giViewOnly && (
                  <button
                    type="button"
                    className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline"
                    onClick={() =>
                      setGiForm((f) => ({
                        ...f,
                        lines: [...f.lines, emptyGiLine()],
                      }))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm dòng hàng
                  </button>
                )}
              </DrawerSection>
            )}
          </>
        }
        rightPanel={
          giDrawerLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-1">
              <DrawerField label="Số phiếu xuất" required>
                <input
                  className={inputCls}
                  value={giForm.issueNo}
                  disabled={giViewOnly || !!giEditing}
                  onChange={(e) =>
                    setGiForm((f) => ({ ...f, issueNo: e.target.value }))
                  }
                  placeholder="GI-YYYYMMDD-001"
                />
              </DrawerField>
              <DrawerField label="Ngày xuất" required>
                <input
                  type="date"
                  className={inputCls}
                  value={giForm.issueDate}
                  disabled={giViewOnly}
                  onChange={(e) =>
                    setGiForm((f) => ({ ...f, issueDate: e.target.value }))
                  }
                />
              </DrawerField>
              <DrawerField label="Loại xuất" required>
                <Combobox
                  options={ISSUE_TYPE_OPTIONS}
                  value={giForm.issueType}
                  disabled={giViewOnly}
                  allowClear={false}
                  onChange={(v) =>
                    setGiForm((f) => ({ ...f, issueType: v || "SALE" }))
                  }
                />
              </DrawerField>
              <DrawerField label="Khách hàng">
                <Combobox
                  options={customerOptions}
                  value={giForm.customerId}
                  disabled={giViewOnly}
                  placeholder="Chọn khách hàng"
                  searchPlaceholder="Tìm khách hàng"
                  onSearch={setCustomerSearch}
                  onScrollBottom={fetchNextCustomers}
                  loading={loadingCustomers}
                  onChange={(v) => setGiForm((f) => ({ ...f, customerId: v }))}
                />
              </DrawerField>
              <DrawerField label="Trạng thái">
                <Combobox
                  options={STATUS_OPTIONS}
                  value={giForm.status}
                  disabled={giViewOnly}
                  allowClear={false}
                  onChange={(v) =>
                    setGiForm((f) => ({ ...f, status: v || "DRAFT" }))
                  }
                />
              </DrawerField>
              <DrawerField label="Ghi chú">
                <textarea
                  className={`${inputCls} min-h-[60px] resize-y`}
                  value={giForm.remarks}
                  disabled={giViewOnly}
                  onChange={(e) =>
                    setGiForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                />
              </DrawerField>
            </div>
          )
        }
      />
    </>
  );
}
