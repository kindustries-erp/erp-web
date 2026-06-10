import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Pencil, Plus, ReceiptText, XCircle } from "lucide-react";
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
  goodsReceiptsCoreApi,
  type CreateGrPayload,
  type ErpGoodsReceipt,
} from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  purchaseOrdersCoreApi,
  type ErpPurchaseOrder,
} from "@/modules/purchase-orders-core/api/purchaseOrdersCoreApi";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";

interface GrLineForm {
  purchaseOrderLineId: string;
  itemId: string;
  itemName: string;
  itemDesc: string;
  qtyReceived: string;
  unitCost: string;
}

interface GrForm {
  receiptNo: string;
  purchaseOrderId: string;
  supplierId: string;
  receiptDate: string;
  remarks: string;
  lines: GrLineForm[];
}

const emptyForm = (): GrForm => ({
  receiptNo: "",
  purchaseOrderId: "",
  supplierId: "",
  receiptDate: new Date().toISOString().slice(0, 10),
  remarks: "",
  lines: [],
});

function buildForm(gr: ErpGoodsReceipt): GrForm {
  return {
    receiptNo: gr.receiptNo ?? "",
    purchaseOrderId: gr.purchaseOrderId ?? "",
    supplierId: gr.supplierId ?? "",
    receiptDate: gr.receiptDate ? gr.receiptDate.slice(0, 10) : "",
    remarks: gr.remarks ?? "",
    lines:
      gr.lines?.map((line) => ({
        purchaseOrderLineId: line.purchaseOrderLineId ?? "",
        itemId: line.itemId ?? "",
        itemName: line.itemName ?? "",
        itemDesc: line.itemName ?? "",
        qtyReceived: line.qtyReceived ?? "0",
        unitCost: line.unitCost ?? "",
      })) ?? [],
  };
}

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function buildPayload(form: GrForm): CreateGrPayload {
  return {
    receiptNo: form.receiptNo.trim(),
    purchaseOrderId: form.purchaseOrderId || undefined,
    supplierId: form.supplierId || undefined,
    receiptDate: form.receiptDate,
    remarks: form.remarks.trim() || undefined,
    lines: form.lines.map((line) => ({
      purchaseOrderLineId: line.purchaseOrderLineId || undefined,
      itemId: line.itemId || undefined,
      qtyReceived: line.qtyReceived,
      unitCost: line.unitCost || undefined,
    })),
  };
}

export function ErpGoodsReceiptsPage() {
  const navigate = useAppStore((s) => s.navigate);
  const showToast = useUIStore((s) => s.showToast);
  const [items, setItems] = useState<ErpGoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<ErpGoodsReceipt | null>(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [form, setForm] = useState<GrForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const [poOptions, setPoOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [poLabelMap, setPoLabelMap] = useState<Record<string, string>>({});

  function remainingQty(
    poLine?: NonNullable<ErpPurchaseOrder["lines"]>[number],
  ) {
    const ordered = Number(poLine?.qtyOrdered ?? 0);
    const received = Number(poLine?.qtyReceived ?? 0);
    return Math.max(0, ordered - received);
  }

  function poHasOpenQty(po: ErpPurchaseOrder): boolean {
    const lines = po.lines;
    // Nếu không có lines inline (API không trả về), tin tưởng status
    if (!lines || lines.length === 0) return true;
    return lines.some((line) => remainingQty(line) > 0);
  }

  function isPoActionable(po: ErpPurchaseOrder): boolean {
    const blockedStatuses = ["DRAFT", "CANCELLED"];
    if (po.status && blockedStatuses.includes(po.status)) return false;
    if (!po.lines || po.lines.length === 0) return false;
    return poHasOpenQty(po);
  }

  const loadReceipts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await goodsReceiptsCoreApi.list({ page, pageSize, search });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải goods receipts");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  const loadPoOptions = useCallback(async () => {
    try {
      // Load 200 PO đầu để có đủ lựa chọn
      const res = await purchaseOrdersCoreApi.list({ page: 1, pageSize: 200 });
      const actionable = res.items.filter(isPoActionable);
      const mapped = actionable.map((po) => {
        const totalRemaining = (po.lines || []).reduce(
          (sum, line) => sum + remainingQty(line),
          0,
        );
        const remainingLabel =
          po.lines && po.lines.length > 0 ? ` — còn ${totalRemaining}` : "";
        return {
          value: po.id,
          label: `${po.poNo} — ${po.supplierName || po.supplierId || "N/A"} — ${po.status ?? "N/A"}${remainingLabel}`,
        };
      });
      setPoOptions(mapped);
      setPoLabelMap(
        Object.fromEntries(res.items.map((po) => [po.id, po.poNo || po.id])),
      );
    } catch {
      setPoOptions([]);
    }
  }, []);

  useEffect(() => {
    void loadReceipts();
  }, [loadReceipts]);

  useEffect(() => {
    void loadPoOptions();
  }, [loadPoOptions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const purchaseOrderId = params.get("purchaseOrderId") || "";
    const mode = params.get("mode") || "";

    if (!drawerOpen && purchaseOrderId && mode === "from-po") {
      resetForm();
      setDrawerOpen(true);
      void loadPoIntoForm(purchaseOrderId);
      params.delete("purchaseOrderId");
      params.delete("mode");
      const nextQuery = params.toString();
      history.replaceState(
        null,
        "",
        nextQuery
          ? `${window.location.pathname}?${nextQuery}`
          : window.location.pathname,
      );
    }
  }, [drawerOpen]);

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
    // Auto-fill số NK tiếp theo
    void goodsReceiptsCoreApi
      .nextNo()
      .then((no) => {
        setForm((prev) => ({ ...prev, receiptNo: no }));
      })
      .catch(() => {
        /* silent — user có thể nhập tay */
      });
  }

  async function loadPoIntoForm(poId: string) {
    if (!poId) {
      setForm((prev) => ({
        ...prev,
        purchaseOrderId: "",
        supplierId: "",
        lines: [],
      }));
      return;
    }

    try {
      const po: ErpPurchaseOrder = await purchaseOrdersCoreApi.get(poId);
      setForm((prev) => ({
        ...prev,
        purchaseOrderId: po.id,
        supplierId: po.supplierId ?? "",
        lines:
          po.lines
            ?.filter((line) => remainingQty(line) > 0)
            .map((line) => ({
              purchaseOrderLineId: line.id ?? "",
              itemId: line.itemId ?? "",
              itemName: line.itemName ?? line.description ?? line.itemId ?? "",
              itemDesc: line.description ?? "",
              qtyReceived: String(remainingQty(line)),
              unitCost: line.unitPrice ?? "",
            })) ?? [],
      }));
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Không thể load PO");
    }
  }

  async function enrichReceipt(
    detail: ErpGoodsReceipt,
  ): Promise<ErpGoodsReceipt> {
    if (!detail.purchaseOrderId || !detail.lines?.length) return detail;
    try {
      const po = await purchaseOrdersCoreApi.get(detail.purchaseOrderId);
      const lineMap = new Map((po.lines || []).map((line) => [line.id, line]));
      return {
        ...detail,
        lines: detail.lines.map((line) => {
          const poLine = lineMap.get(line.purchaseOrderLineId);
          return {
            ...line,
            itemName:
              line.itemName ||
              poLine?.itemName ||
              poLine?.description ||
              line.itemId ||
              "",
          };
        }),
      };
    } catch {
      return detail;
    }
  }

  async function openEdit(item: ErpGoodsReceipt) {
    setViewOnly(false);
    setSaveError(null);
    try {
      const detail = await goodsReceiptsCoreApi.get(item.id);
      const enriched = await enrichReceipt(detail);
      setEditing(enriched);
      setForm(buildForm(enriched));
      setDrawerOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải chi tiết goods receipt",
      );
    }
  }

  async function openView(item: ErpGoodsReceipt) {
    setViewOnly(true);
    setSaveError(null);
    try {
      const detail = await goodsReceiptsCoreApi.get(item.id);
      const enriched = await enrichReceipt(detail);
      setEditing(enriched);
      setForm(buildForm(enriched));
      setDrawerOpen(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Không thể tải chi tiết goods receipt",
      );
    }
  }

  async function handleSave() {
    if (viewOnly) {
      closeDrawer();
      return;
    }

    if (!form.lines.length) {
      setSaveError("Phải có ít nhất 1 dòng nhập kho từ PO");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const payload = buildPayload(form);
      if (editing) {
        // Cập nhật GR đã tồn tại — không auto-post
        await goodsReceiptsCoreApi.update(editing.id, payload);
        closeDrawer();
        await loadReceipts();
      } else {
        // Tạo mới: create xong auto-post luôn
        const created = await goodsReceiptsCoreApi.create(payload);
        await goodsReceiptsCoreApi.post(created.id);
        showToast({ title: "Nhập kho thành công!", variant: "success" });
        closeDrawer();
        if (page !== 1) setPage(1);
        else await loadReceipts();
        navigate("inventory");
      }
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message || e?.message || "Không thể lưu / nhập kho",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePost(item: ErpGoodsReceipt) {
    setPostingId(item.id);
    try {
      await goodsReceiptsCoreApi.post(item.id);
      showToast({ title: "Nhập kho thành công!", variant: "success" });
      await loadReceipts();
      navigate("inventory");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể post goods receipt");
    } finally {
      setPostingId(null);
    }
  }

  async function handleCancel(item: ErpGoodsReceipt) {
    setCancelId(item.id);
    try {
      await goodsReceiptsCoreApi.cancel(item.id);
      showToast({ title: "Đã hủy phiếu nhập", variant: "success" });
      await loadReceipts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể hủy phiếu nhập");
    } finally {
      setCancelId(null);
    }
  }

  const columns: DataTableColumn<ErpGoodsReceipt>[] = [
    {
      key: "receiptNo",
      header: "Số phiếu nhập",
      cell: (item) => <span className="font-medium">{item.receiptNo}</span>,
      skeletonClassName: "w-28",
    },
    {
      key: "purchaseOrderId",
      header: "PO",
      cell: (item) =>
        (item.purchaseOrderId ? poLabelMap[item.purchaseOrderId] : undefined) ||
        item.purchaseOrderId ||
        "—",
      skeletonClassName: "w-32",
    },
    {
      key: "supplierName",
      header: "Nhà cung cấp",
      cell: (item) => item.supplierName || "—",
      skeletonClassName: "w-40",
    },
    {
      key: "receiptDate",
      header: "Ngày nhập",
      cell: (item) => fmtDate(item.receiptDate),
      skeletonClassName: "w-20",
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (item) => {
        const s = item.status || "";
        const cls =
          s === "POSTED"
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : s === "CANCELLED"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
        const label =
          s === "POSTED"
            ? "Đã ghi sổ"
            : s === "CANCELLED"
              ? "Đã hủy"
              : s || "—";
        return (
          <span
            className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${cls}`}
          >
            {label}
          </span>
        );
      },
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
          placeholder="Tìm số phiếu nhập"
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
      title="ERP Goods Receipts"
      desc="Ghi nhận nhập kho từ đơn mua hàng."
      icon={<Boxes className="h-5 w-5" />}
      actions={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
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
        emptyLabel="Chưa có goods receipt"
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
                },
                {
                  label:
                    cancelId === item.id ? "Đang hủy..." : "Hủy phiếu nhập",
                  onClick: () => void handleCancel(item),
                  icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
                  hidden: item.status !== "POSTED",
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
        icon={<Boxes className="h-4 w-4" />}
        title={
          viewOnly
            ? "Xem goods receipt"
            : editing
              ? "Cập nhật goods receipt"
              : "Tạo goods receipt mới"
        }
        subtitle={editing ? editing.receiptNo : "Nhập kho từ purchase order"}
        actions={drawerActions}
        panelClassName="min-[1024px]:min-w-[780px]"
      >
        {saveError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {saveError}
          </div>
        )}

        <DrawerSection title="Thông tin chung">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="Số phiếu nhập">
              <input
                value={form.receiptNo}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, receiptNo: e.target.value }))
                }
                placeholder="NK-YYYYMM001 (tự động điền, có thể sửa)"
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Ngày nhập" required>
              <input
                type="date"
                value={form.receiptDate}
                disabled={viewOnly}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, receiptDate: e.target.value }))
                }
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label="Purchase Order">
              <Combobox
                value={form.purchaseOrderId}
                disabled={viewOnly || !!editing}
                onChange={(value) => {
                  void loadPoIntoForm(value);
                }}
                options={poOptions}
                placeholder="Chọn PO để lấy dòng"
                searchPlaceholder="Tìm PO"
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
              className={`${inputCls} min-h-[88px] resize-y`}
            />
          </DrawerField>
        </DrawerSection>

        <DrawerSection title="Dòng nhập kho từ PO">
          <div className="space-y-3">
            {form.lines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                Chỉ hiện PO còn open qty để nhập kho. PO nháp hoặc đã hủy sẽ bị
                loại. PO đã nhập đủ sẽ không còn trong danh sách chọn dù status
                header là gì.
              </div>
            ) : (
              form.lines.map((line, index) => (
                <div
                  key={`${index}-${line.purchaseOrderLineId}`}
                  className="rounded-xl border border-border bg-muted/20 p-3"
                >
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">
                    Dòng {index + 1}
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <DrawerField label="Mặt hàng">
                      <input
                        value={line.itemName}
                        disabled
                        className={inputCls}
                      />
                    </DrawerField>
                    <DrawerField label="Mô tả / tham chiếu dòng PO">
                      <input
                        value={line.itemDesc}
                        disabled
                        className={inputCls}
                      />
                    </DrawerField>
                    <DrawerField label="Số lượng nhập" required>
                      <input
                        value={line.qtyReceived}
                        disabled={viewOnly}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            lines: prev.lines.map((row, i) =>
                              i === index
                                ? { ...row, qtyReceived: e.target.value }
                                : row,
                            ),
                          }))
                        }
                        className={inputCls}
                      />
                    </DrawerField>
                    <DrawerField label="Đơn giá">
                      <input
                        value={line.unitCost}
                        disabled={viewOnly}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            lines: prev.lines.map((row, i) =>
                              i === index
                                ? { ...row, unitCost: e.target.value }
                                : row,
                            ),
                          }))
                        }
                        className={inputCls}
                      />
                    </DrawerField>
                  </div>
                </div>
              ))
            )}
          </div>
        </DrawerSection>
      </DrawerModal>
    </PageLayout>
  );
}
