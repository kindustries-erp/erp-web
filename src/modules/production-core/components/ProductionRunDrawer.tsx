import { useState, useCallback, useEffect, useRef } from "react";
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import {
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";

import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { cn } from "@/shared/utils";

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtQty(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const maybe = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };
    return maybe.response?.data?.message || maybe.message || fallback;
  }
  return fallback;
}

const UNIT_ROW_THRESHOLD = 50;

// ── Types ──────────────────────────────────────────────────────────────────

interface ProductionIdentifier {
  vinNo: string;
  engineNo: string;
  serialNo: string;
  lotNo: string;
  notes: string;
  attributes: Array<{ key: string; value: string }>;
}

type TrackingPolicy = "NONE" | "SERIAL" | "LOT" | "VEHICLE" | "CUSTOM";

function emptyIdentifier(): ProductionIdentifier {
  return {
    vinNo: "",
    engineNo: "",
    serialNo: "",
    lotNo: "",
    notes: "",
    attributes: [],
  };
}

function makeIdentifierRows(qty: number): ProductionIdentifier[] {
  return Array.from({ length: Math.max(1, Math.floor(qty)) }, emptyIdentifier);
}

function isIdentifierValid(
  id: ProductionIdentifier,
  policy: TrackingPolicy,
): boolean {
  if (policy === "VEHICLE") return !!id.vinNo.trim() && !!id.engineNo.trim();
  if (policy === "SERIAL") return !!id.serialNo.trim();
  if (policy === "LOT") return !!id.lotNo.trim();
  return true;
}

function identifiersAllValid(
  ids: ProductionIdentifier[],
  policy: TrackingPolicy,
): boolean {
  if (policy === "NONE") return true;
  return ids.every((id) => isIdentifierValid(id, policy));
}

function findVehicleDuplicate(ids: ProductionIdentifier[]) {
  const seenVin = new Set<string>();
  const seenEngine = new Set<string>();
  for (const row of ids) {
    const vin = row.vinNo.trim().toUpperCase();
    const engine = row.engineNo.trim().toUpperCase();
    if (vin) {
      if (seenVin.has(vin)) return "Số VIN bị trùng trong danh sách";
      seenVin.add(vin);
    }
    if (engine) {
      if (seenEngine.has(engine)) return "Số máy bị trùng trong danh sách";
      seenEngine.add(engine);
    }
  }
  return null;
}

function parseVehicleBulkInput(input: string): ProductionIdentifier[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes("\t") ? line.split("\t") : line.split(",");
      return {
        vinNo: (parts[0] ?? "").trim(),
        engineNo: (parts[1] ?? "").trim(),
        serialNo: "",
        lotNo: "",
        notes: "",
        attributes: [],
      };
    });
}

export interface ProductionRunDrawerProps {
  open: boolean;
  loading?: boolean;
  order: ErpProductionOrder | null;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

// ── Identifier input table ─────────────────────────────────────────────────

function IdentifierTable({
  policy,
  identifiers,
  onChange,
  onAttributeAdd,
  onAttributeChange,
  onAttributeRemove,
  saving,
  t,
}: {
  policy: TrackingPolicy;
  identifiers: ProductionIdentifier[];
  onChange: (
    idx: number,
    field: keyof Omit<ProductionIdentifier, "attributes">,
    value: string,
  ) => void;
  onAttributeAdd: (idx: number) => void;
  onAttributeChange: (
    idx: number,
    attrIdx: number,
    field: "key" | "value",
    value: string,
  ) => void;
  onAttributeRemove: (idx: number, attrIdx: number) => void;
  saving: boolean;
  t: (s: string) => string;
}) {
  if (policy === "NONE") return null;
  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-semibold text-emerald-900">
        {policy === "VEHICLE" && t("Thông tin định danh xe (VIN / Số máy)")}
        {policy === "SERIAL" && t("Số serial từng đơn vị")}
        {policy === "LOT" && t("Số lô từng đơn vị")}
        {policy === "CUSTOM" && t("Định danh tùy chỉnh")}
      </p>
      <div className="overflow-x-auto rounded-md border border-emerald-200">
        <table className="min-w-full text-xs">
          <thead className="bg-emerald-100 text-emerald-800">
            <tr>
              <th className="px-2 py-1 text-left font-semibold">#</th>
              {policy === "VEHICLE" && (
                <>
                  <th className="px-2 py-1 text-left font-semibold">
                    {t("Số VIN")} <span className="text-red-500">*</span>
                  </th>
                  <th className="px-2 py-1 text-left font-semibold">
                    {t("Số máy")} <span className="text-red-500">*</span>
                  </th>
                </>
              )}
              {policy === "SERIAL" && (
                <th className="px-2 py-1 text-left font-semibold">
                  {t("Serial")} <span className="text-red-500">*</span>
                </th>
              )}
              {policy === "LOT" && (
                <th className="px-2 py-1 text-left font-semibold">
                  {t("Số lô")} <span className="text-red-500">*</span>
                </th>
              )}
              {policy === "CUSTOM" && (
                <th className="px-2 py-1 text-left font-semibold">
                  {t("Định danh")} <span className="text-red-500">*</span>
                </th>
              )}
              <th className="px-2 py-1 text-left font-semibold">
                {t("Ghi chú")}
              </th>
              <th className="px-2 py-1 text-left font-semibold min-w-[200px]">
                {t("Thuộc tính mở rộng")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-100 bg-white">
            {identifiers.map((id, i) => (
              <tr key={i} className="align-top">
                <td className="px-2 py-2 text-muted-foreground">{i + 1}</td>
                {policy === "VEHICLE" && (
                  <>
                    <td className="px-1 py-2">
                      <input
                        disabled={saving}
                        className={cn(inputCls, "w-28")}
                        placeholder={t("Số VIN")}
                        value={id.vinNo}
                        onChange={(e) => onChange(i, "vinNo", e.target.value)}
                      />
                    </td>
                    <td className="px-1 py-2">
                      <input
                        disabled={saving}
                        className={cn(inputCls, "w-24")}
                        placeholder={t("Số máy")}
                        value={id.engineNo}
                        onChange={(e) =>
                          onChange(i, "engineNo", e.target.value)
                        }
                      />
                    </td>
                  </>
                )}
                {policy === "SERIAL" && (
                  <td className="px-1 py-2">
                    <input
                      disabled={saving}
                      className={cn(inputCls, "w-32")}
                      placeholder="SN"
                      value={id.serialNo}
                      onChange={(e) => onChange(i, "serialNo", e.target.value)}
                    />
                  </td>
                )}
                {policy === "LOT" && (
                  <td className="px-1 py-2">
                    <input
                      disabled={saving}
                      className={cn(inputCls, "w-32")}
                      placeholder={t("Số lô")}
                      value={id.lotNo}
                      onChange={(e) => onChange(i, "lotNo", e.target.value)}
                    />
                  </td>
                )}
                {policy === "CUSTOM" && (
                  <td className="px-1 py-2">
                    <input
                      disabled={saving}
                      className={cn(inputCls, "w-32")}
                      placeholder={t("Định danh")}
                      value={id.serialNo}
                      onChange={(e) => onChange(i, "serialNo", e.target.value)}
                    />
                  </td>
                )}
                <td className="px-1 py-2">
                  <input
                    disabled={saving}
                    className={cn(inputCls, "w-24")}
                    placeholder={t("Ghi chú")}
                    value={id.notes}
                    onChange={(e) => onChange(i, "notes", e.target.value)}
                  />
                </td>
                {/* Attributes column — inline key-value editor */}
                <td className="px-1 py-2">
                  <div className="space-y-1 min-w-[200px]">
                    {id.attributes.map((attr, ai) => (
                      <div key={ai} className="flex items-center gap-1">
                        <input
                          disabled={saving}
                          className={cn(inputCls, "w-20 text-[11px]!")}
                          placeholder={t("Tên")}
                          value={attr.key}
                          onChange={(e) =>
                            onAttributeChange(i, ai, "key", e.target.value)
                          }
                        />
                        <span className="text-muted-foreground text-[10px] shrink-0">
                          :
                        </span>
                        <input
                          disabled={saving}
                          className={cn(inputCls, "w-20 text-[11px]!")}
                          placeholder={t("Giá trị")}
                          value={attr.value}
                          onChange={(e) =>
                            onAttributeChange(i, ai, "value", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => onAttributeRemove(i, ai)}
                          className="shrink-0 p-0.5 rounded text-red-400 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onAttributeAdd(i)}
                      className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-700 hover:text-emerald-900 mt-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      {t("Thêm")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function ProductionRunDrawer({
  open,
  loading = false,
  order,
  onClose,
  onRefresh,
}: ProductionRunDrawerProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

  const [saving, setSaving] = useState(false);
  const [localOrder, setLocalOrder] = useState<ErpProductionOrder | null>(
    order,
  );
  const [batchCompleteQty, setBatchCompleteQty] = useState("1");
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [vehicleBulkInput, setVehicleBulkInput] = useState("");

  // Identifier state — one row per unit when trackingPolicy !== 'NONE'
  const [identifiers, setIdentifiers] = useState<ProductionIdentifier[]>([
    emptyIdentifier(),
  ]);
  // Track qty used to initialise identifier rows so we can reset when qty changes
  const prevBatchQtyRef = useRef<string>("");

  const trackingPolicy: TrackingPolicy =
    (
      localOrder?.finishedGoodItem as
        | { trackingPolicy?: TrackingPolicy }
        | undefined
    )?.trackingPolicy ?? "NONE";
  const needsIdentifiers = ["SERIAL", "LOT", "VEHICLE"].includes(
    trackingPolicy,
  );

  useEffect(() => {
    if (!open && !order) return;
    setLocalOrder(order);
    setBatchCompleteQty("1");
    setShowBatchDialog(false);
    setVehicleBulkInput("");
    setIdentifiers(makeIdentifierRows(1));
    prevBatchQtyRef.current = "1";
  }, [order, open]);

  // Resize identifier rows when batchCompleteQty changes
  useEffect(() => {
    if (!needsIdentifiers) return;
    const qty = Math.max(1, Math.floor(Number(batchCompleteQty) || 1));
    if (String(qty) === prevBatchQtyRef.current) return;
    prevBatchQtyRef.current = String(qty);
    setIdentifiers((prev) => {
      if (prev.length === qty) return prev;
      if (prev.length < qty) {
        return [
          ...prev,
          ...Array.from({ length: qty - prev.length }, emptyIdentifier),
        ];
      }
      return prev.slice(0, qty);
    });
  }, [batchCompleteQty, needsIdentifiers]);

  const handleIdentifierChange = useCallback(
    (
      idx: number,
      field: keyof Omit<ProductionIdentifier, "attributes">,
      value: string,
    ) => {
      setIdentifiers((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
      );
    },
    [],
  );

  const handleAttributeAdd = useCallback((idx: number) => {
    setIdentifiers((prev) =>
      prev.map((row, i) =>
        i === idx
          ? { ...row, attributes: [...row.attributes, { key: "", value: "" }] }
          : row,
      ),
    );
  }, []);

  const handleAttributeChange = useCallback(
    (idx: number, attrIdx: number, field: "key" | "value", value: string) => {
      setIdentifiers((prev) =>
        prev.map((row, i) =>
          i === idx
            ? {
                ...row,
                attributes: row.attributes.map((a, ai) =>
                  ai === attrIdx ? { ...a, [field]: value } : a,
                ),
              }
            : row,
        ),
      );
    },
    [],
  );

  const handleAttributeRemove = useCallback((idx: number, attrIdx: number) => {
    setIdentifiers((prev) =>
      prev.map((row, i) =>
        i === idx
          ? {
              ...row,
              attributes: row.attributes.filter((_, ai) => ai !== attrIdx),
            }
          : row,
      ),
    );
  }, []);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const refresh = useCallback(async () => {
    if (!localOrder?.id) return;
    try {
      const updated = await productionCoreApi.get(localOrder.id);
      setLocalOrder(updated);
      await onRefresh();
    } catch {
      // ignore refresh errors silently
    }
  }, [localOrder?.id, onRefresh]);

  const resetVehicleEntry = useCallback(() => {
    setIdentifiers(makeIdentifierRows(1));
    prevBatchQtyRef.current = "1";
    setBatchCompleteQty("1");
    setVehicleBulkInput("");
  }, []);

  const applyVehicleBulkInput = useCallback(() => {
    const rows = parseVehicleBulkInput(vehicleBulkInput);
    const qty = Math.max(1, Math.floor(Number(batchCompleteQty) || 1));
    if (rows.length !== qty) {
      showToast({
        title: t(`Số dòng bulk phải bằng số lượng hoàn thành (${qty})`),
        variant: "destructive",
      });
      return;
    }
    const duplicateMessage = findVehicleDuplicate(rows);
    if (duplicateMessage) {
      showToast({ title: t(duplicateMessage), variant: "destructive" });
      return;
    }
    setIdentifiers(rows);
    showToast({
      title: t("Đã nạp danh sách VIN / số máy"),
      variant: "success",
    });
  }, [batchCompleteQty, showToast, t, vehicleBulkInput]);

  const handleStartAll = useCallback(async () => {
    if (!localOrder?.id) return;
    setSaving(true);
    try {
      await productionCoreApi.start(localOrder.id, {
        qtyToManufacture: Number(localOrder.qtyToProduce ?? 1),
      });
      showToast({
        title: t("Bắt đầu sản xuất thành công"),
        variant: "success",
      });
      await refresh();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, t("Không thể bắt đầu sản xuất")),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [localOrder, refresh, showToast, t]);

  const handleCompleteOne = useCallback(async () => {
    if (!localOrder?.id) return;
    if (
      needsIdentifiers &&
      !identifiersAllValid(identifiers.slice(0, 1), trackingPolicy)
    ) {
      showToast({
        title: t(
          "Vui lòng nhập đầy đủ thông tin định danh trước khi hoàn thành",
        ),
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const identifiersPayload = identifiers.slice(0, 1).map((id) => ({
        ...id,
        attributes: id.attributes.length
          ? Object.fromEntries(
              id.attributes
                .filter((a) => a.key.trim())
                .map((a) => [a.key, a.value]),
            )
          : undefined,
      }));
      await productionCoreApi.complete(localOrder.id, {
        qtyFinished: 1,
        ...(needsIdentifiers ? { identifiers: identifiersPayload } : {}),
      });
      showToast({ title: t("Đã hoàn thành 1 đơn vị"), variant: "success" });
      resetVehicleEntry();
      await refresh();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, t("Không thể hoàn thành")),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    localOrder,
    identifiers,
    needsIdentifiers,
    trackingPolicy,
    refresh,
    resetVehicleEntry,
    showToast,
    t,
  ]);

  const handleBatchComplete = useCallback(async () => {
    if (!localOrder?.id) return;
    const qty = Number(batchCompleteQty);
    if (!qty || qty <= 0) {
      showToast({ title: t("Số lượng không hợp lệ"), variant: "destructive" });
      return;
    }
    if (needsIdentifiers && !identifiersAllValid(identifiers, trackingPolicy)) {
      showToast({
        title: t("Vui lòng nhập đầy đủ thông tin định danh cho tất cả đơn vị"),
        variant: "destructive",
      });
      return;
    }
    if (trackingPolicy === "VEHICLE") {
      const duplicateMessage = findVehicleDuplicate(identifiers);
      if (duplicateMessage) {
        showToast({ title: t(duplicateMessage), variant: "destructive" });
        return;
      }
    }
    setSaving(true);
    try {
      const identifiersPayload = identifiers.map((id) => ({
        ...id,
        attributes: id.attributes.length
          ? Object.fromEntries(
              id.attributes
                .filter((a) => a.key.trim())
                .map((a) => [a.key, a.value]),
            )
          : undefined,
      }));
      await productionCoreApi.complete(localOrder.id, {
        qtyFinished: qty,
        unitCost: 0,
        ...(needsIdentifiers ? { identifiers: identifiersPayload } : {}),
      });
      showToast({
        title: t("Đã hoàn thành sản xuất hàng loạt"),
        variant: "success",
      });
      setShowBatchDialog(false);
      resetVehicleEntry();
      await refresh();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, t("Không thể hoàn thành")),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    localOrder,
    batchCompleteQty,
    identifiers,
    needsIdentifiers,
    trackingPolicy,
    refresh,
    showToast,
    t,
  ]);

  const isLoading = loading || (!localOrder && open);

  let statusBadge: React.ReactNode = null;
  let leftPanel: React.ReactNode = <div />;
  let rightPanel: React.ReactNode = <div />;
  let subtitle = t("Đang tải chi tiết lệnh...");

  if (localOrder) {
    const qtyToProduce = Number(localOrder.qtyToProduce ?? 0);
    const qtyProduced = Number(localOrder.qtyProduced ?? 0);
    const remaining = qtyToProduce - qtyProduced;
    const isConfirmed = localOrder.status === "CONFIRMED";
    const isInProgress = localOrder.status === "IN_PROGRESS";
    const isCompleted = localOrder.status === "COMPLETED";
    const useBatchMode = qtyToProduce > UNIT_ROW_THRESHOLD;
    const progressPct =
      qtyToProduce > 0 ? Math.min(1, qtyProduced / qtyToProduce) * 100 : 0;

    const unitRows =
      !useBatchMode && qtyToProduce > 0
        ? Array.from({ length: qtyToProduce }, (_, i) => {
            const idx = i + 1;
            const isDone = idx <= qtyProduced;
            const isCurrent =
              isInProgress && !isDone && idx === Math.floor(qtyProduced) + 1;
            return { idx, isDone, isCurrent };
          })
        : [];

    statusBadge = (
      <span
        className={cn(
          "rounded-md border px-2 py-0.5 text-[11px] font-semibold",
          isCompleted
            ? "border-emerald-200 bg-emerald-100 text-emerald-800"
            : isInProgress
              ? "border-blue-200 bg-blue-100 text-blue-800"
              : isConfirmed
                ? "border-amber-200 bg-amber-100 text-amber-800"
                : "border-border bg-muted text-muted-foreground",
        )}
      >
        {localOrder.status}
      </span>
    );

    leftPanel = (
      <div className="flex flex-col gap-4">
        {/* Progress bar */}
        <DrawerSection title={t("Tiến độ sản xuất")}>
          <div className="space-y-3 pb-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("Đã sản xuất")}</span>
              <span className="font-semibold">
                {fmtQty(qtyProduced)} / {fmtQty(qtyToProduce)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isCompleted ? "bg-emerald-500" : "bg-blue-500",
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </DrawerSection>

        {/* CONFIRMED → Start */}
        {isConfirmed && (
          <DrawerSection title={t("Hành động")}>
            <button
              type="button"
              onClick={handleStartAll}
              disabled={saving}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3",
                "text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50",
              )}
            >
              <span className="flex items-center gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                {saving ? t("Đang xử lý...") : t("Bắt đầu sản xuất tất cả")}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </DrawerSection>
        )}

        {/* IN_PROGRESS → unit-by-unit or batch */}
        {isInProgress && (
          <DrawerSection title={t("Hành động")}>
            {useBatchMode ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("Sản xuất hàng loạt")} — {t("Còn lại")}:{" "}
                  <span className="font-semibold text-foreground">
                    {fmtQty(remaining)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBatchCompleteQty(
                      remaining > 0 ? String(remaining) : "1",
                    );
                    setIdentifiers(
                      makeIdentifierRows(remaining > 0 ? remaining : 1),
                    );
                    setShowBatchDialog(true);
                  }}
                  disabled={saving || remaining <= 0}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3",
                    "text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("Hoàn thành tất cả / nhiều xe")}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                {trackingPolicy === "VEHICLE" && remaining > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBatchCompleteQty(String(Math.floor(remaining)));
                      setShowBatchDialog(true);
                    }}
                    disabled={saving}
                    className="flex items-center justify-between rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("Hoàn thành tất cả")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-700" />
                  </button>
                )}

                {showBatchDialog && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-emerald-900">
                      {t("Nhập số lượng thành phẩm hoàn thành")}
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        {t("Số lượng hoàn thành")}
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={batchCompleteQty}
                        onChange={(e) => setBatchCompleteQty(e.target.value)}
                        className={cn(inputCls, "w-full")}
                        placeholder="Số lượng"
                        disabled={saving}
                      />
                    </div>
                    {trackingPolicy === "VEHICLE" && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          {t(
                            "Bulk Số VIN, Số máy — mỗi dòng 1 xe; hỗ trợ dấu phẩy hoặc tab",
                          )}
                        </label>
                        <textarea
                          value={vehicleBulkInput}
                          onChange={(e) => setVehicleBulkInput(e.target.value)}
                          disabled={saving}
                          rows={6}
                          className={cn(inputCls, "w-full font-mono text-xs")}
                          placeholder={"VIN001,ENG001\nVIN002,ENG002"}
                        />
                        <button
                          type="button"
                          onClick={applyVehicleBulkInput}
                          disabled={saving}
                          className="rounded-md border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {t("Áp dụng bulk VIN / số máy")}
                        </button>
                      </div>
                    )}

                    {needsIdentifiers && (
                      <IdentifierTable
                        policy={trackingPolicy}
                        identifiers={identifiers}
                        onChange={handleIdentifierChange}
                        onAttributeAdd={handleAttributeAdd}
                        onAttributeChange={handleAttributeChange}
                        onAttributeRemove={handleAttributeRemove}
                        saving={saving}
                        t={t}
                      />
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleBatchComplete}
                        disabled={
                          saving ||
                          !Number(batchCompleteQty) ||
                          Number(batchCompleteQty) <= 0 ||
                          Number(batchCompleteQty) > remaining ||
                          (needsIdentifiers &&
                            !identifiersAllValid(identifiers, trackingPolicy))
                        }
                        className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {saving ? t("Đang xử lý...") : t("Xác nhận")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBatchDialog(false)}
                        disabled={saving}
                        className="flex-1 rounded-md border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {t("Huỷ")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unit-by-unit mode */
              <div className="space-y-2">
                {trackingPolicy === "VEHICLE" && remaining > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBatchCompleteQty(String(Math.floor(remaining)));
                      setIdentifiers(makeIdentifierRows(Math.floor(remaining)));
                      setShowBatchDialog(true);
                    }}
                    disabled={saving}
                    className="flex w-full items-center justify-between rounded-lg border border-blue-300 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                      <CheckCircle2 className="h-4 w-4" />
                      {t("Hoàn thành tất cả")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-700" />
                  </button>
                )}

                {showBatchDialog && (
                  <div className="rounded-lg border border-blue-300 bg-blue-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-blue-900">
                      {t("Nhập số lượng thành phẩm hoàn thành")}
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        {t("Số lượng hoàn thành")}
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={batchCompleteQty}
                        onChange={(e) => setBatchCompleteQty(e.target.value)}
                        className={cn(inputCls, "w-full")}
                        placeholder="Số lượng"
                        disabled={saving}
                      />
                    </div>
                    {trackingPolicy === "VEHICLE" && (
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          {t(
                            "Bulk Số VIN, Số máy — mỗi dòng 1 xe; hỗ trợ dấu phẩy hoặc tab",
                          )}
                        </label>
                        <textarea
                          value={vehicleBulkInput}
                          onChange={(e) => setVehicleBulkInput(e.target.value)}
                          disabled={saving}
                          rows={6}
                          className={cn(inputCls, "w-full font-mono text-xs")}
                          placeholder={"VIN001,ENG001\nVIN002,ENG002"}
                        />
                        <button
                          type="button"
                          onClick={applyVehicleBulkInput}
                          disabled={saving}
                          className="rounded-md border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                        >
                          {t("Áp dụng bulk VIN / số máy")}
                        </button>
                      </div>
                    )}

                    {needsIdentifiers && (
                      <IdentifierTable
                        policy={trackingPolicy}
                        identifiers={identifiers}
                        onChange={handleIdentifierChange}
                        onAttributeAdd={handleAttributeAdd}
                        onAttributeChange={handleAttributeChange}
                        onAttributeRemove={handleAttributeRemove}
                        saving={saving}
                        t={t}
                      />
                    )}

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleBatchComplete}
                        disabled={
                          saving ||
                          !Number(batchCompleteQty) ||
                          Number(batchCompleteQty) <= 0 ||
                          Number(batchCompleteQty) > remaining ||
                          (needsIdentifiers &&
                            !identifiersAllValid(identifiers, trackingPolicy))
                        }
                        className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? t("Đang xử lý...") : t("Xác nhận")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBatchDialog(false)}
                        disabled={saving}
                        className="flex-1 rounded-md border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                      >
                        {t("Huỷ")}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {t("Hoàn thành từng đơn vị")} — {t("còn lại")}{" "}
                  <span className="font-semibold text-foreground">
                    {fmtQty(remaining)}
                  </span>
                </p>

                {/* Identifier input for current unit (unit-by-unit mode) */}
                {needsIdentifiers && (
                  <IdentifierTable
                    policy={trackingPolicy}
                    identifiers={identifiers.slice(0, 1)}
                    onChange={handleIdentifierChange}
                    onAttributeAdd={handleAttributeAdd}
                    onAttributeChange={handleAttributeChange}
                    onAttributeRemove={handleAttributeRemove}
                    saving={saving}
                    t={t}
                  />
                )}

                <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                  {unitRows.map(({ idx, isDone, isCurrent }) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between px-4 py-2.5 text-sm",
                        isDone ? "bg-emerald-50" : "bg-background",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : isCurrent ? (
                          <span className="h-4 w-4 rounded-full border-2 border-blue-400 bg-blue-100" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border-2 border-border bg-muted" />
                        )}
                        <span
                          className={cn(
                            "font-medium",
                            isDone
                              ? "text-emerald-700"
                              : "text-muted-foreground",
                          )}
                        >
                          {t("Đơn vị")} #{idx}
                        </span>
                      </div>
                      {isDone && (
                        <span className="text-[11px] font-semibold text-emerald-600">
                          {t("Đã sản xuất")}
                        </span>
                      )}
                      {isCurrent && !saving && (
                        <button
                          type="button"
                          onClick={handleCompleteOne}
                          disabled={
                            needsIdentifiers &&
                            !identifiersAllValid(
                              identifiers.slice(0, 1),
                              trackingPolicy,
                            )
                          }
                          className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {t("Hoàn thành 1 đơn vị")}
                        </button>
                      )}
                      {isCurrent && saving && (
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DrawerSection>
        )}

        {/* COMPLETED */}
        {isCompleted && (
          <DrawerSection title={t("Kết quả sản xuất")}>
            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 mb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-800">
                {t("Lệnh sản xuất đã hoàn thành")} — {fmtQty(qtyProduced)}{" "}
                {t("đơn vị")}
              </span>
            </div>

            {/* Vehicle list */}
            {(localOrder.producedVehicles ?? []).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {t("Danh sách xe đã sản xuất")}
                </p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold">#</th>
                        <th className="px-2 py-1 text-left font-semibold">
                          Số VIN
                        </th>
                        <th className="px-2 py-1 text-left font-semibold">
                          {t("Số máy")}
                        </th>
                        <th className="px-2 py-1 text-left font-semibold">
                          {t("Ghi chú")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {(localOrder.producedVehicles ?? []).map((v, i) => (
                        <tr key={v.id}>
                          <td className="px-2 py-1 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-2 py-1 font-mono font-semibold">
                            {v.vin || "—"}
                          </td>
                          <td className="px-2 py-1">{v.engineNo || "—"}</td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {v.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Serial / Lot list */}
            {(localOrder.producedSerials ?? []).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {trackingPolicy === "LOT"
                    ? t("Danh sách lô đã sản xuất")
                    : t("Danh sách serial đã sản xuất")}
                </p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold">#</th>
                        <th className="px-2 py-1 text-left font-semibold">
                          {trackingPolicy === "LOT" ? t("Số lô") : t("Serial")}
                        </th>
                        <th className="px-2 py-1 text-left font-semibold">
                          {t("Ghi chú")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {(localOrder.producedSerials ?? []).map((s, i) => (
                        <tr key={s.id}>
                          <td className="px-2 py-1 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="px-2 py-1 font-mono font-semibold">
                            {trackingPolicy === "LOT"
                              ? s.lotNo || "—"
                              : s.serialNo || "—"}
                          </td>
                          <td className="px-2 py-1 text-muted-foreground">
                            {s.notes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* No identifiers recorded */}
            {(localOrder.producedVehicles ?? []).length === 0 &&
              (localOrder.producedSerials ?? []).length === 0 &&
              trackingPolicy !== "NONE" && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t("Chưa có định danh sản phẩm được ghi nhận.")}
                </p>
              )}
          </DrawerSection>
        )}
      </div>
    );

    // ── Right panel — general info ──────────────────────────────────────────
    rightPanel = (
      <>
        <DrawerRow label={t("Mã lệnh")} value={localOrder.referenceNo || "—"} />
        <DrawerRow
          label={t("Thành phẩm")}
          value={localOrder.finishedGoodItemName || "—"}
        />
        {needsIdentifiers && (
          <DrawerRow
            label={t("Truy xuất")}
            value={
              <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                {trackingPolicy}
              </span>
            }
          />
        )}
        <DrawerRow
          label={t("Kho sản xuất")}
          value={localOrder.warehouseCode || "—"}
        />
        <DrawerRow
          label={t("Ngày bắt đầu (kế hoạch)")}
          value={localOrder.plannedStartDate?.slice(0, 10) || "—"}
        />
        <DrawerRow
          label={t("Ngày hoàn thành (kế hoạch)")}
          value={localOrder.plannedEndDate?.slice(0, 10) || "—"}
        />
        <DrawerRow
          label={t("Tiến độ")}
          value={
            <span className="font-bold text-emerald-700">
              {fmtQty(qtyProduced)}{" "}
              <span className="font-normal text-muted-foreground">
                / {fmtQty(qtyToProduce)}
              </span>
            </span>
          }
        />
      </>
    );

    subtitle = `${localOrder.referenceNo || localOrder.id.slice(0, 8)} · ${localOrder.finishedGoodItemName || "—"}`;
  }

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      title={t("Tiến trình sản xuất")}
      titleExtra={statusBadge}
      subtitle={subtitle}
      actions={[{ label: t("Đóng"), onClick: onClose, variant: "outline" }]}
      loading={isLoading}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      rightPanelTitle={t("Thông tin chung")}
      rightPanelDefaultCollapsed={false}
    />
  );
}
