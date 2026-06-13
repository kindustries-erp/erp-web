import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  PackageOpen,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
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
  goodsIssuesCoreApi,
  type CreateGiPayload,
  type ErpGiLine,
  type ErpGoodsIssue,
} from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { manufacturingApi } from "@/modules/manufacturing/api/manufacturingApi";
import { useBasicMasterInfinite } from "@/modules/basic-masters/hooks/useBasicMasterInfinite";

const ISSUE_TYPE_OPTIONS = [
  { value: "SALE", label: "SALE — Xuất bán" },
  { value: "OTHER", label: "OTHER — Xuất khác" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "DRAFT" },
  { value: "POSTED", label: "POSTED" },
];

// ─── Form types ────────────────────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────────────────────

const emptyLine = (): GiLineForm => ({
  salesOrderLineId: "",
  itemId: "",
  itemName: "",
  serialId: "",
  vehicleId: "",
  qtyIssued: "1",
  unitCost: "",
});

const emptyForm = (): GiForm => ({
  issueNo: "",
  issueDate: new Date().toISOString().slice(0, 10),
  issueType: "SALE",
  customerId: "",
  status: "DRAFT",
  remarks: "",
  lines: [emptyLine()],
});

function buildForm(gi: ErpGoodsIssue): GiForm {
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
      : [emptyLine()],
  };
}

function toPayload(form: GiForm): CreateGiPayload {
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

// ─── Component ─────────────────────────────────────────────────────────────────

export function ErpGoodsIssuesPage() {
  // List state
  const [items, setItems] = useState<ErpGoodsIssue[]>([]);
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
  const [editing, setEditing] = useState<ErpGoodsIssue | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<GiForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ErpGoodsIssue | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const [vehicleOptions, setVehicleOptions] = useState<
    Array<{ value: string; label: string; itemId?: string | null }>
  >([]);

  // ─── Load list ───────────────────────────────────────────────────────────────

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await goodsIssuesCoreApi.list({ page, pageSize, search });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải goods issues");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  const LOOKUP_LIMIT = 200;

  const loadVehicleLookup = useCallback(async () => {
    try {
      const res = await manufacturingApi.listVehicles({
        page: 1,
        pageSize: LOOKUP_LIMIT,
      });
      setVehicleOptions(
        res.items.map((vehicle) => ({
          value: vehicle.id,
          label: `${vehicle.vin} — ${vehicle.frame_no} — ${vehicle.engine_no}`,
          itemId: vehicle.finished_good_item_id ?? null,
        })),
      );
    } catch {
      setVehicleOptions([]);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const searchFromUrl = url.searchParams.get("search")?.trim() ?? "";
    const searchFromSession =
      window.sessionStorage.getItem("erp_goods_issue_search")?.trim() ?? "";
    const initialSearch = searchFromUrl || searchFromSession;
    if (initialSearch) {
      setSearchInput(initialSearch);
      setSearch(initialSearch);
      setPage(1);
      window.sessionStorage.removeItem("erp_goods_issue_search");
    }
  }, []);

  useEffect(() => {
    void loadIssues();
  }, [loadIssues]);

  useEffect(() => {
    void loadVehicleLookup();
  }, [loadVehicleLookup]);

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

  async function openEdit(item: ErpGoodsIssue) {
    setViewOnly(false);
    setSaveError(null);
    try {
      const detail = await goodsIssuesCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải chi tiết goods issue",
      );
    }
  }

  async function openView(item: ErpGoodsIssue) {
    setViewOnly(true);
    setSaveError(null);
    try {
      const detail = await goodsIssuesCoreApi.get(item.id);
      setEditing(detail);
      setForm(buildForm(detail));
      setDrawerOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải chi tiết goods issue",
      );
    }
  }

  // ─── Line helpers ─────────────────────────────────────────────────────────────

  function updateLine(index: number, patch: Partial<GiLineForm>) {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === index ? { ...line, ...patch } : line,
      ),
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

  // ─── Save ─────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (viewOnly) {
      closeDrawer();
      return;
    }

    if (!form.issueNo.trim()) {
      setSaveError("Số phiếu xuất kho là bắt buộc");
      return;
    }

    if (!form.issueDate) {
      setSaveError("Ngày xuất là bắt buộc");
      return;
    }

    if (!form.lines.length || form.lines.some((l) => !l.qtyIssued.trim())) {
      setSaveError("Mỗi dòng phải có số lượng xuất hợp lệ");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      if (editing) {
        await goodsIssuesCoreApi.update(editing.id, payload);
      } else {
        await goodsIssuesCoreApi.create(payload);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else await loadIssues();
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || "Không thể lưu goods issue",
      );
    } finally {
      setSaving(false);
    }
  }

  // ─── Post ─────────────────────────────────────────────────────────────────────

  async function handlePost(item: ErpGoodsIssue) {
    setPostingId(item.id);
    setError(null);
    try {
      await goodsIssuesCoreApi.post(item.id);
      await loadIssues();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể post goods issue",
      );
    } finally {
      setPostingId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await goodsIssuesCoreApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await loadIssues();
    } catch (e: any) {
      setError(
        e?.response?.data?.message || e?.message || "Không thể xóa goods issue",
      );
    } finally {
      setDeleting(false);
    }
  }

  // ─── Table columns ────────────────────────────────────────────────────────────

  const columns: DataTableColumn<ErpGoodsIssue>[] = [
    {
      key: "issueNo",
      header: "Số phiếu xuất",
      cell: (item) => <span className="font-medium">{item.issueNo}</span>,
      skeletonClassName: "w-28",
    },
    {
      key: "issueDate",
      header: "Ngày xuất",
      cell: (item) => fmtDate(item.issueDate),
      skeletonClassName: "w-20",
    },
    {
      key: "issueType",
      header: "Loại xuất",
      cell: (item) => item.issueType || "—",
      skeletonClassName: "w-16",
    },
    {
      key: "customerName",
      header: "Khách hàng",
      cell: (item) => item.customerName || item.customerId || "—",
      skeletonClassName: "w-36",
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) => item.status || "—",
      skeletonClassName: "w-16",
    },
  ];

  // ─── Filter bar ───────────────────────────────────────────────────────────────

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
          placeholder="Tìm số phiếu xuất"
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

  // ─── Drawer actions ───────────────────────────────────────────────────────────

  const drawerActions: DrawerAction[] = [
    {
      label: "Hủy",
      onClick: closeDrawer,
      variant: "outline",
    },
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
      title="ERP Goods Issues"
      desc="Xuất kho giao hàng cho đơn bán."
      icon={<Boxes className="h-5 w-5" />}
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-fg"
        >
          <Plus className="h-3.5 w-3.5" />
          Tạo mới
        </button>
      }
    >
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(item) => item.id}
        loading={loading}
        error={error}
        emptyLabel="Chưa có goods issue"
        filters={filterBar}
        minWidth={980}
        loadingRows={6}
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
                  hidden: item.status === "POSTED",
                },
                {
                  label: postingId === item.id ? "Đang post..." : "Post",
                  onClick: () => void handlePost(item),
                  icon: <PackageOpen className="h-3.5 w-3.5" />,
                  hidden: item.status === "POSTED",
                },
                {
                  label: "Xóa",
                  onClick: () => setDeleteTarget(item),
                  icon: <Trash2 className="h-3.5 w-3.5" />,
                  variant: "danger",
                  hidden: item.status !== "DRAFT",
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Xác nhận xóa"
        message={
          deleteTarget
            ? `Xóa phiếu xuất "${deleteTarget.issueNo}"? Hành động này sẽ ẩn phiếu này khỏi danh sách.`
            : ""
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        loading={deleting}
        danger
      />

      <DrawerModal
        open={drawerOpen}
        onClose={closeDrawer}
        icon={<Boxes className="h-4 w-4" />}
        title={
          viewOnly
            ? "Xem goods issue"
            : editing
              ? "Cập nhật goods issue"
              : "Tạo goods issue mới"
        }
        subtitle={editing ? editing.issueNo : "Phiếu xuất kho"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[780px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        {/* ─── Thông tin chung ─── */}
        <DrawerSection title="Thông tin chung">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="Số phiếu xuất" required>
              <input
                value={form.issueNo}
                disabled={viewOnly || !!editing}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, issueNo: e.target.value }))
                }
                className={inputCls}
                placeholder="GI-20260608-001"
              />
            </DrawerField>
            <DrawerField label="Ngày xuất" required>
              <input
                type="date"
                value={form.issueDate}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, issueDate: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Loại xuất" required>
              <Combobox
                value={form.issueType}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, issueType: value || "SALE" }))
                }
                options={ISSUE_TYPE_OPTIONS}
                placeholder="Chọn loại xuất"
              />
            </DrawerField>
            <DrawerField label="Khách hàng">
              <Combobox
                value={form.customerId}
                disabled={viewOnly}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, customerId: value }))
                }
                options={customerOptions}
                placeholder="Chọn khách hàng"
                searchPlaceholder="Tìm khách hàng"
                onSearch={setCustomerSearch}
                onScrollBottom={fetchNextCustomers}
                loading={loadingCustomers}
              />
            </DrawerField>
            <DrawerField label="Trạng thái">
              <Combobox
                value={form.status}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value || "DRAFT" }))
                }
                options={STATUS_OPTIONS}
              />
            </DrawerField>
          </div>
          <DrawerField label="Ghi chú">
            <textarea
              value={form.remarks}
              disabled={viewOnly}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, remarks: e.target.value }))
              }
              className={`${inputCls} min-h-[72px] resize-y`}
            />
          </DrawerField>
        </DrawerSection>

        {/* ─── Dòng xuất kho ─── */}
        <DrawerSection title="Dòng xuất kho">
          {!viewOnly && (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm dòng
              </button>
            </div>
          )}
          <div className="space-y-3">
            {form.lines.map((line, index) => (
              <div
                key={`gi-line-${index}`}
                className="rounded-xl border border-border bg-muted/20 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Dòng {index + 1}
                  </div>
                  {!viewOnly && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Xóa dòng
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DrawerField label="Mặt hàng">
                    <Combobox
                      value={line.itemId}
                      disabled={viewOnly}
                      onChange={(value) => {
                        const matched = itemOptions.find(
                          (opt) => opt.value === value,
                        );
                        updateLine(index, {
                          itemId: value,
                          itemName:
                            matched?.label.split(" — ").slice(1).join(" — ") ||
                            "",
                          vehicleId:
                            line.vehicleId &&
                            vehicleOptions.some(
                              (opt) =>
                                opt.value === line.vehicleId &&
                                opt.itemId === value,
                            )
                              ? line.vehicleId
                              : "",
                        });
                      }}
                      options={itemOptions}
                      placeholder="Chọn inventory item"
                      searchPlaceholder="Tìm SKU / tên"
                      onSearch={setItemSearch}
                      onScrollBottom={fetchNextItems}
                      loading={loadingItems}
                    />
                  </DrawerField>
                  <DrawerField label="Xe / VIN">
                    <Combobox
                      value={line.vehicleId}
                      disabled={viewOnly}
                      onChange={(value) => {
                        const matched = vehicleOptions.find(
                          (opt) => opt.value === value,
                        );
                        updateLine(index, {
                          vehicleId: value,
                          serialId: "",
                          itemId: matched?.itemId || line.itemId,
                        });
                      }}
                      options={vehicleOptions.filter(
                        (opt) => !line.itemId || opt.itemId === line.itemId,
                      )}
                      placeholder="Chọn xe/VIN để trace"
                      searchPlaceholder="Tìm VIN / số khung / số máy"
                    />
                  </DrawerField>
                  <DrawerField label="Số lượng xuất" required>
                    <input
                      value={line.qtyIssued}
                      disabled={viewOnly}
                      onChange={(e) =>
                        updateLine(index, { qtyIssued: e.target.value })
                      }
                      className={inputCls}
                      placeholder="1"
                    />
                  </DrawerField>
                  <DrawerField label="Đơn giá vốn">
                    <input
                      value={line.unitCost}
                      disabled={viewOnly}
                      onChange={(e) =>
                        updateLine(index, { unitCost: e.target.value })
                      }
                      className={inputCls}
                      placeholder="0"
                    />
                  </DrawerField>
                  {line.itemName && (
                    <div className="text-xs text-muted-foreground md:col-span-2">
                      Item: {line.itemName}
                    </div>
                  )}
                  {line.vehicleId && (
                    <div className="text-xs text-muted-foreground md:col-span-2">
                      VIN trace enabled for dòng này.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DrawerSection>

        {/* ─── Panel trạng thái dòng (view only, khi đã có lines từ server) ─── */}
        {editing?.lines?.length ? (
          <DrawerSection title="Trạng thái dòng xuất kho">
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">VIN / Khung / Máy</th>
                    <th className="px-3 py-2 text-right">Qty Issued</th>
                    <th className="px-3 py-2 text-right">Unit Cost</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {editing.lines.map((line: ErpGiLine, idx: number) => (
                    <tr key={line.id ?? idx} className="border-t border-border">
                      <td className="px-3 py-2">
                        {line.itemName || line.itemId || "—"}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {line.vehicleVin || line.frameNo || line.engineNo
                          ? `${line.vehicleVin || "—"} / ${line.frameNo || "—"} / ${line.engineNo || "—"}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.qtyIssued)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.unitCost)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DrawerSection>
        ) : null}
      </DrawerModal>
    </PageLayout>
  );
}
