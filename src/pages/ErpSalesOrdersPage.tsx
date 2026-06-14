import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  PackageCheck,
  Pencil,
  Plus,
  ReceiptText,
  RotateCcw,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { TableActionGroup } from "@/shared/components/TableActionGroup";
import { FilterPanel } from "@/shared/components/FilterPanel";
import {
  useFilterPanel,
  type FilterPanelConfig,
} from "@/shared/hooks/useFilterPanel";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import {
  salesOrdersCoreApi,
  type CreateSoPayload,
  type ErpSalesOrder,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOOKUP_LIMIT = 200;

interface SoLineForm {
  itemId: string;
  itemName: string;
  qtyOrdered: string;
  unitPrice: string;
  amount: string;
}

interface SoForm {
  soNo: string;
  customerId: string;
  orderDate: string;
  status: string;
  remarks: string;
  lines: SoLineForm[];
}

const emptyLine = (): SoLineForm => ({
  itemId: "",
  itemName: "",
  qtyOrdered: "1",
  unitPrice: "0",
  amount: "0",
});

const emptyForm = (): SoForm => ({
  soNo: "",
  customerId: "",
  orderDate: new Date().toISOString().slice(0, 10),
  status: "DRAFT",
  remarks: "",
  lines: [emptyLine()],
});

function buildForm(so: ErpSalesOrder): SoForm {
  return {
    soNo: so.soNo ?? "",
    customerId: so.customerId ?? "",
    orderDate: so.orderDate ? so.orderDate.slice(0, 10) : "",
    status: so.status ?? "DRAFT",
    remarks: so.remarks ?? "",
    lines: so.lines?.length
      ? so.lines.map((line) => ({
          itemId: line.itemId ?? "",
          itemName: line.itemName ?? "",
          qtyOrdered: line.qtyOrdered ?? "1",
          unitPrice: line.unitPrice ?? "0",
          amount: line.amount ?? "0",
        }))
      : [emptyLine()],
  };
}

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
    maximumFractionDigits: 3,
  }).format(n);
}

function fmtMoney(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function calcAmount(qtyOrdered: string, unitPrice: string) {
  const qty = Number(qtyOrdered || 0);
  const price = Number(unitPrice || 0);
  if (Number.isNaN(qty) || Number.isNaN(price)) return "0";
  return (qty * price).toFixed(3);
}

function toPayload(form: SoForm): CreateSoPayload {
  return {
    soNo: form.soNo.trim(),
    customerId: form.customerId || undefined,
    orderDate: form.orderDate,
    status: form.status || "DRAFT",
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      itemId: line.itemId || undefined,
      itemName: line.itemName || undefined,
      qtyOrdered: line.qtyOrdered,
      unitPrice: line.unitPrice || undefined,
      amount: calcAmount(line.qtyOrdered, line.unitPrice),
    })),
  };
}

export function ErpSalesOrdersPage() {
  const canRead = useHasPermission("sales_orders", "read");
  const [items, setItems] = useState<ErpSalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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

  function resetForm() {
    setForm(emptyForm());
    setEditing(null);
    setViewOnly(false);
    setSaveError(null);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
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
        await salesOrdersCoreApi.create(payload);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else await loadOrders();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể unreserve SO",
      );
    } finally {
      setActingId(null);
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

  const drawerActions: DrawerAction[] = [
    {
      label: viewOnly ? "Đóng" : "Hủy",
      onClick: closeDrawer,
      variant: "outline",
    },
    {
      label: viewOnly ? "OK" : editing ? "Lưu thay đổi" : "Tạo SO",
      onClick: handleSave,
      disabled: saving,
      loading: saving,
      primary: true,
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
          onCreate={openCreate}
          createLabel="Tạo mới"
        />
      }
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <DataTable
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
            actionsColumn={{
              cell: (item: ErpSalesOrder) => (
                <div className="flex justify-end">
                  <ActionDropdown
                    items={[
                      {
                        label: "Xem chi tiết",
                        icon: <ReceiptText className="h-4 w-4" />,
                        onClick: () => void openView(item),
                      },
                      {
                        label: "Chỉnh sửa",
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => void openEdit(item),
                      },
                      {
                        label:
                          actingId === item.id ? "Đang reserve..." : "Reserve",
                        icon: <PackageCheck className="h-4 w-4" />,
                        onClick: () => void handleReserve(item),
                      },
                      {
                        label:
                          actingId === item.id
                            ? "Đang unreserve..."
                            : "Unreserve",
                        icon: <RotateCcw className="h-4 w-4" />,
                        onClick: () => void handleUnreserve(item),
                      },
                    ]}
                  />
                </div>
              ),
            }}
          />
        </div>
        <FilterPanel config={filterConfig} filter={filter} />
      </div>

      <DrawerModal
        open={drawerOpen}
        title={
          viewOnly
            ? `Chi tiết SO ${editing?.soNo ?? ""}`
            : editing
              ? `Chỉnh sửa SO ${editing.soNo}`
              : "Tạo sales order"
        }
        onClose={closeDrawer}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[920px]"
      >
        <DrawerSection title="Thông tin chung">
          <div className="grid gap-4 md:grid-cols-2">
            <DrawerField label="Số SO" required>
              <input
                value={form.soNo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, soNo: e.target.value }))
                }
                disabled={viewOnly}
                className={inputCls}
                placeholder="SO-20260608-001"
              />
            </DrawerField>
            <DrawerField label="Khách hàng">
              <Combobox
                value={form.customerId}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, customerId: value }))
                }
                options={customerOptions}
                placeholder="Chọn khách hàng"
                disabled={viewOnly}
                onSearch={setCustomerSearch}
                onScrollBottom={fetchNextCustomers}
                loading={loadingCustomers}
              />
            </DrawerField>
            <DrawerField label="Ngày đơn" required>
              <input
                type="date"
                value={form.orderDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, orderDate: e.target.value }))
                }
                disabled={viewOnly}
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Trạng thái">
              <input
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
                disabled={viewOnly}
                className={inputCls}
                placeholder="DRAFT"
              />
            </DrawerField>
            <div className="md:col-span-2">
              <DrawerField label="Ghi chú">
                <textarea
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  disabled={viewOnly}
                  className={`${inputCls} min-h-[88px]`}
                  placeholder="Ghi chú đơn bán hàng"
                />
              </DrawerField>
            </div>
          </div>
        </DrawerSection>

        <DrawerSection title="Dòng hàng">
          <div className="space-y-3">
            {form.lines.map((line, index) => (
              <div
                key={`so-line-${index}`}
                className="grid gap-3 rounded-2xl border border-border bg-card p-3 md:grid-cols-12"
              >
                <div className="md:col-span-5">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Item
                  </label>
                  <Combobox
                    value={line.itemId}
                    onChange={(value) => {
                      const matched = itemOptions.find(
                        (opt) => opt.value === value,
                      );
                      updateLine(index, {
                        itemId: value,
                        itemName:
                          matched?.label.split(" — ").slice(1).join(" — ") ||
                          "",
                      });
                    }}
                    options={itemOptions}
                    placeholder="Chọn inventory item"
                    disabled={viewOnly}
                    onSearch={setItemSearch}
                    onScrollBottom={fetchNextItems}
                    loading={loadingItems}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Số lượng
                  </label>
                  <input
                    value={line.qtyOrdered}
                    onChange={(e) =>
                      updateLine(index, { qtyOrdered: e.target.value })
                    }
                    disabled={viewOnly}
                    className={inputCls}
                    placeholder="1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Đơn giá
                  </label>
                  <input
                    value={line.unitPrice}
                    onChange={(e) =>
                      updateLine(index, { unitPrice: e.target.value })
                    }
                    disabled={viewOnly}
                    className={inputCls}
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Thành tiền
                  </label>
                  <div className={`${inputCls} flex items-center bg-muted/40`}>
                    {fmtMoney(line.amount)}
                  </div>
                </div>
                <div className="flex items-end md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    disabled={viewOnly}
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border text-xs font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Xóa
                  </button>
                </div>
                {(line.itemName || viewOnly) && (
                  <div className="text-xs text-muted-foreground md:col-span-12">
                    Tên item: {line.itemName || "—"}
                  </div>
                )}
              </div>
            ))}
            {!viewOnly && (
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
                Thêm dòng hàng
              </button>
            )}
          </div>
        </DrawerSection>

        {editing?.lines?.length ? (
          <DrawerSection title="Trạng thái reserve/deliver hiện tại">
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-right">Ordered</th>
                    <th className="px-3 py-2 text-right">Reserved</th>
                    <th className="px-3 py-2 text-right">Delivered</th>
                  </tr>
                </thead>
                <tbody>
                  {editing.lines.map((line, idx) => (
                    <tr key={line.id ?? idx} className="border-t border-border">
                      <td className="px-3 py-2">
                        {line.itemName || line.itemId || "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.qtyOrdered)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.qtyReserved)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.qtyDelivered)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DrawerSection>
        ) : null}

        {saveError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {saveError}
          </div>
        ) : null}
      </DrawerModal>
    </PageLayout>
  );
}
