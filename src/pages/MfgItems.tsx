import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  PackageSearch,
  Pencil,
  Plus,
  ReceiptText,
  ScanSearch,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import {
  DrawerModal,
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import {
  manufacturingApi,
  type ComponentStockSummary,
  type ComponentTxn,
  type CreateComponentDto,
  type ErpItem,
  type ErpPo,
  type ErpVehicle,
} from "@/modules/manufacturing/api/manufacturingApi";

interface ItemForm {
  item_code: string;
  item_name: string;
  tracking_type: "NONE" | "LOT" | "SERIAL";
  uom: string;
  is_active: boolean;
  notes: string;
}

const emptyForm: ItemForm = {
  item_code: "",
  item_name: "",
  tracking_type: "NONE",
  uom: "PCS",
  is_active: true,
  notes: "",
};

function buildForm(item: ErpItem): ItemForm {
  return {
    item_code: item.item_code,
    item_name: item.item_name,
    tracking_type: item.tracking_type,
    uom: item.uom || "PCS",
    is_active: item.is_active,
    notes: item.notes || "",
  };
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  return v.slice(0, 10);
}

function fmtQty(v?: number | string | null) {
  if (v == null) return "0";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("vi-VN").format(n);
}

function statusBadge(active: boolean) {
  return (
    <span
      className={
        active
          ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
          : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
      }
    >
      {active ? "Hoạt động" : "Tắt"}
    </span>
  );
}

export function MfgItems() {
  const [items, setItems] = useState<ErpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [trackingFilter, setTrackingFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpItem | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ErpItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<ComponentStockSummary | null>(
    null,
  );
  const [txnRows, setTxnRows] = useState<ComponentTxn[]>([]);
  const [txnLoading, setTxnLoading] = useState(false);

  const [poOpen, setPoOpen] = useState(false);
  const [poLoading, setPoLoading] = useState(false);
  const [poDetail, setPoDetail] = useState<ErpPo | null>(null);

  const [vinOpen, setVinOpen] = useState(false);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinDetail, setVinDetail] = useState<ErpVehicle | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await manufacturingApi.listComponents({
        page,
        pageSize,
        search,
        tracking_type: trackingFilter || undefined,
        has_stock: stockFilter || undefined,
      });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải danh mục linh kiện",
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, trackingFilter, stockFilter]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const loadDetail = useCallback(async (item: ErpItem) => {
    setDetailOpen(true);
    setDetailItem(item);
    setDetailLoading(true);
    setTxnLoading(true);
    try {
      const [stock, txns] = await Promise.all([
        manufacturingApi.getComponentStockSummary(item.id),
        manufacturingApi.listComponentTxns(item.id, { page: 1, pageSize: 20 }),
      ]);
      setDetailData(stock);
      setTxnRows(txns.items);
    } catch {
      setDetailData(null);
      setTxnRows([]);
    } finally {
      setDetailLoading(false);
      setTxnLoading(false);
    }
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setSaveError(null);
    setEditing(null);
    setViewOnly(false);
  }

  function openCreate() {
    resetForm();
    setDrawerOpen(true);
  }

  function openEdit(item: ErpItem) {
    setEditing(item);
    setViewOnly(false);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function openView(item: ErpItem) {
    setEditing(item);
    setViewOnly(true);
    setForm(buildForm(item));
    setSaveError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    resetForm();
  }

  async function handleSave() {
    if (viewOnly) {
      closeDrawer();
      return;
    }
    if (!form.item_code.trim() || !form.item_name.trim()) {
      setSaveError("Mã linh kiện và tên linh kiện là bắt buộc");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: CreateComponentDto = {
        item_code: form.item_code.trim(),
        item_name: form.item_name.trim(),
        tracking_type: form.tracking_type,
        uom: form.uom.trim() || "PCS",
        is_active: form.is_active,
        notes: form.notes.trim() || undefined,
      };
      if (editing) {
        await manufacturingApi.updateComponent(editing.id, payload);
      } else {
        await manufacturingApi.createComponent(payload);
      }
      closeDrawer();
      if (!editing && page !== 1) setPage(1);
      else await loadItems();
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || "Không thể lưu linh kiện",
      );
    } finally {
      setSaving(false);
    }
  }

  async function openPo(id: string) {
    setPoOpen(true);
    setPoLoading(true);
    try {
      setPoDetail(await manufacturingApi.getPo(id));
    } finally {
      setPoLoading(false);
    }
  }

  async function openVin(id: string) {
    setVinOpen(true);
    setVinLoading(true);
    try {
      setVinDetail(await manufacturingApi.getVehicle(id));
    } finally {
      setVinLoading(false);
    }
  }

  const columns: DataTableColumn<ErpItem>[] = [
    {
      key: "item_code",
      header: "Mã linh kiện",
      cell: (item) => <span className="font-medium">{item.item_code}</span>,
      className: "text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-24",
    },
    {
      key: "item_name",
      header: "Tên linh kiện",
      cell: (item) => item.item_name,
      className: "text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-36",
    },
    {
      key: "tracking_type",
      header: "Tracking",
      cell: (item) => item.tracking_type,
      className: "text-[color:var(--muted-fg)] text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-14",
    },
    {
      key: "uom",
      header: "ĐVT",
      cell: (item) => item.uom || "—",
      className: "text-left",
      headerClassName: "text-center",
      skeletonClassName: "w-12",
    },
    {
      key: "on_hand_qty",
      header: "Tồn kho",
      cell: (item) => fmtQty(item.on_hand_qty),
      className: "text-right font-medium",
      headerClassName: "text-center",
      skeletonClassName: "w-14 ml-auto",
    },
    {
      key: "available_qty",
      header: "Có thể dùng",
      cell: (item) => fmtQty(item.available_qty),
      className: "text-right",
      headerClassName: "text-center",
      skeletonClassName: "w-14 ml-auto",
    },
    {
      key: "is_active",
      header: "Trạng thái",
      className: "text-center",
      headerClassName: "text-center",
      cell: (item) => (
        <div className="flex justify-center w-full">
          {statusBadge(item.is_active)}
        </div>
      ),
      skeletonClassName: "w-16",
    },
  ];

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
          placeholder="Tìm mã / tên linh kiện"
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
        <div className="w-[180px]">
          <Combobox
            value={trackingFilter}
            onChange={(value) => {
              setPage(1);
              setTrackingFilter(value);
            }}
            placeholder="Tracking"
            options={[
              { value: "NONE", label: "NONE" },
              { value: "LOT", label: "LOT" },
              { value: "SERIAL", label: "SERIAL" },
            ]}
          />
        </div>
        <div className="w-[180px]">
          <Combobox
            value={stockFilter}
            onChange={(value) => {
              setPage(1);
              setStockFilter(value);
            }}
            placeholder="Tồn kho"
            options={[
              { value: "true", label: "Có tồn" },
              { value: "false", label: "Hết tồn / âm" },
            ]}
          />
        </div>
      </>
    ),
    [searchInput, trackingFilter, stockFilter],
  );

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

  return (
    <PageLayout
      title="Danh mục linh kiện"
      desc="Quản lý linh kiện sản xuất (RAW): mã, tracking, UOM, trạng thái. Xem tồn kho chi tiết per item, lịch sử nhập xuất, truy ngược PO và VIN."
      icon={<Box className="h-4 w-4" />}
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
        emptyLabel="Chưa có linh kiện"
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
                  onClick: () => openView(item),
                  icon: <ScanSearch className="h-3.5 w-3.5" />,
                },
                {
                  label: "Sửa",
                  onClick: () => openEdit(item),
                  icon: <Pencil className="h-3.5 w-3.5" />,
                },
                {
                  label: "Chi tiết tồn kho",
                  onClick: () => void loadDetail(item),
                  icon: <PackageSearch className="h-3.5 w-3.5" />,
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
        icon={<Box className="h-4 w-4" />}
        title={
          viewOnly
            ? "Xem linh kiện"
            : editing
              ? "Cập nhật linh kiện"
              : "Tạo linh kiện mới"
        }
        subtitle={
          editing ? editing.item_code : "Master data linh kiện manufacturing"
        }
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[540px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}
        <DrawerSection title="Thông tin chung">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="Mã linh kiện" required>
              <input
                value={form.item_code}
                disabled={viewOnly || !!editing}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, item_code: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Tracking" required>
              <Combobox
                value={form.tracking_type}
                disabled={viewOnly}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    tracking_type: value as ItemForm["tracking_type"],
                  }))
                }
                options={[
                  { value: "NONE", label: "NONE" },
                  { value: "LOT", label: "LOT" },
                  { value: "SERIAL", label: "SERIAL" },
                ]}
              />
            </DrawerField>
            <DrawerField label="Tên linh kiện" required>
              <input
                value={form.item_name}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, item_name: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="ĐVT">
              <input
                value={form.uom}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, uom: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
          </div>
          <DrawerField label="Ghi chú">
            <textarea
              value={form.notes}
              disabled={viewOnly}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, notes: e.target.value }))
              }
              className={`${inputCls} min-h-[88px]`}
            />
          </DrawerField>
          <label className="inline-flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={form.is_active}
              disabled={viewOnly}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, is_active: e.target.checked }))
              }
            />
            Hoạt động
          </label>
        </DrawerSection>
      </DrawerModal>

      <DrawerModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        icon={<PackageSearch className="h-4 w-4" />}
        title="Chi tiết linh kiện"
        subtitle={
          detailItem
            ? `${detailItem.item_code} · ${detailItem.item_name}`
            : undefined
        }
        actions={[
          { label: "Đóng", onClick: () => setDetailOpen(false), primary: true },
        ]}
        panelClassName="min-[1024px]:min-w-[760px]"
      >
        {detailLoading || !detailData ? (
          <div className="space-y-6">
            <DrawerSection title="Tồn kho hiện tại">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </DrawerSection>
            <DrawerSection title="Lịch sử nhập / xuất gần nhất">
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </DrawerSection>
          </div>
        ) : (
          <div className="space-y-4">
            <DrawerSection title="Tồn kho hiện tại">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                  <div className="text-muted-foreground">Tồn kho</div>
                  <div className="mt-1 text-sm font-semibold">
                    {fmtQty(detailData.stock.on_hand_qty)}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                  <div className="text-muted-foreground">Có thể dùng</div>
                  <div className="mt-1 text-sm font-semibold">
                    {fmtQty(detailData.stock.available_qty)}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                  <div className="text-muted-foreground">Lots</div>
                  <div className="mt-1 text-sm font-semibold">
                    {fmtQty(detailData.stock.lot_count)}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                  <div className="text-muted-foreground">Serials</div>
                  <div className="mt-1 text-sm font-semibold">
                    {fmtQty(detailData.stock.serial_count)}
                  </div>
                </div>
              </div>
            </DrawerSection>

            <DrawerSection title="Lịch sử nhập / xuất gần nhất">
              {txnLoading ? (
                <div className="text-sm text-muted-foreground">
                  Đang tải giao dịch...
                </div>
              ) : txnRows.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Chưa có giao dịch.
                </div>
              ) : (
                <div className="space-y-2">
                  {txnRows.map((txn) => (
                    <div
                      key={txn.id}
                      className="rounded-lg border border-border p-3 text-xs"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {txn.txn_type} · {fmtQty(txn.qty)} ·{" "}
                            {txn.source_type}
                          </div>
                          <div className="mt-1 text-muted-foreground">
                            Ngày {fmtDate(txn.txn_date)} · Tracking{" "}
                            {txn.tracking_type}
                            {txn.lot_code ? ` · Lot ${txn.lot_code}` : ""}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {txn.purchase_order?.id && (
                            <button
                              type="button"
                              onClick={() =>
                                void openPo(txn.purchase_order!.id)
                              }
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-muted"
                            >
                              <ReceiptText className="h-3 w-3" />
                              PO {txn.purchase_order.po_no}
                            </button>
                          )}
                          {txn.vin?.id && (
                            <button
                              type="button"
                              onClick={() => void openVin(txn.vin!.id)}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-muted"
                            >
                              <ScanSearch className="h-3 w-3" />
                              VIN {txn.vin.vin}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 grid gap-1 text-muted-foreground md:grid-cols-2">
                        <div>
                          Receipt:{" "}
                          {txn.receipt
                            ? `${txn.receipt.receipt_no} · ${fmtDate(txn.receipt.receipt_date)}`
                            : "—"}
                        </div>
                        <div>
                          Issue:{" "}
                          {txn.issue
                            ? `${txn.issue.issue_no} · ${fmtDate(txn.issue.issue_date)}`
                            : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DrawerSection>
          </div>
        )}
      </DrawerModal>

      <DrawerModal
        open={poOpen}
        onClose={() => setPoOpen(false)}
        icon={<ReceiptText className="h-4 w-4" />}
        title="Chi tiết PO"
        subtitle={poDetail?.po_no}
        actions={[
          { label: "Đóng", onClick: () => setPoOpen(false), primary: true },
        ]}
      >
        {poLoading || !poDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                PO No: <span className="font-medium">{poDetail.po_no}</span>
              </div>
              <div>
                Trạng thái:{" "}
                <span className="font-medium">{poDetail.status}</span>
              </div>
              <div>
                Ngày chứng từ:{" "}
                <span className="font-medium">
                  {fmtDate(poDetail.document_date)}
                </span>
              </div>
              <div>
                Ngày dự kiến nhập:{" "}
                <span className="font-medium">
                  {fmtDate(poDetail.expected_receipt_date)}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-border">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2 text-right">SL đặt</th>
                    <th className="px-3 py-2 text-right">SL nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {(poDetail.lines || []).map((line) => (
                    <tr
                      key={
                        line.id ||
                        `${line.inventory_item_id}-${line.ordered_qty}`
                      }
                      className="border-t border-border"
                    >
                      <td className="px-3 py-2">{line.inventory_item_id}</td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.ordered_qty)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmtQty(line.received_qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DrawerModal>

      <DrawerModal
        open={vinOpen}
        onClose={() => setVinOpen(false)}
        icon={<ScanSearch className="h-4 w-4" />}
        title="Chi tiết VIN"
        subtitle={vinDetail?.vin}
        actions={[
          { label: "Đóng", onClick: () => setVinOpen(false), primary: true },
        ]}
      >
        {vinLoading || !vinDetail ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              VIN: <span className="font-medium">{vinDetail.vin}</span>
            </div>
            <div>
              Trạng thái:{" "}
              <span className="font-medium">{vinDetail.status}</span>
            </div>
            <div>
              Frame No:{" "}
              <span className="font-medium">{vinDetail.frame_no}</span>
            </div>
            <div>
              Engine No:{" "}
              <span className="font-medium">{vinDetail.engine_no}</span>
            </div>
            <div>
              Ngày lắp ráp:{" "}
              <span className="font-medium">
                {fmtDate(vinDetail.assembly_date)}
              </span>
            </div>
            <div>
              Finished Good Item:{" "}
              <span className="font-medium">
                {vinDetail.finished_good_item_id || "—"}
              </span>
            </div>
          </div>
        )}
      </DrawerModal>
    </PageLayout>
  );
}
