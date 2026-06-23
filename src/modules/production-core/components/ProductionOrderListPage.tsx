import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Factory,
  Eye,
  Trash2,
  XCircle,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { StandardTable } from "@/shared/components/StandardTable";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { Progress } from "@/shared/components/ui/progress";

import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { bomCoreApi } from "@/modules/bom-core/api/bomCoreApi";
import { ProductionOrderDrawer } from "./ProductionOrderDrawer";
import { useProductionOrderDrawer } from "../hooks/useProductionOrderDrawer";
import { ProductionRunDrawer } from "./ProductionRunDrawer";
function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function ProductionOrderListPage() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const canRead = useHasPermission("production", "read");
  const canCreate = useHasPermission("production", "create");
  const canUpdate = useHasPermission("production", "update");

  const [orders, setOrders] = useState<ErpProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [itemOptions, setItemOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    bomCoreApi
      .list({ pageSize: 500 })
      .then((res) => {
        const uniqueFgs = new Map();
        res.items.forEach((bom) => {
          if (bom.status === "ACTIVE" && bom.finishedGoodItemId) {
            uniqueFgs.set(bom.finishedGoodItemId, {
              value: bom.finishedGoodItemId,
              label: bom.finishedGoodItemName || bom.finishedGoodItemId,
            });
          }
        });
        setItemOptions(Array.from(uniqueFgs.values()));
      })
      .catch(console.error);
  }, []);

  const filterConfig = useMemo(
    () => ({
      period: false,
      search: true,
      status: {
        options: [
          { value: "DRAFT", label: "DRAFT" },
          { value: "CONFIRMED", label: "CONFIRMED" },
          { value: "IN_PROGRESS", label: "IN_PROGRESS" },
          { value: "COMPLETED", label: "COMPLETED" },
          { value: "CANCELLED", label: "CANCELLED" },
        ],
        placeholder: t("Trạng thái"),
      },
      custom: [
        {
          key: "finishedGoodItemId",
          label: t("Thành phẩm"),
          placeholder: t("Chọn thành phẩm"),
          options: itemOptions,
          type: "combobox" as const,
        },
      ],
    }),
    [t, itemOptions],
  );

  const filter = useFilterPanel(filterConfig, () => setPage(1));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [editingOrder, setEditingOrder] = useState<ErpProductionOrder | null>(
    null,
  );
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<ErpProductionOrder | null>(
    null,
  );
  const [canceling, setCanceling] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ErpProductionOrder | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // Production run drawer state
  const [productionRunOpen, setProductionRunOpen] = useState(false);
  const [productionRunLoading, setProductionRunLoading] = useState(false);
  const [productionRunOrder, setProductionRunOrder] =
    useState<ErpProductionOrder | null>(null);

  const filterSearch = filter.state.search;
  const filterStatus = filter.state.status;
  const filterDateFrom = filter.state.dateFrom;
  const filterDateTo = filter.state.dateTo;
  const filterFinishedGood = filter.state.custom.finishedGoodItemId;

  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productionCoreApi.list({
        page,
        pageSize,
        search: filterSearch || undefined,
        status: filterStatus || undefined,
        dateFrom: filterDateFrom || undefined,
        dateTo: filterDateTo || undefined,
        finishedGoodItemId: filterFinishedGood || undefined,
        sort: sortBy
          ? [`${sortOrder === "desc" ? "-" : ""}${sortBy}`]
          : undefined,
      });
      setOrders(res.items);
      setTotal(res.total);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "";
      setError(msg || t("Không thể tải danh sách lệnh sản xuất"));
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    filterSearch,
    filterStatus,
    filterDateFrom,
    filterDateTo,
    filterFinishedGood,
    sortBy,
    sortOrder,
    t,
  ]);

  useEffect(() => {
    if (canRead) {
      loadData();
    }
  }, [loadData, canRead]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortBy(undefined);
        setSortOrder("asc");
      }
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleCreate = () => {
    setDrawerMode("create");
    setTimeout(() => setEditingOrder(null), 300);
    setDrawerOpen(true);
  };

  const handleOpenProductionRun = async (item: ErpProductionOrder) => {
    // Open immediately with skeleton; fetch detail after open.
    setDrawerOpen(false);
    setTimeout(() => setEditingOrder(null), 300);
    setProductionRunOrder(null);
    setProductionRunLoading(true);
    setProductionRunOpen(true);
    try {
      const data = await productionCoreApi.get(item.id);
      setProductionRunOrder(data);
    } catch {
      showToast({ title: t("Lỗi tải chi tiết lệnh"), variant: "destructive" });
      setProductionRunOpen(false);
    } finally {
      setProductionRunLoading(false);
    }
  };

  const handleEdit = async (id: string, viewOnly = false) => {
    setDrawerMode(viewOnly ? "view" : "edit");
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const data = await productionCoreApi.get(id);
      setEditingOrder(data);
    } catch {
      showToast({ title: t("Lỗi tải chi tiết"), variant: "destructive" });
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await productionCoreApi.cancel(cancelTarget.id);
      showToast({ title: t("Đã hủy lệnh sản xuất"), variant: "success" });
      setCancelTarget(null);
      loadData();
    } catch (e: unknown) {
      const errMsg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      showToast({
        title:
          errMsg ||
          (e instanceof Error ? e.message : "") ||
          t("Không thể hủy lệnh"),
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productionCoreApi.remove(deleteTarget.id);
      showToast({ title: t("Đã xóa lệnh sản xuất nháp"), variant: "success" });
      setDeleteTarget(null);
      loadData();
    } catch (e: unknown) {
      const errMsg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      showToast({
        title:
          errMsg ||
          (e instanceof Error ? e.message : "") ||
          t("Không thể xóa lệnh"),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const drawerState = useProductionOrderDrawer({
    open: drawerOpen,
    editing: editingOrder,
    onClose: () => {
      setDrawerOpen(false);
      setTimeout(() => setEditingOrder(null), 300);
    },
    onSaved: loadData,
  });

  const columns = useMemo(
    () => [
      {
        key: "referenceNo",
        header: t("Mã lệnh"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "reference_no",
        cell: (item: ErpProductionOrder) => (
          <div className="w-full text-center">
            <span
              className="cursor-pointer font-medium text-emerald-600 hover:underline"
              onClick={() => handleEdit(item.id, !canUpdate)}
            >
              {item.referenceNo || item.id.split("-")[0]}
            </span>
          </div>
        ),
      },
      {
        key: "finishedGoodItemName",
        header: t("Thành phẩm"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "finished_good_item_name",
        cell: (item: ErpProductionOrder) => (
          <div className="w-full text-center">
            {item.finishedGoodItemName || item.finishedGoodItemId || "—"}
          </div>
        ),
      },
      {
        key: "plannedStartDate",
        header: t("Ngày bắt đầu"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "planned_start_date",
        cell: (item: ErpProductionOrder) => (
          <div className="w-full text-center">
            {fmtDate(item.plannedStartDate)}
          </div>
        ),
      },
      {
        key: "plannedEndDate",
        header: t("Ngày kết thúc"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "planned_end_date",
        cell: (item: ErpProductionOrder) => (
          <div className="w-full text-center">
            {fmtDate(item.plannedEndDate)}
          </div>
        ),
      },
      {
        key: "qtyProduced",
        header: t("Tiến độ"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "qty_produced",
        cell: (item: ErpProductionOrder) => {
          const produced = Number(item.qtyProduced) || 0;
          const target = Number(item.qtyToProduce) || 0;
          const percent =
            target > 0 ? Math.min((produced / target) * 100, 100) : 0;

          let indicatorColor = "bg-slate-400";
          if (percent === 100) indicatorColor = "bg-emerald-500";
          else if (percent > 0) indicatorColor = "bg-blue-500";

          return (
            <div className="flex flex-col gap-1 w-28 mx-auto">
              <div className="flex items-center justify-between text-[11px] font-medium leading-none">
                <span className="text-slate-700">{Math.round(percent)}%</span>
                <span className="text-slate-500">
                  ({fmtQty(item.qtyProduced)} / {fmtQty(item.qtyToProduce)})
                </span>
              </div>
              <Progress
                value={percent}
                className="h-1.5 bg-slate-200"
                indicatorClassName={indicatorColor}
              />
            </div>
          );
        },
      },
      {
        key: "status",
        header: t("Trạng thái"),
        headerClassName: "text-center",
        className: "align-middle text-center",
        sortable: true,
        sortKey: "status",
        cell: (item: ErpProductionOrder) => (
          <div className="w-full text-center">
            <span
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                item.status === "COMPLETED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : item.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : item.status === "CANCELLED"
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              {item.status || "—"}
            </span>
          </div>
        ),
      },
    ],
    [t, canUpdate],
  );

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title={t("Lệnh Sản Xuất")}
      desc={t("Quản lý và theo dõi tiến độ lệnh sản xuất.")}
      icon={<Factory className="h-5 w-5" />}
      actions={
        <TableActionGroup
          loading={loading}
          onRefresh={loadData}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={canCreate ? handleCreate : undefined}
          createLabel={t("Tạo mới")}
        />
      }
    >
      {error && (
        <div className="mb-4 text-xs text-[color:var(--warn-fg)] bg-[color:var(--warn-bg)] border border-[color:var(--warn-fg)]/30 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex items-start">
        <div className="flex-1 min-w-0 space-y-4">
          <StandardTable<ErpProductionOrder>
            tableId="erp-production-table"
            items={orders}
            columns={columns}
            getRowKey={(i) => i.id}
            loading={loading}
            emptyLabel={t("Chưa có lệnh sản xuất nào")}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={Math.ceil(total / pageSize)}
            onPage={setPage}
            onPageSize={setPageSize}
            onRowClick={(item) => handleEdit(item.id, true)}
            actions={(item) => [
              {
                groupLabel: t("Tra cứu"),
                items: [
                  {
                    label: t("Chi tiết"),
                    onClick: () => handleEdit(item.id, true),
                    icon: <Eye className="h-[13px] w-[13px]" />,
                  },
                ],
              },
              {
                groupLabel: t("Thao tác"),
                items: [
                  {
                    label:
                      item.status === "IN_PROGRESS"
                        ? t("Tiếp tục sản xuất")
                        : item.status === "COMPLETED"
                          ? t("Xem kết quả sản xuất")
                          : t("Tiến hành sản xuất"),
                    onClick: () => handleOpenProductionRun(item),
                    icon:
                      item.status === "IN_PROGRESS" ? (
                        <ArrowRight className="h-[13px] w-[13px] text-blue-600" />
                      ) : item.status === "COMPLETED" ? (
                        <CheckCircle2 className="h-[13px] w-[13px] text-emerald-600" />
                      ) : (
                        <PlayCircle className="h-[13px] w-[13px]" />
                      ),
                    hidden:
                      !canUpdate ||
                      !["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(
                        item.status || "",
                      ),
                  },
                  {
                    label:
                      item.status === "DRAFT" ? t("Xóa lệnh") : t("Hủy lệnh"),
                    onClick: () =>
                      item.status === "DRAFT"
                        ? setDeleteTarget(item)
                        : setCancelTarget(item),
                    icon:
                      item.status === "DRAFT" ? (
                        <Trash2 className="h-[13px] w-[13px]" />
                      ) : (
                        <XCircle className="h-[13px] w-[13px]" />
                      ),
                    variant: "danger",
                    hidden:
                      !canUpdate ||
                      (item.status !== "DRAFT" && item.status !== "CONFIRMED"),
                  },
                ],
              },
            ]}
            sortArray={
              sortBy
                ? [`${sortOrder === "desc" ? "-" : ""}${sortBy}`]
                : undefined
            }
            onSort={handleSort}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <ProductionOrderDrawer
        open={drawerOpen}
        loading={drawerLoading}
        editing={editingOrder}
        viewOnly={drawerMode === "view"}
        onClose={() => {
          setDrawerOpen(false);
          setTimeout(() => setEditingOrder(null), 300);
        }}
        onToggleEdit={
          drawerMode === "view" &&
          canUpdate &&
          editingOrder?.status !== "CANCELLED"
            ? () => setDrawerMode("edit")
            : undefined
        }
        onSaved={loadData}
        drawerState={drawerState}
        productionRunOpen={
          productionRunOpen &&
          !!productionRunOrder &&
          !!editingOrder &&
          productionRunOrder.id === editingOrder.id
        }
        onOpenProductionRun={() => {
          if (editingOrder) {
            setProductionRunOrder(editingOrder);
            setProductionRunOpen(true);
          }
        }}
        onCloseProductionRun={() => setProductionRunOpen(false)}
      />

      {deleteTarget && (
        <ConfirmModal
          open={true}
          title={t("Xóa lệnh sản xuất nháp")}
          message={t(
            `Bạn có chắc muốn xóa lệnh sản xuất ${deleteTarget.referenceNo || deleteTarget.id}? Hành động này không thể hoàn tác.`,
          )}
          confirmLabel={t("Xác nhận xóa")}
          danger={true}
          onConfirm={handleDeleteOrder}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          open={true}
          title={t("Hủy lệnh sản xuất")}
          message={t(
            `Bạn có chắc muốn hủy lệnh sản xuất ${cancelTarget.referenceNo || cancelTarget.id}? Hành động này không thể hoàn tác và sẽ hoàn trả các nguyên vật liệu đã xuất (nếu có).`,
          )}
          confirmLabel={t("Xác nhận hủy")}
          danger={true}
          onConfirm={handleCancelOrder}
          onCancel={() => setCancelTarget(null)}
          loading={canceling}
        />
      )}

      {/* Standalone production run drawer — opened directly from list quick action */}
      {productionRunOpen && !drawerOpen && (
        <ProductionRunDrawer
          open={true}
          loading={productionRunLoading}
          order={productionRunOrder}
          onClose={() => {
            setProductionRunOpen(false);
            setProductionRunOrder(null);
            setProductionRunLoading(false);
          }}
          onRefresh={loadData}
        />
      )}
    </PageLayout>
  );
}
