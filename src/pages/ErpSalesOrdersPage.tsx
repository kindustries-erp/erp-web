import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  PackageCheck,
  Pencil,
  ReceiptText,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
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
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<SoForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

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

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  async function openEdit(item: ErpSalesOrder) {
    setViewOnly(false);
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

  async function handleSave() {
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
      const payload = toPayload(form);
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
    setActingId(item.id);
    setError(null);
    try {
      await salesOrdersCoreApi.reserve(item.id);
      await loadOrders();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể reserve SO",
      );
    } finally {
      setActingId(null);
    }
  }

  async function handleUnreserve(item: ErpSalesOrder) {
    setActingId(item.id);
    setError(null);
    try {
      await salesOrdersCoreApi.unreserve(item.id);
      await loadOrders();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể unreserve SO",
      );
    } finally {
      setActingId(null);
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
      key: "soNo",
      header: "Số SO",
      cell: (item) => <span className="font-medium">{item.soNo}</span>,
      skeletonClassName: "w-24",
    },
    {
      key: "customerName",
      header: "Khách hàng",
      cell: (item) => item.customerName || item.customerId || "—",
      skeletonClassName: "w-36",
    },
    {
      key: "orderDate",
      header: "Ngày đơn",
      cell: (item) => fmtDate(item.orderDate),
      skeletonClassName: "w-20",
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) => item.status || "—",
      skeletonClassName: "w-20",
    },
  ];

  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title="Đơn bán hàng"
      desc="Quản lý đơn bán hàng và reserve/unreserve tồn kho."
      icon={<Boxes className="h-5 w-5" />}
      actions={
        <TableActionGroup
          onRefresh={() => void loadOrders()}
          loading={loading}
          onFilterToggle={filter.togglePanel}
          activeFilterCount={filter.activeFilterCount}
          onCreate={canCreate ? openCreate : undefined}
          createLabel="Tạo mới"
        />
      }
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <StandardTable<ErpSalesOrder>
            items={items}
            columns={columns}
            getRowKey={(item) => item.id}
            loading={loading}
            error={error}
            emptyLabel="Chưa có sales order nào"
            minWidth={980}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            onPage={setPage}
            onPageSize={(size: number) => {
              setPageSize(size);
              setPage(1);
            }}
            actions={(item) => [
              {
                label: "Xem chi tiết",
                icon: <ReceiptText className="h-4 w-4" />,
                onClick: () => void openView(item),
              },
              {
                label: "Chỉnh sửa",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => void openEdit(item),
                hidden: !canUpdate,
              },
              {
                label: actingId === item.id ? "Đang reserve..." : "Reserve",
                icon: <PackageCheck className="h-4 w-4" />,
                onClick: () => void handleReserve(item),
                hidden: !canUpdate,
              },
              {
                label: actingId === item.id ? "Đang unreserve..." : "Unreserve",
                icon: <RotateCcw className="h-4 w-4" />,
                onClick: () => void handleUnreserve(item),
                hidden: !canUpdate,
              },
              {
                label: "Xóa",
                onClick: () => setDeleteTarget(item),
                icon: <Trash2 className="h-4 w-4" />,
                variant: "danger",
                hidden: !canDelete || item.status !== "DRAFT",
              },
              {
                label: "Hủy phiếu",
                onClick: () => setCancelTarget(item),
                icon: <XCircle className="h-4 w-4" />,
                variant: "danger",
                hidden:
                  !canUpdate ||
                  item.status === "DRAFT" ||
                  item.status === "CANCELLED",
              },
            ]}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

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
    </PageLayout>
  );
}
