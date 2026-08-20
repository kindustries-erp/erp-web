import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Factory,
  Eye,
  Trash2,
  XCircle,
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { Progress } from "@/shared/components/ui/progress";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";

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
  const canDelete = useHasPermission("production", "delete");

  const [orders, setOrders] = useState<ErpProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
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

  const [xlsxExportingId, setXlsxExportingId] = useState<string | null>(null);

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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const handleExportXlsx = useCallback(
    async (id: string, refNo?: string | null) => {
      try {
        setXlsxExportingId(id);
        const blob = await productionCoreApi.exportXlsx(id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `LenhSanXuat_${refNo || id.split("-")[0]}.xlsx`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        console.error(err);
        showToast({
          title: t("Lỗi xuất file"),
          description:
            err.response?.data?.message || t("Đã xảy ra lỗi khi xuất Excel."),
          variant: "destructive",
        });
      } finally {
        setXlsxExportingId(null);
      }
    },
    [showToast, t],
  );

  const columns = useMemo(
    () => [
      {
        key: "referenceNo",
        header: (
          <TableColumnHeaderFilter
            title={t("Mã lệnh")}
            sortState={sortBy === "reference_no" ? sortOrder : "none"}
            onSortChange={() => handleSort("reference_no")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="reference_no"
            align="center"
          />
        ),
        sortable: false,
        size: 200,
        enableResizing: true,
        cell: (item: ErpProductionOrder) => (
          <div className="flex items-center gap-2 w-full">
            <TableText
              text={item.referenceNo || item.id.split("-")[0]}
              enableCopy={true}
              tooltip={true}
              onDetailClick={(e) => {
                e?.stopPropagation();
                handleEdit(item.id, !canUpdate);
              }}
            />
            {(item.status === "DRAFT" || item.status === "CANCELLED") && (
              <Badge
                variant={
                  item.status === "CANCELLED" ? "destructive" : "secondary"
                }
                className="text-[10px] px-1 py-0 h-4 flex-shrink-0"
              >
                {item.status === "CANCELLED" ? t("Hủy") : t("Nháp")}
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "plannedStartDate",
        header: (
          <TableColumnHeaderFilter
            title={t("Ngày bắt đầu")}
            sortState={sortBy === "planned_start_date" ? sortOrder : "none"}
            onSortChange={() => handleSort("planned_start_date")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="planned_start_date"
            hideFilter={true}
            hideFooter={true}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={filterDateFrom}
                dateTo={filterDateTo}
                onChange={(from, to) => {
                  filter.setDateFrom(from);
                  filter.setDateTo(to);
                  setPage(1);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        sortable: false,
        enableResizing: true,
        cell: (item: ErpProductionOrder) => (
          <div className="w-full">{fmtDate(item.plannedStartDate)}</div>
        ),
      },
      {
        key: "plannedEndDate",
        header: (
          <TableColumnHeaderFilter
            title={t("Ngày kết thúc")}
            sortState={sortBy === "planned_end_date" ? sortOrder : "none"}
            onSortChange={() => handleSort("planned_end_date")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="planned_end_date"
            hideFilter={true}
            hideFooter={true}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={filterDateFrom}
                dateTo={filterDateTo}
                onChange={(from, to) => {
                  filter.setDateFrom(from);
                  filter.setDateTo(to);
                  setPage(1);
                  close();
                }}
                onClose={close}
              />
            )}
          />
        ),
        sortable: false,
        enableResizing: true,
        cell: (item: ErpProductionOrder) => (
          <div className="w-full">{fmtDate(item.plannedEndDate)}</div>
        ),
      },
      {
        key: "finishedGoodItemName",
        header: (
          <TableColumnHeaderFilter
            title={t("Thành phẩm")}
            sortState={
              sortBy === "finished_good_item_name" ? sortOrder : "none"
            }
            onSortChange={() => handleSort("finished_good_item_name")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="finished_good_item_name"
            align="center"
          />
        ),
        sortable: false,
        enableResizing: true,
        cell: (item: ErpProductionOrder) => (
          <div className="w-full">
            <Tooltip
              content={
                item.finishedGoodItemName || item.finishedGoodItemId || "—"
              }
            >
              <span className="block truncate max-w-[200px]">
                {item.finishedGoodItemName || item.finishedGoodItemId || "—"}
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        key: "bomVersion",
        header: (
          <TableColumnHeaderFilter
            title={t("Phiên bản BOM")}
            sortState={sortBy === "bomVersion" ? sortOrder : "none"}
            onSortChange={() => handleSort("bomVersion")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="bomVersion"
            align="center"
          />
        ),
        sortable: false,
        size: 150,
        enableResizing: true,
        cell: (item: ErpProductionOrder) => (
          <div className="w-full">{item.bomVersion || "—"}</div>
        ),
      },
      {
        key: "qtyProduced",
        header: (
          <TableColumnHeaderFilter
            title={t("Tiến độ")}
            sortState={sortBy === "qty_produced" ? sortOrder : "none"}
            onSortChange={() => handleSort("qty_produced")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="qty_produced"
            align="center"
          />
        ),
        sortable: false,
        enableResizing: true,
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
        header: (
          <TableColumnHeaderFilter
            title={t("Trạng thái")}
            sortState={sortBy === "status" ? sortOrder : "none"}
            onSortChange={() => handleSort("status")}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            fetchOptions={productionCoreApi.getProductionOrderColumnOptions}
            columnKey="status"
            filterOptions={[
              { value: "DRAFT", label: t("Nháp") },
              { value: "IN_PROGRESS", label: t("Đang thực hiện") },
              { value: "COMPLETED", label: t("Hoàn thành") },
              { value: "CANCELLED", label: t("Hủy") },
            ]}
            align="center"
          />
        ),
        sortable: false,
        enableResizing: true,
        cell: (item: ErpProductionOrder) => {
          let variant:
            | "default"
            | "secondary"
            | "destructive"
            | "outline"
            | "ghost";
          const label = item.status || "—";
          if (item.status === "COMPLETED") {
            variant = "default";
          } else if (item.status === "IN_PROGRESS") {
            variant = "secondary";
          } else if (item.status === "CANCELLED") {
            variant = "destructive";
          } else {
            variant = "outline";
          }

          return (
            <div className="w-full">
              <Badge
                variant={variant}
                className={
                  item.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200"
                    : item.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
                      : item.status === "CANCELLED"
                        ? "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200"
                }
              >
                {label}
              </Badge>
            </div>
          );
        },
      },
    ],
    [t, canUpdate, sortBy, sortOrder],
  );

  if (!canRead) return <Forbidden />;

  return (
    <SpreadsheetPageTemplate
      title={t("Lệnh Sản Xuất")}
      desc={t("Quản lý và theo dõi tiến độ lệnh sản xuất.")}
      icon={<Factory className="h-5 w-5" />}
      tableId="erp-production-table"
      items={orders}
      columns={columns}
      getRowKey={(i) => i.id}
      loading={loading}
      error={error}
      emptyLabel={t("Chưa có lệnh sản xuất nào")}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={Math.ceil(total / pageSize)}
      onPage={setPage}
      onPageSize={setPageSize}
      onRefresh={loadData}
      createActions={
        canCreate
          ? [
              {
                groupLabel: t("groupThemMoi", "Thêm mới"),
                items: [
                  {
                    label: t("common.create", "Tạo mới"),
                    icon: <Plus className="w-4 h-4 text-emerald-600" />,
                    onClick: handleCreate,
                  },
                ],
              },
            ]
          : undefined
      }
      filterConfig={filterConfig}
      filter={filter}
      activeFilterCount={filter.activeFilterCount}
      onClearAllFilters={filter.resetAll}
      sortArray={
        sortBy ? [`${sortOrder === "desc" ? "-" : ""}${sortBy}`] : undefined
      }
      onSort={handleSort}
      rowActions={(item) => [
        {
          groupLabel: t("Tra cứu"),
          items: [
            {
              label: t("Chi tiết"),
              onClick: () => handleEdit(item.id, true),
              icon: <Eye className="h-[13px] w-[13px]" />,
            },
            {
              label: t("Xuất XLSX"),
              onClick: () => handleExportXlsx(item.id, item.referenceNo),
              icon: <FileSpreadsheet className="h-[13px] w-[13px]" />,
              disabled: xlsxExportingId === item.id,
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
              label: item.status === "DRAFT" ? t("Xóa lệnh") : t("Hủy lệnh"),
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
                !canDelete ||
                (item.status !== "DRAFT" && item.status !== "CONFIRMED"),
            },
          ],
        },
      ]}
    >
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
    </SpreadsheetPageTemplate>
  );
}
