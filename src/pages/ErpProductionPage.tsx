import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Factory,
  RotateCcw,
  ArrowRight,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { PageLayout } from "@/shared/components/PageLayout";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { Forbidden } from "@/pages/Forbidden";
import {
  productionCoreApi,
  type ErpProductionOrder,
  type ExecuteProductionResult,
} from "@/modules/production-core/api/productionCoreApi";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import {
  manufacturingApi,
  type CreateVehicleDto,
} from "@/modules/manufacturing/api/manufacturingApi";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";

const LOOKUP_LIMIT = 200;

interface ProductionForm {
  finishedGoodItemId: string;
  qtyToProduce: string;
  warehouseCode: string;
  referenceNo: string;
}

interface VehicleForm {
  batch_lines: string;
  notes: string;
}

const emptyForm = (): ProductionForm => ({
  finishedGoodItemId: "",
  qtyToProduce: "1",
  warehouseCode: "",
  referenceNo: "",
});

const emptyVehicleForm = (): VehicleForm => ({
  batch_lines: "",
  notes: "",
});

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

// ─── Result Panel ──────────────────────────────────────────────────────────────

function ResultPanel({ result }: { result: ExecuteProductionResult }) {
  const [showRaw, setShowRaw] = useState(false);
  const navigate = useAppStore((s) => s.navigate);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
        <span className="text-sm font-semibold text-emerald-800">
          Thực hiện sản xuất thành công
        </span>
      </div>

      {/* Key fields */}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 mb-0.5">
            Reference No
          </div>
          <div className="text-sm font-semibold text-foreground">
            {result.referenceNo || "—"}
          </div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 mb-0.5">
            Trạng thái
          </div>
          <div className="text-sm font-semibold text-foreground">
            {result.status || "—"}
          </div>
        </div>
        {result.finishedGoodItemName || result.finishedGoodItemId ? (
          <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 mb-0.5">
              Thành phẩm
            </div>
            <div className="text-sm font-semibold text-foreground">
              {result.finishedGoodItemName || result.finishedGoodItemId}
            </div>
          </div>
        ) : null}
        {result.qtyProduced ? (
          <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 mb-0.5">
              Số lượng sản xuất
            </div>
            <div className="text-sm font-semibold text-foreground">
              {fmtQty(result.qtyProduced)}
            </div>
          </div>
        ) : null}
        {result.finishedGoodReceipt?.newStockQty ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-100/50 px-3 py-2">
            <div className="text-[10px] font-medium uppercase tracking-wide text-emerald-700 mb-0.5">
              Tồn kho hiện tại (FG)
            </div>
            <div className="text-sm font-bold text-emerald-900">
              {fmtQty(result.finishedGoodReceipt.newStockQty)}
            </div>
          </div>
        ) : null}
      </div>

      {/* Materials issued */}
      {result.materialsIssued && result.materialsIssued.length > 0 ? (
        <div>
          <div className="text-xs font-semibold text-emerald-700 mb-2">
            Nguyên vật liệu đã xuất ({result.materialsIssued.length} mặt hàng)
          </div>
          <div className="overflow-x-auto rounded-xl border border-emerald-100">
            <table className="min-w-full text-xs">
              <thead className="bg-emerald-50 text-left uppercase tracking-wide text-emerald-600">
                <tr>
                  <th className="px-3 py-2">Mặt hàng</th>
                  <th className="px-3 py-2 text-right">Qty xuất</th>
                  <th className="px-3 py-2 text-right">Tồn sau xuất</th>
                  <th className="px-3 py-2">ĐVT</th>
                </tr>
              </thead>
              <tbody>
                {result.materialsIssued.map((mat, idx) => (
                  <tr
                    key={mat.itemId ?? idx}
                    className="border-t border-emerald-100 bg-white"
                  >
                    <td className="px-3 py-2">
                      {mat.itemName || mat.itemId || "—"}
                    </td>
                    <td className="px-3 py-2 text-right font-medium">
                      {fmtQty(mat.qtyIssued)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-emerald-800">
                      {mat.newStockQty ? fmtQty(mat.newStockQty) : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {mat.uom || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* goodsIssue if present */}
      {result.goodsIssue ? (
        <div className="rounded-xl border border-amber-100 bg-white px-3 py-2 text-xs space-y-2">
          <div className="font-semibold text-amber-700 mb-1">
            Phiếu xuất kho nguyên vật liệu
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {result.goodsIssue.issueNo ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Issue No:</span>
                <span className="font-medium">{result.goodsIssue.issueNo}</span>
              </div>
            ) : null}
            {result.goodsIssue.issueDate ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Ngày:</span>
                <span className="font-medium">
                  {fmtDate(result.goodsIssue.issueDate)}
                </span>
              </div>
            ) : null}
            {result.goodsIssue.status ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Trạng thái:</span>
                <span className="font-medium">{result.goodsIssue.status}</span>
              </div>
            ) : null}
            {result.goodsIssue.issueType ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Loại:</span>
                <span className="font-medium">
                  {result.goodsIssue.issueType}
                </span>
              </div>
            ) : null}
          </div>
          {result.goodsIssue.issueNo ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  const issueNo = result.goodsIssue?.issueNo ?? "";
                  if (issueNo) {
                    window.sessionStorage.setItem(
                      "erp_goods_issue_search",
                      issueNo,
                    );
                  }
                  navigate("erp-goods-issues");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100"
              >
                Xem phiếu xuất kho này
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* finishedGoodReceipt if present */}
      {result.finishedGoodReceipt ? (
        <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-xs space-y-1 flex justify-between items-center">
          <div>
            <div className="font-semibold text-emerald-700 mb-1">
              Phiếu nhập thành phẩm
            </div>
            {result.finishedGoodReceipt.receiptNo ? (
              <div className="flex gap-2">
                <span className="text-muted-foreground">Receipt No:</span>
                <span className="font-medium">
                  {result.finishedGoodReceipt.receiptNo as string}
                </span>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => navigate("inventory")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Đến Kho để xem
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* Raw JSON toggle */}
      <button
        type="button"
        onClick={() => setShowRaw((v) => !v)}
        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800"
      >
        {showRaw ? (
          <ChevronUp className="h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5" />
        )}
        {showRaw ? "Ẩn raw response" : "Xem raw response"}
      </button>
      {showRaw && (
        <pre className="overflow-x-auto rounded-xl bg-white border border-emerald-100 p-3 text-[11px] text-foreground/70 max-h-[240px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export function ErpProductionPage() {
  const showToast = useUIStore((s) => s.showToast);
  const canRead = useHasPermission("production", "read");

  // ── Inventory item lookup ──
  const [itemOptions, setItemOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // ── Execute form ──
  const [form, setForm] = useState<ProductionForm>(emptyForm);
  const [executing, setExecuting] = useState(false);
  const [execError, setExecError] = useState<string | null>(null);
  const [result, setResult] = useState<ExecuteProductionResult | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(emptyVehicleForm);
  const [vehicleSaving, setVehicleSaving] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // ── History list ──
  const [orders, setOrders] = useState<ErpProductionOrder[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState<string | null>(null);
  const [histPage, setHistPage] = useState(1);
  const [histPageSize] = useState(20);
  const [histTotal, setHistTotal] = useState(0);
  const [histTotalPages, setHistTotalPages] = useState(0);

  // ── Load lookups ──
  const loadItems = useCallback(async () => {
    try {
      const res = await inventoryCoreApi.list({
        page: 1,
        pageSize: LOOKUP_LIMIT,
      });
      setItemOptions(
        res.items.map((item: ErpInventoryItem) => ({
          value: item.id,
          label: `${item.sku} — ${item.itemName}`,
        })),
      );
    } catch {
      setItemOptions([]);
    }
  }, []);

  // ── Load history ──
  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    setHistError(null);
    try {
      const res = await productionCoreApi.list({
        page: histPage,
        pageSize: histPageSize,
      });
      setOrders(res.items);
      setHistTotal(res.total);
      setHistTotalPages(res.totalPages);
    } catch (e) {
      setHistError(
        e instanceof Error ? e.message : "Không thể tải lịch sử sản xuất",
      );
    } finally {
      setHistLoading(false);
    }
  }, [histPage, histPageSize]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // ── Execute ──
  async function handleExecute() {
    if (!form.finishedGoodItemId) {
      setExecError("Vui lòng chọn thành phẩm");
      return;
    }
    if (!form.qtyToProduce.trim() || Number(form.qtyToProduce) <= 0) {
      setExecError("Số lượng sản xuất phải lớn hơn 0");
      return;
    }

    setExecuting(true);
    setExecError(null);
    setResult(null);
    try {
      const payload = {
        finishedGoodItemId: form.finishedGoodItemId,
        qtyToProduce: form.qtyToProduce,
        ...(form.warehouseCode.trim()
          ? { warehouseCode: form.warehouseCode.trim() }
          : {}),
        ...(form.referenceNo.trim()
          ? { referenceNo: form.referenceNo.trim() }
          : {}),
      };
      const res = await productionCoreApi.execute(payload);
      setResult(res);
      setVehicleForm({
        batch_lines: "",
        notes: res.referenceNo ? `Tạo sau sản xuất ${res.referenceNo}` : "",
      });
      setVehicleError(null);
      showToast({ title: "Sản xuất thành công!", variant: "success" });
      // Reload history to include the new order
      await loadHistory();
    } catch (e: any) {
      setExecError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể thực hiện lệnh sản xuất",
      );
    } finally {
      setExecuting(false);
    }
  }

  async function handleCreateVehicle() {
    if (!result?.finishedGoodItemId) {
      setVehicleError("Chưa có thành phẩm từ lần sản xuất gần nhất");
      return;
    }

    const rows = vehicleForm.batch_lines
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!rows.length) {
      setVehicleError("Phải nhập ít nhất 1 dòng số khung / số máy");
      return;
    }

    const parsed = rows.map((row, index) => {
      const parts = row.split("|").map((x) => x.trim());
      return {
        rowNo: index + 1,
        frame_no: parts[0] || "",
        engine_no: parts[1] || "",
        serial_no: parts[2] || "",
      };
    });

    const invalid = parsed.find((row) => !row.frame_no || !row.engine_no);
    if (invalid) {
      setVehicleError(
        `Dòng ${invalid.rowNo} thiếu số khung hoặc số máy. Format: so_khung|so_may|serial(optional)`,
      );
      return;
    }

    const qtyProduced = Number(result.qtyProduced || 0);
    if (qtyProduced > 0 && parsed.length !== qtyProduced) {
      setVehicleError(
        `Đã sản xuất ${qtyProduced} xe, cần nhập đúng ${qtyProduced} dòng số khung/số máy`,
      );
      return;
    }

    setVehicleSaving(true);
    setVehicleError(null);
    try {
      for (const row of parsed) {
        const payload: CreateVehicleDto = {
          frame_no: row.frame_no,
          engine_no: row.engine_no,
          serial_no: row.serial_no || undefined,
          notes: vehicleForm.notes.trim() || undefined,
          finished_good_item_id: result.finishedGoodItemId,
          assembly_date: new Date().toISOString().slice(0, 10),
        };
        await manufacturingApi.createVehicle(payload);
      }
      showToast({
        title: `Đã tạo ${parsed.length} xe thành công`,
        variant: "success",
      });
      setVehicleForm(emptyVehicleForm());
    } catch (e: any) {
      setVehicleError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tạo xe theo batch",
      );
    } finally {
      setVehicleSaving(false);
    }
  }

  function handleReset() {
    setForm(emptyForm());
    setResult(null);
    setExecError(null);
    setVehicleForm(emptyVehicleForm());
    setVehicleError(null);
  }

  // ── History table columns ──
  const histColumns: DataTableColumn<ErpProductionOrder>[] = useMemo(
    () => [
      {
        key: "referenceNo",
        header: "Reference No",
        cell: (item) => (
          <span className="font-medium">{item.referenceNo || "—"}</span>
        ),
        skeletonClassName: "w-28",
      },
      {
        key: "finishedGoodItemName",
        header: "Thành phẩm",
        cell: (item) =>
          item.finishedGoodItemName || item.finishedGoodItemId || "—",
        skeletonClassName: "w-40",
      },
      {
        key: "qtyProduced",
        header: "Qty",
        cell: (item) => fmtQty(item.qtyProduced as string | null | undefined),
        skeletonClassName: "w-16",
      },
      {
        key: "status",
        header: "Trạng thái",
        cell: (item) => item.status || "—",
        skeletonClassName: "w-16",
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        cell: (item) => fmtDate(item.createdAt),
        skeletonClassName: "w-20",
      },
    ],
    [],
  );

  // ── Render ──
  if (!canRead) return <Forbidden />;

  return (
    <PageLayout
      title="Sản xuất"
      desc="Quản lý lệnh sản xuất và theo dõi tiến độ thực hiện."
      icon={<Factory className="h-5 w-5" />}
      className="p-4 md:p-6"
    >
      <div className="space-y-4">
        {/* ─── Execute form ─── */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Factory className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold text-foreground">
              Thực hiện lệnh sản xuất
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="Thành phẩm" required>
              <Combobox
                value={form.finishedGoodItemId}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, finishedGoodItemId: value }))
                }
                options={itemOptions}
                placeholder="Chọn thành phẩm"
                searchPlaceholder="Tìm SKU / tên thành phẩm"
                disabled={executing}
              />
            </DrawerField>

            <DrawerField label="Số lượng sản xuất" required>
              <input
                type="number"
                min="0.001"
                step="any"
                value={form.qtyToProduce}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, qtyToProduce: e.target.value }))
                }
                disabled={executing}
                className={inputCls}
                placeholder="1"
              />
            </DrawerField>

            <DrawerField label="Warehouse Code (tùy chọn)">
              <input
                value={form.warehouseCode}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    warehouseCode: e.target.value,
                  }))
                }
                disabled={executing}
                className={inputCls}
                placeholder="Ví dụ: WH-01"
              />
            </DrawerField>

            <DrawerField label="Reference No (tùy chọn)">
              <input
                value={form.referenceNo}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    referenceNo: e.target.value,
                  }))
                }
                disabled={executing}
                className={inputCls}
                placeholder="Tự động nếu để trống"
              />
            </DrawerField>
          </div>

          {execError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {execError}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void handleExecute()}
              disabled={executing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-fg disabled:opacity-60"
            >
              {executing ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Đang thực hiện...
                </>
              ) : (
                <>
                  <Factory className="h-3.5 w-3.5" />
                  Thực hiện sản xuất
                </>
              )}
            </button>
            {(result || execError) && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ─── Result panel ─── */}
        {result && <ResultPanel result={result} />}

        {result?.finishedGoodItemId && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 space-y-0.5">
              <h3 className="text-base font-semibold text-foreground">
                Nhập batch số khung / số máy sau sản xuất
              </h3>
              <p className="text-sm text-muted-foreground">
                Mỗi dòng tương ứng 1 xe. Format:
                số_khung|số_máy|serial(optional).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <DrawerField
                  label="Batch số khung | số máy | serial(optional)"
                  required
                >
                  <textarea
                    value={vehicleForm.batch_lines}
                    onChange={(e) =>
                      setVehicleForm((prev) => ({
                        ...prev,
                        batch_lines: e.target.value,
                      }))
                    }
                    disabled={vehicleSaving}
                    className={`${inputCls} min-h-[180px]`}
                    placeholder={"SK001|SM001|SER001\nSK002|SM002\nSK003|SM003"}
                  />
                </DrawerField>
              </div>
              <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Số khung là mã canonical của xe; không nhập VIN riêng nữa. Nếu
                sản xuất 10 xe thì nhập đúng 10 dòng.
              </div>
              <div className="md:col-span-2">
                <DrawerField label="Ghi chú">
                  <input
                    value={vehicleForm.notes}
                    onChange={(e) =>
                      setVehicleForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    disabled={vehicleSaving}
                    className={inputCls}
                    placeholder="Ghi chú tùy chọn"
                  />
                </DrawerField>
              </div>
            </div>
            {vehicleError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {vehicleError}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => void handleCreateVehicle()}
                disabled={vehicleSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-fg disabled:opacity-60"
              >
                Tạo xe / VIN
              </button>
            </div>
          </div>
        )}

        {/* ─── History ─── */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 space-y-0.5">
            <h3 className="text-base font-semibold text-foreground">
              Lịch sử lệnh sản xuất
            </h3>
            <p className="text-sm text-muted-foreground">
              Danh sách lệnh sản xuất đã thực hiện.
            </p>
          </div>

          <DataTable
            items={orders}
            columns={histColumns}
            getRowKey={(item) => item.id}
            loading={histLoading}
            error={histError}
            emptyLabel="Chưa có lệnh sản xuất nào"
            minWidth={760}
            loadingRows={5}
            page={histPage}
            pageSize={histPageSize}
            total={histTotal}
            totalPages={histTotalPages}
            onPage={setHistPage}
            onPageSize={() => {}}
          />
        </div>
      </div>
    </PageLayout>
  );
}
