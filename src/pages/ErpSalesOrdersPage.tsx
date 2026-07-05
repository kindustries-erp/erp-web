import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PackageCheck,
  RotateCcw,
  Trash2,
  XCircle,
  PackagePlus,
  Eye,
  FileText,
} from "lucide-react";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
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
import { Tooltip } from "@/core/components/ui/Tooltip";
import { StatusBadge } from "@/shared/components/badges";

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

  const canRead = useHasPermission("sales_orders", "read");
  const canCreate = useHasPermission("sales_orders", "create");
  const canUpdate = useHasPermission("sales_orders", "update");
  const canDelete = useHasPermission("sales_orders", "delete");

  const [items, setItems] = useState<ErpSalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
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

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await salesOrdersCoreApi.list({ page, pageSize, search });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải sales orders");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void loadOrders();
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
    return () => window.removeEventListener("open_erp_document", handleOpenDoc);
  }, []);

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
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
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

  const columns: DataTableColumn<ErpSalesOrder>[] = [
    {
      key: "orderDate",
      header: t("Ngày đặt"),
      size: 100,
      headerClassName: "text-center",
      className: "text-center",
      cell: (item) => fmtDate(item.orderDate),
      skeletonClassName: "w-20",
    },
    {
      key: "expectedDeliveryDate",
      header: t("Ngày giao DK"),
      size: 100,
      headerClassName: "text-center",
      className: "text-center",
      cell: (item) => fmtDate(item.expectedDeliveryDate),
      skeletonClassName: "w-20",
    },
    {
      key: "soNo",
      header: t("Số SO"),
      size: 120,
      cell: (item) => <span className="font-medium">{item.soNo}</span>,
      skeletonClassName: "w-24",
    },
    {
      key: "customerName",
      header: t("Khách hàng"),
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
      key: "status",
      header: t("Trạng thái"),
      size: 120,
      cell: (item) => <StatusBadge status={item.status || ""} />,
      skeletonClassName: "w-20",
    },
    {
      key: "remarks",
      header: t("Ghi chú"),
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

  if (!canRead) return <Forbidden />;

  return (
    <SpreadsheetPageTemplate<ErpSalesOrder>
      title={t("Đơn bán hàng")}
      desc={t("Quản lý đơn bán hàng và reserve tồn kho.")}
      icon={<FileText className="h-4 w-4" />}
      tableId="sales-orders-table"
      loading={loading}
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
    </SpreadsheetPageTemplate>
  );
}
