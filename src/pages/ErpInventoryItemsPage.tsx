import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Pencil,
  Plus,
  ReceiptText,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMovement,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";

// ─── Static options ────────────────────────────────────────────────────────────

const ITEM_TYPE_OPTIONS = [
  { value: "FG", label: "FG — Thành phẩm" },
  { value: "RAW", label: "RAW — Nguyên vật liệu" },
  { value: "WIP", label: "WIP — Bán thành phẩm" },
  { value: "GOODS", label: "GOODS — Hàng hóa" },
  { value: "SERVICE", label: "SERVICE — Dịch vụ" },
  { value: "OTHER", label: "OTHER — Khác" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
];

const UOM_OPTIONS = [
  { value: "PCS", label: "PCS — Cái" },
  { value: "KG", label: "KG — Kilogram" },
  { value: "M", label: "M — Mét" },
  { value: "L", label: "L — Lít" },
  { value: "BOX", label: "BOX — Hộp" },
  { value: "SET", label: "SET — Bộ" },
];

// ─── Form ─────────────────────────────────────────────────────────────────────

interface ItemForm {
  sku: string;
  itemName: string;
  uom: string;
  itemType: string;
  status: string;
}

const emptyForm = (): ItemForm => ({
  sku: "",
  itemName: "",
  uom: "PCS",
  itemType: "FG",
  status: "ACTIVE",
});

function buildForm(item: ErpInventoryItem): ItemForm {
  return {
    sku: item.sku ?? "",
    itemName: item.itemName ?? "",
    uom: item.uom ?? "PCS",
    itemType: item.itemType ?? "FG",
    status: item.status ?? "ACTIVE",
  };
}

function toPayload(form: ItemForm): CreateInventoryItemPayload {
  return {
    sku: form.sku.trim(),
    itemName: form.itemName.trim(),
    uom: form.uom || "PCS",
    itemType: form.itemType || "FG",
    status: form.status || "ACTIVE",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtQty(value?: number | string | null) {
  if (value == null) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

function fmtDate(value?: string | Date | null) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

function movementLabel(m: InventoryMovement) {
  const type = m.transactionType || "—";
  const doc = m.documentType ? ` • ${m.documentType}` : "";
  return `${type}${doc}`;
}

// ─── Timeline component ───────────────────────────────────────────────────────

function TimelineBlock({
  itemId,
  loadingId,
  error,
  data,
}: {
  itemId: string;
  loadingId: string | null;
  error: string | null;
  data?: InventoryMovementsPayload;
}) {
  const isLoading = loadingId === itemId;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
        Đang tải lịch sử xuất nhập kho...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-muted/10 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Timeline xuất / nhập kho
          </div>
          <div className="text-xs text-muted-foreground">
            {data.item.sku} — {data.item.itemName} • Tồn hiện tại:{" "}
            <span className="font-semibold text-foreground">
              {fmtQty(data.currentOnHand)}
            </span>{" "}
            {data.item.uom}
          </div>
        </div>
      </div>

      {data.movements.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          Chưa có phát sinh xuất nhập kho.
        </div>
      ) : (
        <div className="space-y-2">
          {data.movements.map((m) => {
            const isIn = Number(m.qtyIn || 0) > 0;
            const qty = isIn ? m.qtyIn : m.qtyOut;
            return (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-background px-4 py-3"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          isIn
                            ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                            : "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200"
                        }
                      >
                        {isIn ? "Nhập" : "Xuất"}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {movementLabel(m)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ngày giao dịch:{" "}
                      <span className="text-foreground font-medium">
                        {fmtDate(m.transactionDate)}
                      </span>
                    </div>
                    {m.notes ? (
                      <div className="text-xs text-muted-foreground">
                        Ghi chú: {m.notes}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs md:min-w-[300px] shrink-0">
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <div className="text-muted-foreground mb-0.5">
                        {isIn ? "Số lượng nhập" : "Số lượng xuất"}
                      </div>
                      <div
                        className={
                          isIn
                            ? "font-semibold text-emerald-700"
                            : "font-semibold text-amber-700"
                        }
                      >
                        {isIn ? "+" : "-"}
                        {fmtQty(qty)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <div className="text-muted-foreground mb-0.5">
                        Số dư sau mốc
                      </div>
                      <div className="font-semibold text-foreground">
                        {fmtQty(m.balanceAfter)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <div className="text-muted-foreground mb-0.5">
                        Đơn giá
                      </div>
                      <div className="font-medium text-foreground">
                        {m.unitCost == null ? "—" : fmtQty(m.unitCost)}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                      <div className="text-muted-foreground mb-0.5">
                        Ngày ghi nhận
                      </div>
                      <div className="font-medium text-foreground">
                        {fmtDate(m.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ErpInventoryItemsPage() {
  // List state
  const [items, setItems] = useState<ErpInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpInventoryItem | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Expand / timeline state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [movLoadingId, setMovLoadingId] = useState<string | null>(null);
  const [movError, setMovError] = useState<string | null>(null);
  const [movMap, setMovMap] = useState<
    Record<string, InventoryMovementsPayload>
  >({});

  // ─── Load list ───────────────────────────────────────────────────────────────

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryCoreApi.list({ page, pageSize, search });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh mục kho");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  // ─── Drawer helpers ──────────────────────────────────────────────────────────

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

  async function openEdit(item: ErpInventoryItem) {
    setViewOnly(false);
    setSaveError(null);
    try {
      const detail = await inventoryCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chi tiết");
    }
  }

  async function openView(item: ErpInventoryItem) {
    setViewOnly(true);
    setSaveError(null);
    try {
      const detail = await inventoryCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải chi tiết");
    }
  }

  async function handleSave() {
    if (viewOnly) {
      closeDrawer();
      return;
    }
    if (!form.sku.trim()) {
      setSaveError("SKU là bắt buộc");
      return;
    }
    if (!form.itemName.trim()) {
      setSaveError("Tên item kho là bắt buộc");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      if (editing) {
        await inventoryCoreApi.update(editing.id, payload);
      } else {
        await inventoryCoreApi.create(payload);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else await loadItems();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  // ─── Expand / timeline ───────────────────────────────────────────────────────

  async function handleToggleExpand(item: ErpInventoryItem) {
    if (expandedId === item.id) {
      setExpandedId(null);
      setMovError(null);
      return;
    }
    setExpandedId(item.id);
    setMovError(null);
    if (movMap[item.id]) return; // already cached
    setMovLoadingId(item.id);
    try {
      const data = await inventoryCoreApi.movements(item.id);
      setMovMap((prev) => ({ ...prev, [item.id]: data }));
    } catch (e) {
      setMovError(
        e instanceof Error ? e.message : "Không thể tải lịch sử xuất nhập kho",
      );
    } finally {
      setMovLoadingId(null);
    }
  }

  // ─── Table columns ───────────────────────────────────────────────────────────

  const columns: DataTableColumn<ErpInventoryItem>[] = useMemo(
    () => [
      {
        key: "expand",
        header: "",
        cell: (item) => {
          const expanded = expandedId === item.id;
          return (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleToggleExpand(item);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
              title={expanded ? "Thu gọn" : "Xem lịch sử"}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          );
        },
        skeletonClassName: "w-8",
      },
      {
        key: "sku",
        header: "SKU",
        cell: (item) => (
          <span className="font-medium font-mono">{item.sku}</span>
        ),
        skeletonClassName: "w-24",
      },
      {
        key: "itemName",
        header: "Tên item kho",
        cell: (item) => item.itemName,
        skeletonClassName: "w-44",
      },
      {
        key: "uom",
        header: "ĐVT",
        cell: (item) => item.uom || "—",
        skeletonClassName: "w-10",
      },
      {
        key: "itemType",
        header: "Loại",
        cell: (item) => item.itemType || "—",
        skeletonClassName: "w-28",
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (item) => (
          <span
            className={
              item.status === "ACTIVE"
                ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200"
                : "inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground ring-1 ring-border"
            }
          >
            {item.status || "—"}
          </span>
        ),
        skeletonClassName: "w-16",
      },
    ],

    [expandedId],
  );

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const expandedRowKeys = useMemo(
    () => (expandedId ? [expandedId] : []),
    [expandedId],
  );

  const renderSubRow = useCallback(
    (item: ErpInventoryItem) => (
      <TimelineBlock
        itemId={item.id}
        loadingId={movLoadingId}
        error={movError}
        data={movMap[item.id]}
      />
    ),
    [movLoadingId, movError, movMap],
  );

  // ─── Filter bar ──────────────────────────────────────────────────────────────

  const filterBar = useMemo(
    () => (
      <>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              setSearch(searchInput.trim());
            }
          }}
          placeholder="Tìm SKU hoặc tên item kho"
          className={`${inputCls} min-w-[260px] bg-surface`}
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="inline-flex items-center rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
        >
          Search
        </button>
      </>
    ),
    [searchInput],
  );

  const drawerActions: DrawerAction[] = [
    { label: "Hủy", onClick: closeDrawer, variant: "outline" },
    {
      label: viewOnly ? "Đóng" : editing ? "Cập nhật" : "Tạo mới",
      onClick: handleSave,
      primary: true,
      loading: saving,
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <PageLayout
      title="Danh mục kho"
      desc="Quản lý item kho dùng chung: thành phẩm (FG), nguyên vật liệu (RAW), bán thành phẩm (WIP), hàng hóa (GOODS). Click ▶ để xem lịch sử xuất nhập."
      icon={<Layers className="h-5 w-5" />}
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
        >
          <Plus className="h-3.5 w-3.5" />
          Tạo item kho
        </button>
      }
    >
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={loading}
        error={error}
        emptyLabel="Chưa có item kho nào"
        filters={filterBar}
        minWidth={980}
        loadingRows={8}
        expandedRowKeys={expandedRowKeys}
        renderSubRow={renderSubRow}
        actionsColumn={{
          header: "",
          className: "w-[48px]",
          cell: (item) => (
            <ActionDropdown
              items={[
                {
                  label: "Xem",
                  onClick: () => void openView(item),
                  icon: <ReceiptText className="h-3.5 w-3.5" />,
                },
                {
                  label: "Sửa",
                  onClick: () => void openEdit(item),
                  icon: <Pencil className="h-3.5 w-3.5" />,
                },
              ]}
            />
          ),
        }}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(value) => {
          setPage(1);
          setPageSize(value);
        }}
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Layers className="h-4 w-4" />}
        title={
          viewOnly
            ? "Xem item kho"
            : editing
              ? "Cập nhật item kho"
              : "Tạo item kho mới"
        }
        subtitle={editing ? editing.sku : "Danh mục item kho dùng chung"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[620px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        <DrawerSection title="Thông tin item kho">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="SKU" required>
              <input
                value={form.sku}
                disabled={viewOnly || !!editing}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, sku: e.target.value }))
                }
                className={inputCls}
                placeholder="VD: FG-001"
              />
            </DrawerField>

            <DrawerField label="Đơn vị tính (ĐVT)" required>
              <Combobox
                value={form.uom}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, uom: value || "PCS" }))
                }
                options={UOM_OPTIONS}
                placeholder="Chọn ĐVT"
              />
            </DrawerField>

            <DrawerField label="Tên item kho" required>
              <input
                value={form.itemName}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, itemName: e.target.value }))
                }
                className={inputCls}
                placeholder="Tên đầy đủ của item kho"
              />
            </DrawerField>

            <DrawerField label="Loại item">
              <Combobox
                value={form.itemType}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    itemType: value || "FG",
                  }))
                }
                options={ITEM_TYPE_OPTIONS}
                placeholder="Chọn loại"
              />
            </DrawerField>

            <DrawerField label="Trạng thái">
              <Combobox
                value={form.status}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value || "ACTIVE" }))
                }
                options={STATUS_OPTIONS}
              />
            </DrawerField>
          </div>
        </DrawerSection>

        {editing && (
          <DrawerSection title="Thông tin hệ thống">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-xs">
              <div className="flex justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono font-medium truncate ml-2">
                  {editing.id}
                </span>
              </div>
              {editing.createdAt && (
                <div className="flex justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span className="font-medium">
                    {editing.createdAt.slice(0, 10)}
                  </span>
                </div>
              )}
              {editing.updatedAt && (
                <div className="flex justify-between rounded-lg border border-border bg-muted/20 px-3 py-2">
                  <span className="text-muted-foreground">Cập nhật</span>
                  <span className="font-medium">
                    {editing.updatedAt.slice(0, 10)}
                  </span>
                </div>
              )}
            </div>
          </DrawerSection>
        )}
      </DrawerModal>
    </PageLayout>
  );
}
