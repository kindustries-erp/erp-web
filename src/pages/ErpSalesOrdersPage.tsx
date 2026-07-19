import { useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  RotateCcw,
  Trash2,
  XCircle,
  PackagePlus,
  Eye,
  FileText,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { useSalesOrdersQuery } from "@/modules/sales-orders-core/hooks/useSalesOrdersQuery";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import { updateEntityTags } from "@/modules/tags/api/tagsApi";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { StatusBadge } from "@/shared/components/badges";
import { DeliveryConfirmModal } from "@/modules/sales-orders-core/components/DeliveryConfirmModal";
import { Button } from "@/shared/components/ui/Button";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";

import {
  SoFormDrawer,
  type SoForm,
  type SoLineForm,
  buildForm,
  emptyForm,
  emptyLine,
  toPayload,
  calcAmount,
} from "@/modules/sales-orders-core/components/SoFormDrawer";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

export function ErpSalesOrdersPage() {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  const canRead = useHasPermission("sales_orders", "read");
  const canCreate = useHasPermission("sales_orders", "create");
  const canUpdate = useHasPermission("sales_orders", "update");
  const canDelete = useHasPermission("sales_orders", "delete");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [search, setSearch] = useState("");

  const filterConfig: FilterPanelConfig = useMemo(
    () => ({
      search: true,
    }),
    [],
  );
  const filter = useFilterPanel(filterConfig);
  const filterSearch = filter.state.search;

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(filterSearch.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [filterSearch]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpSalesOrder | null>(null);
  const [viewOnly, setViewOnly] = useState(true);

  const [form, setForm] = useState<SoForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ErpSalesOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<ErpSalesOrder | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [pendingTagIds, setPendingTagIds] = useState<string[]>([]);
  const [deliveryConfirmItem, setDeliveryConfirmItem] = useState<{
    id: string;
    serialIds: string[];
  } | null>(null);

  const [xlsxExportingId, setXlsxExportingId] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");

  const {
    data: customersData,
    fetchNextPage: fetchNextCustomers,
    isFetchingNextPage: loadingCustomers,
  } = useBasicMasterInfinite({
    search: customerSearch,
    limit: 50,
    entities: "customers",
  });

  const {
    data: itemsData,
    fetchNextPage: fetchNextItems,
    isFetchingNextPage: loadingItems,
  } = useBasicMasterInfinite({
    search: itemSearch,
    limit: 50,
    entities: "inventoryItems",
    inventoryItemAttributes: viewOnly ? "" : "CAN_BE_SOLD",
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

  const itemOptions = useMemo(() => {
    return (
      itemsData?.pages.flatMap((p) =>
        (p.items.inventoryItems || []).map((i) => ({
          value: i.id,
          label: `${i.sku} — ${i.itemName}`,
          original: i,
        })),
      ) || []
    );
  }, [itemsData]);

  const columnState = useTableColumnState("sales-orders-table");

  useEffect(() => {
    setPage(1);
  }, [columnState.columnFilters, columnState.columnSearch, columnState.sorts]);

  const fetchSalesOrdersColumnOptions = async (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    const filtersStr =
      Object.keys(columnState.columnFilters).length > 0
        ? JSON.stringify(columnState.columnFilters)
        : undefined;

    const res = await salesOrdersCoreApi.getColumnOptions(
      params.columnKey,
      params.search,
      params.pageParam || 1,
      20,
      filtersStr,
    );
    return {
      items: res.items.map((i: string) => ({ value: i, label: i })),
      total: res.total,
      next: res.page < res.totalPages ? res.page + 1 : null,
    };
  };

  const getSortState = (key: string) => {
    if (columnState.sorts.includes(key)) return "asc";
    if (columnState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const activeSort = columnState.sorts[0];
  const sortField = activeSort ? activeSort.replace("-", "") : undefined;
  const sortOrder = activeSort
    ? activeSort.startsWith("-")
      ? "desc"
      : "asc"
    : undefined;

  const {
    data: resData,
    isLoading: loading,
    refetch: loadOrders,
  } = useSalesOrdersQuery({
    page,
    pageSize,
    search,
    column_search:
      Object.keys(columnState.columnSearch).length > 0
        ? JSON.stringify(columnState.columnSearch)
        : undefined,
    column_filters:
      Object.keys(columnState.columnFilters).length > 0
        ? JSON.stringify(columnState.columnFilters)
        : undefined,
    sortField,
    sortOrder,
  });

  const items = resData?.items || [];
  const total = resData?.total || 0;
  const totalPages = resData?.totalPages || 0;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRefresh = () => {
      loadOrders();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);
    return () => window.removeEventListener("refresh_erp_data", handleRefresh);
  }, [loadOrders]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get("viewId");
    if (viewId) {
      openView({ id: viewId } as ErpSalesOrder);
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
      if (detail && detail.type === "erp_sales_order" && detail.id) {
        openView({ id: detail.id } as ErpSalesOrder);
      }
    };
    window.addEventListener("open_erp_document", handleOpenDoc);

    const handleRefresh = () => {
      loadOrders();
    };
    window.addEventListener("refresh_erp_data", handleRefresh);

    return () => {
      window.removeEventListener("open_erp_document", handleOpenDoc);
      window.removeEventListener("refresh_erp_data", handleRefresh);
    };
  }, [loadOrders]);

  function resetForm() {
    setForm(emptyForm());
    setEditing(null);
    setViewOnly(false);
    setSaveError(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
    setPendingTagIds([]);
  }

  async function openCreate() {
    resetForm();
    try {
      const nextNo = await salesOrdersCoreApi.nextNo();
      setForm((prev) => ({ ...prev, soNo: nextNo }));
    } catch {
      // ignore
    }
    setDrawerOpen(true);
  }

  async function openView(item: ErpSalesOrder) {
    setViewOnly(true);
    setSaveError(null);
    try {
      const detail = await salesOrdersCoreApi.get(item.id);
      // Detail API might not return customerName, fallback to list item's customerName
      const customerName = detail.customerName || item.customerName;

      const mergedDetail = { ...detail, customerName };
      setEditing(mergedDetail);
      setForm(buildForm(mergedDetail));
      setDrawerOpen(true);

      if (!customerName && detail.customerId) {
        import("@/modules/basic-masters/api/basicMastersApi").then(
          ({ basicMastersApi }) => {
            basicMastersApi
              .list({
                search: detail.customerId || undefined,
                entities: "customers",
              })
              .then((res) => {
                const c = res.items.customers?.find(
                  (x: any) => x.id === detail.customerId,
                );
                if (c) {
                  const name = `${c.code} — ${c.displayName || c.name}`;
                  setEditing((prev) =>
                    prev?.id === detail.id
                      ? { ...prev, customerName: name }
                      : prev,
                  );
                }
              });
          },
        );
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải chi tiết sales order",
      );
    }
  }

  function updateLine(index: number, patch: Partial<SoLineForm>) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) => {
        if (i !== index) return line;
        const next = { ...line, ...patch };
        return {
          ...next,
          amount: calcAmount(next.qtyOrdered, next.unitPrice),
        };
      }),
    }));
  }

  function addLine() {
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  }

  function removeLine(index: number) {
    setForm((prev) => ({
      ...prev,
      lines:
        prev.lines.length === 1
          ? [emptyLine()]
          : prev.lines.filter((_, i) => i !== index),
    }));
  }

  async function handleSave(overrideStatus?: string) {
    if (viewOnly) {
      closeDrawer();
      return;
    }

    if (!form.soNo.trim()) {
      setSaveError("Số đơn bán hàng là bắt buộc");
      return;
    }

    if (!form.customerId) {
      setSaveError("Khách hàng là bắt buộc");
      return;
    }

    if (
      !form.lines.length ||
      form.lines.some((line) => !line.qtyOrdered.trim())
    ) {
      setSaveError("Mỗi dòng phải có số lượng đặt hợp lệ");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...toPayload(form),
        status: overrideStatus || form.status,
      };

      if (payload.status === "DRAFT") {
        payload.lines = payload.lines?.map((l) => ({
          ...l,
          serialIds: undefined,
        }));
      }

      if (editing) {
        await salesOrdersCoreApi.update(editing.id, payload);
      } else {
        const created = await salesOrdersCoreApi.create(payload);
        // Option B: apply pending tags after create
        if (pendingTagIds.length > 0 && created?.id) {
          try {
            await updateEntityTags(
              "erp_sales_order",
              created.id,
              pendingTagIds,
            );
          } catch {
            // tags are non-critical
          }
        }
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else await loadOrders();
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || "Không thể lưu sales order",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReserve(item: ErpSalesOrder) {
    setError(null);
    try {
      await salesOrdersCoreApi.reserve(item.id);
      await loadOrders();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể reserve SO",
      );
    }
  }

  async function handleUnreserve(item: ErpSalesOrder) {
    setError(null);
    try {
      await salesOrdersCoreApi.unreserve(item.id);
      await loadOrders();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể unreserve SO",
      );
    }
  }

  async function handleConfirmAllDelivery(item: ErpSalesOrder) {
    setError(null);
    try {
      await salesOrdersCoreApi.confirmAllDelivery(item.id);
      await loadOrders();
      window.dispatchEvent(new CustomEvent("refresh_erp_data"));
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể xác nhận giao hàng",
      );
    }
  }

  async function handleRowConfirmDelivery(item: ErpSalesOrder) {
    try {
      const detail = await salesOrdersCoreApi.get(item.id);
      const serialIds =
        detail?.lines?.flatMap(
          (l: any) => l.selectedSerialIds || l.serialIds || [],
        ) || [];
      if (serialIds.length > 0) {
        setDeliveryConfirmItem({ id: item.id, serialIds });
      } else {
        if (
          window.confirm(
            t(
              "Bạn có chắc chắn muốn xác nhận giao hàng cho toàn bộ đơn hàng này?",
            ),
          )
        ) {
          void handleConfirmAllDelivery(item);
        }
      }
    } catch (e: any) {
      setError(e?.message || "Không thể tải chi tiết SO");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await salesOrdersCoreApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Không thể xóa SO");
    } finally {
      setDeleting(false);
    }
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await salesOrdersCoreApi.cancel(cancelTarget.id);
      setCancelTarget(null);
      await loadOrders();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Không thể hủy SO");
    } finally {
      setCanceling(false);
    }
  }

  const handleExportXlsx = async (id: string, refNo?: string) => {
    try {
      setXlsxExportingId(id);
      const blob = await salesOrdersCoreApi.exportXlsx(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `DonBanHang_${refNo || id.split("-")[0]}.xlsx`,
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
  };

  const columns: DataTableColumn<ErpSalesOrder>[] = [
    {
      key: "orderDate",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Ngày đặt")}
          columnKey="orderDate"
          sortState={getSortState("orderDate") || "none"}
          onSortChange={(s) => columnState.setSort("orderDate", s)}
          searchValue={columnState.columnSearch["orderDate"] || ""}
          onSearchChange={(v) => columnState.setColumnSearch("orderDate", v)}
          selectedFilters={columnState.columnFilters["orderDate"] || []}
          onFilterChange={(v) => columnState.setColumnFilter("orderDate", v)}
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 100,
      headerClassName: "text-center",
      className: "text-center",
      cell: (item) => fmtDate(item.orderDate),
      skeletonClassName: "w-20",
    },
    {
      key: "expectedDeliveryDate",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Ngày giao DK")}
          columnKey="expectedDeliveryDate"
          sortState={getSortState("expectedDeliveryDate") || "none"}
          onSortChange={(s) => columnState.setSort("expectedDeliveryDate", s)}
          searchValue={columnState.columnSearch["expectedDeliveryDate"] || ""}
          onSearchChange={(v) =>
            columnState.setColumnSearch("expectedDeliveryDate", v)
          }
          selectedFilters={
            columnState.columnFilters["expectedDeliveryDate"] || []
          }
          onFilterChange={(v) =>
            columnState.setColumnFilter("expectedDeliveryDate", v)
          }
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 100,
      headerClassName: "text-center",
      className: "text-center",
      cell: (item) => fmtDate(item.expectedDeliveryDate),
      skeletonClassName: "w-20",
    },
    {
      key: "soNo",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Số SO")}
          columnKey="soNo"
          sortState={getSortState("soNo") || "none"}
          onSortChange={(s) => columnState.setSort("soNo", s)}
          searchValue={columnState.columnSearch["soNo"] || ""}
          onSearchChange={(v) => columnState.setColumnSearch("soNo", v)}
          selectedFilters={columnState.columnFilters["soNo"] || []}
          onFilterChange={(v) => columnState.setColumnFilter("soNo", v)}
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 150,
      cell: (item) => (
        <Button
          variant="link"
          onClick={() => void openView(item)}
          className="font-medium text-primary hover:underline p-0 h-auto flex-1 truncate justify-start"
        >
          {item.soNo}
        </Button>
      ),
      skeletonClassName: "w-24",
    },
    {
      key: "customerName",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Khách hàng")}
          columnKey="customerName"
          sortState={getSortState("customerName") || "none"}
          onSortChange={(s) => columnState.setSort("customerName", s)}
          searchValue={columnState.columnSearch["customerName"] || ""}
          onSearchChange={(v) => columnState.setColumnSearch("customerName", v)}
          selectedFilters={columnState.columnFilters["customerName"] || []}
          onFilterChange={(v) => columnState.setColumnFilter("customerName", v)}
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 200,
      className: "text-left",
      cell: (item) => {
        const text = item.customerName || item.customerId || "—";
        return (
          <Tooltip content={text !== "—" ? text : ""}>
            <div className="whitespace-normal break-words w-full cursor-pointer">
              {text}
            </div>
          </Tooltip>
        );
      },
      skeletonClassName: "w-36",
    },
    {
      key: "totalQty",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Số lượng")}
          columnKey="totalQty"
          sortState={getSortState("totalQty") || "none"}
          onSortChange={(s) => columnState.setSort("totalQty", s)}
          searchValue={columnState.columnSearch["totalQty"] || ""}
          onSearchChange={(v) => columnState.setColumnSearch("totalQty", v)}
          selectedFilters={columnState.columnFilters["totalQty"] || []}
          onFilterChange={(v) => columnState.setColumnFilter("totalQty", v)}
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 100,
      className: "text-right",
      headerClassName: "text-center",
      cell: (item) => {
        const qty =
          item.lines?.reduce(
            (sum, line) => sum + Number(line.qtyOrdered || 0),
            0,
          ) || 0;
        return qty.toLocaleString("vi-VN");
      },
    },
    {
      key: "status",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Trạng thái")}
          columnKey="status"
          sortState={getSortState("status") || "none"}
          onSortChange={(s) => columnState.setSort("status", s)}
          searchValue={columnState.columnSearch["status"] || ""}
          onSearchChange={(v) => columnState.setColumnSearch("status", v)}
          selectedFilters={columnState.columnFilters["status"] || []}
          onFilterChange={(v) => columnState.setColumnFilter("status", v)}
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 120,
      cell: (item) => <StatusBadge status={item.status || ""} />,
      skeletonClassName: "w-20",
    },
    {
      key: "remarks",
      header: (
        <TableColumnHeaderFilter
          align="center"
          title={t("Ghi chú")}
          columnKey="remarks"
          sortState={getSortState("remarks") || "none"}
          onSortChange={(s) => columnState.setSort("remarks", s)}
          searchValue={columnState.columnSearch["remarks"] || ""}
          onSearchChange={(v) => columnState.setColumnSearch("remarks", v)}
          selectedFilters={columnState.columnFilters["remarks"] || []}
          onFilterChange={(v) => columnState.setColumnFilter("remarks", v)}
          fetchOptions={fetchSalesOrdersColumnOptions}
        />
      ),
      size: 200,
      className: "text-left",
      cell: (item) => {
        const text = item.remarks || "—";
        return (
          <Tooltip content={text !== "—" ? text : ""}>
            <div className="whitespace-normal break-words w-full cursor-pointer line-clamp-2">
              {text}
            </div>
          </Tooltip>
        );
      },
      skeletonClassName: "w-36",
    },
  ];

  const summaryRow = useMemo(() => {
    const totalQty = items.reduce(
      (acc, curr) =>
        acc +
        (curr.lines?.reduce(
          (sum, line) => sum + Number(line.qtyOrdered || 0),
          0,
        ) || 0),
      0,
    );
    return {
      customerName: null,
      totalQty: totalQty.toLocaleString("vi-VN"),
    };
  }, [items]);

  if (!canRead) return <Forbidden />;

  return (
    <SpreadsheetPageTemplate<ErpSalesOrder>
      title={t("Đơn bán hàng")}
      desc={t("Quản lý đơn bán hàng và reserve tồn kho.")}
      icon={<FileText className="h-4 w-4" />}
      tableId="sales-orders-table"
      loading={loading}
      summaryRow={summaryRow}
      onRefresh={loadOrders}
      createActions={
        canCreate
          ? [
              {
                groupLabel: t("groupThemMoi", "Thêm mới"),
                items: [
                  {
                    label: t("Tạo mới"),
                    icon: <PackagePlus className="w-4 h-4 text-emerald-600" />,
                    onClick: openCreate,
                  },
                ],
              },
            ]
          : undefined
      }
      error={error}
      items={items}
      columns={columns}
      getRowKey={(item) => item.id}
      total={total}
      totalPages={totalPages}
      page={page}
      pageSize={pageSize}
      onPage={setPage}
      onPageSize={(size) => {
        setPageSize(size);
        setPage(1);
      }}
      filterConfig={filterConfig}
      filter={filter}
      rowActions={(item) => [
        {
          groupLabel: t("groupTraCuu", "Tra cứu"),
          items: [
            {
              label: t("Chi tiết"),
              icon: <Eye className="h-[13px] w-[13px]" />,
              onClick: () => void openView(item),
            },
            {
              label: t("Xuất XLSX"),
              onClick: () => void handleExportXlsx(item.id, item.soNo),
              icon: <FileSpreadsheet className="h-[13px] w-[13px]" />,
              disabled: xlsxExportingId === item.id,
              hidden: item.status === "DRAFT",
            },
          ],
        },
        {
          groupLabel: t("groupThaoTac", "Thao tác"),
          items: [
            {
              label: t("Reserve"),
              icon: <PackageCheck className="h-[13px] w-[13px]" />,
              onClick: () => void handleReserve(item),
              hidden: !canUpdate || !["CONFIRMED"].includes(item.status || ""),
            },
            {
              label: t("Unreserve"),
              icon: <RotateCcw className="h-[13px] w-[13px]" />,
              onClick: () => void handleUnreserve(item),
              hidden:
                !canUpdate ||
                !["RESERVED", "PARTIAL_RESERVED"].includes(item.status || ""),
            },
            {
              label: t("Xác nhận giao hàng"),
              icon: <CheckCircle className="h-[13px] w-[13px]" />,
              onClick: () => {
                void handleRowConfirmDelivery(item);
              },
              hidden:
                !canUpdate ||
                !["DELIVERING", "PARTIAL_DELIVERING"].includes(
                  item.status || "",
                ),
            },
            {
              label: t("Xóa"),
              icon: <Trash2 className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => setDeleteTarget(item),
              hidden: !canDelete || item.status !== "DRAFT",
            },
            {
              label: t("Hủy phiếu"),
              icon: <XCircle className="h-[13px] w-[13px]" />,
              variant: "danger",
              onClick: () => setCancelTarget(item),
              hidden:
                !canUpdate ||
                !["CONFIRMED", "PARTIAL_RESERVED", "RESERVED"].includes(
                  item.status || "",
                ),
            },
          ],
        },
      ]}
    >
      <ConfirmModal
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={deleteTarget ? `Xóa đơn bán hàng "${deleteTarget.soNo}"?` : ""}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <ConfirmModal
        open={!!cancelTarget}
        title="Xác nhận hủy"
        message={cancelTarget ? `Hủy đơn bán hàng "${cancelTarget.soNo}"?` : ""}
        confirmLabel="Hủy phiếu"
        cancelLabel="Quay lại"
        onConfirm={() => void handleConfirmCancel()}
        onCancel={() => {
          if (!canceling) setCancelTarget(null);
        }}
        loading={canceling}
        danger
      />

      <SoFormDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        mode={viewOnly ? "view" : editing ? "edit" : "create"}
        editing={editing}
        form={form}
        setForm={setForm}
        drawerLoading={false}
        saving={saving}
        saveError={saveError}
        handleSave={handleSave}
        onRefresh={loadOrders}
        customerOptions={customerOptions}
        setCustomerSearch={setCustomerSearch}
        fetchNextCustomers={fetchNextCustomers}
        loadingCustomers={loadingCustomers}
        itemOptions={itemOptions}
        setItemSearch={setItemSearch}
        fetchNextItems={fetchNextItems}
        loadingItems={loadingItems}
        addLine={addLine}
        removeLine={removeLine}
        updateLine={updateLine}
        pendingTagIds={pendingTagIds}
        onPendingTagsChange={setPendingTagIds}
        onToggleEdit={
          viewOnly &&
          canUpdate &&
          editing &&
          !["CANCELLED"].includes(editing.status || "DRAFT")
            ? () => setViewOnly(false)
            : undefined
        }
      />

      <DeliveryConfirmModal
        open={!!deliveryConfirmItem}
        onClose={() => setDeliveryConfirmItem(null)}
        serialIds={deliveryConfirmItem?.serialIds || []}
        onConfirmSuccess={() => {
          setDeliveryConfirmItem(null);
          loadOrders();
          window.dispatchEvent(new CustomEvent("refresh_erp_data"));
        }}
      />
    </SpreadsheetPageTemplate>
  );
}
