import { useState, useCallback, useEffect, useRef } from "react";
import {
  PlayCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ListChecks,
  Settings2,
} from "lucide-react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import {
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DatePicker } from "@/shared/components/DatePicker";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";

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
      const attributes = parts
        .slice(2)
        .map((attrStr) => {
          let key = "",
            value = "";
          if (attrStr.includes("=")) {
            const split = attrStr.split("=");
            key = split[0];
            value = split.slice(1).join("=");
          } else if (attrStr.includes(":")) {
            const split = attrStr.split(":");
            key = split[0];
            value = split.slice(1).join(":");
          }
          return { key: key.trim(), value: value.trim() };
        })
        .filter((a) => a.key !== "");

      let notes = "";
      let hasGhiChu = false;
      let hasNotes = false;
      const finalAttributes: { key: string; value: string }[] = [];

      for (const attr of attributes) {
        const lowerKey = attr.key.toLowerCase();
        if (lowerKey === "ghi chú") {
          hasGhiChu = true;
          notes = attr.value;
        } else if (lowerKey === "notes") {
          hasNotes = true;
          notes = attr.value;
        } else {
          finalAttributes.push(attr);
        }
      }

      if (hasGhiChu && hasNotes) {
        throw new Error(
          `Dòng "${line}" chứa cả "Ghi chú" và "Notes". Vui lòng chỉ dùng 1 trong 2.`,
        );
      }

      return {
        vinNo: (parts[0] ?? "").trim(),
        engineNo: (parts[1] ?? "").trim(),
        serialNo: "",
        lotNo: "",
        notes,
        attributes: finalAttributes,
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

function AttributeInput({
  value,
  onChange,
}: {
  value: Array<{ key: string; value: string }>;
  onChange: (val: Array<{ key: string; value: string }>) => void;
}) {
  const [str, setStr] = useState(() =>
    value.map((a) => `${a.key}=${a.value}`).join(", "),
  );

  useEffect(() => {
    setStr(value.map((a) => `${a.key}=${a.value}`).join(", "));
  }, [value]);

  return (
    <input
      className={cn(inputCls, "w-full text-xs h-7")}
      placeholder="VD: Màu=Đen, Size=L"
      value={str}
      onChange={(e) => setStr(e.target.value)}
      onBlur={() => {
        const parsed = str
          .split(",")
          .map((part) => {
            const [k, v] = part.split("=").map((s) => s.trim());
            if (k && v) return { key: k, value: v };
            return null;
          })
          .filter(Boolean) as { key: string; value: string }[];
        onChange(parsed);
      }}
    />
  );
}

// ── Shared Table cho danh sách định danh ───────────────────────────────────

function IdentifierTable({
  policy,
  identifiers,
  onChange,
}: {
  policy: TrackingPolicy;
  identifiers: ProductionIdentifier[];
  onChange: (index: number, val: ProductionIdentifier) => void;
}) {
  if (policy === "NONE") return null;
  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-muted-foreground" />
        {policy === "VEHICLE" && "Thông tin định danh xe (VIN / Số máy)"}
        {policy === "SERIAL" && "Số serial từng đơn vị"}
        {policy === "LOT" && "Số lô từng đơn vị"}
        {policy === "CUSTOM" && "Định danh tùy chỉnh"}
      </h4>
      <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="min-w-full text-xs">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-2 py-1 text-left font-semibold">#</th>
              {policy === "VEHICLE" && (
                <>
                  <th className="px-2 py-1 text-left font-semibold">
                    Số VIN <span className="text-red-500">*</span>
                  </th>
                  <th className="px-2 py-1 text-left font-semibold">
                    Số máy <span className="text-red-500">*</span>
                  </th>
                </>
              )}
              {policy === "SERIAL" && (
                <th className="px-2 py-1 text-left font-semibold">
                  Số Serial <span className="text-red-500">*</span>
                </th>
              )}
              {policy === "LOT" && (
                <th className="px-2 py-1 text-left font-semibold">
                  Số Lô <span className="text-red-500">*</span>
                </th>
              )}
              <th className="px-2 py-1 text-left font-semibold">Ghi chú</th>
              <th className="px-2 py-1 text-left font-semibold">
                Thuộc tính mở rộng
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {identifiers.map((item, idx) => (
              <tr key={idx} className="hover:bg-muted/50">
                <td className="px-2 py-1 text-muted-foreground">{idx + 1}</td>
                {policy === "VEHICLE" && (
                  <>
                    <td className="px-1 py-1 w-[80px]">
                      <input
                        value={item.vinNo}
                        onChange={(e) =>
                          onChange(idx, { ...item, vinNo: e.target.value })
                        }
                        className={cn(
                          inputCls,
                          "w-full min-w-[60px] text-xs h-7",
                        )}
                        placeholder="Số VIN"
                      />
                    </td>
                    <td className="px-1 py-1 w-[80px]">
                      <input
                        value={item.engineNo}
                        onChange={(e) =>
                          onChange(idx, { ...item, engineNo: e.target.value })
                        }
                        className={cn(
                          inputCls,
                          "w-full min-w-[60px] text-xs h-7",
                        )}
                        placeholder="Số máy"
                      />
                    </td>
                  </>
                )}
                {policy === "SERIAL" && (
                  <td className="px-1 py-1 w-[120px]">
                    <input
                      value={item.serialNo}
                      onChange={(e) =>
                        onChange(idx, { ...item, serialNo: e.target.value })
                      }
                      className={cn(inputCls, "w-full text-xs h-7")}
                      placeholder="Serial"
                    />
                  </td>
                )}
                <td className="px-1 py-1">
                  <input
                    value={item.notes}
                    onChange={(e) =>
                      onChange(idx, { ...item, notes: e.target.value })
                    }
                    className={cn(inputCls, "w-full text-xs h-7")}
                    placeholder="Ghi chú"
                  />
                </td>
                <td className="px-1 py-1">
                  <AttributeInput
                    value={item.attributes}
                    onChange={(newAttrs) =>
                      onChange(idx, { ...item, attributes: newAttrs })
                    }
                  />
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

  const [mode, setMode] = useState<DrawerMode>("view");
  const [saving, setSaving] = useState(false);
  const [localOrder, setLocalOrder] = useState<ErpProductionOrder | null>(
    order,
  );

  // Edit mode states
  const [editNotes, setEditNotes] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

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
    (index: number, val: ProductionIdentifier) => {
      setIdentifiers((prev) => prev.map((row, i) => (i === index ? val : row)));
    },
    [],
  );

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

  const handleToggleEdit = useCallback(() => {
    if (mode === "view") {
      setEditNotes(localOrder?.notes || "");
      setEditStartDate(localOrder?.plannedStartDate?.slice(0, 10) || "");
      setEditEndDate(localOrder?.plannedEndDate?.slice(0, 10) || "");
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [mode, localOrder]);

  const handleSaveOrder = useCallback(async () => {
    if (!localOrder?.id) return;
    setSaving(true);
    try {
      await productionCoreApi.update(localOrder.id, {
        finishedGoodItemId: localOrder.finishedGoodItemId!,
        qtyToProduce: localOrder.qtyToProduce!,
        notes: editNotes,
        plannedStartDate: editStartDate || undefined,
        plannedEndDate: editEndDate || undefined,
      });
      showToast({ title: t("Lưu thành công"), variant: "success" });
      setMode("view");
      await refresh();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, t("Không thể lưu")),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [
    localOrder,
    editNotes,
    editStartDate,
    editEndDate,
    refresh,
    showToast,
    t,
  ]);

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
      <div className="flex items-center gap-3 ml-2">
        {isCompleted ? (
          <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
            {localOrder.status}
          </span>
        ) : isInProgress ? (
          <div
            className="relative overflow-hidden rounded-md border border-blue-200 bg-blue-50 text-[11px] font-semibold text-blue-800"
            title={`${t("Tiến độ")}: ${fmtQty(qtyProduced)} / ${fmtQty(qtyToProduce)}`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-blue-200/60 transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
            <div className="relative px-2 py-0.5 whitespace-nowrap z-10 flex items-center gap-1.5">
              <span>{localOrder.status}</span>
              <span className="opacity-50">|</span>
              <span>
                {fmtQty(qtyProduced)} / {fmtQty(qtyToProduce)}
              </span>
            </div>
          </div>
        ) : (
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-semibold",
              isConfirmed
                ? "border-amber-200 bg-amber-100 text-amber-800"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {localOrder.status}
          </span>
        )}
      </div>
    );

    leftPanel = (
      <div className="flex flex-col gap-4">
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
                    <div className="flex items-center justify-between gap-3 bg-white p-2 rounded border border-emerald-100">
                      <span className="text-sm font-semibold text-emerald-900">
                        {t("Số lượng hoàn thành")}:
                      </span>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={batchCompleteQty}
                        onChange={(e) => setBatchCompleteQty(e.target.value)}
                        className={cn(inputCls, "w-24 text-right font-medium")}
                        placeholder="Số lượng"
                        disabled={saving}
                      />
                    </div>
                    {trackingPolicy === "VEHICLE" && (
                      <div className="space-y-2 pt-3 border-t border-border mt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700">
                            <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                            {t("Nhập dữ liệu hàng loạt")}
                          </label>
                        </div>
                        <div className="text-[11px] text-muted-foreground bg-slate-50 p-2 rounded-md border border-slate-100">
                          <p className="font-medium mb-1">
                            {t("Quy tắc nhập (mỗi dòng 1 xe):")}
                          </p>
                          <p className="font-mono text-[10px] text-slate-600">
                            Số VIN, Số máy, Thuộc tính 1=..., Thuộc tính 2=...,
                            Ghi chú=...
                          </p>
                        </div>
                        <textarea
                          value={vehicleBulkInput}
                          onChange={(e) => setVehicleBulkInput(e.target.value)}
                          disabled={saving}
                          rows={5}
                          className={cn(
                            inputCls,
                            "w-full font-mono text-xs bg-slate-50/50 focus:bg-white resize-none border-slate-200",
                          )}
                          placeholder={
                            "VIN001,ENG001,Màu=Đen,Nội thất=Nỉ,Ghi chú=Giao khách VIP ngay\nVIN002,ENG002,Option=Đủ,Ghi chú=Chờ đăng kiểm"
                          }
                        />
                        <button
                          type="button"
                          onClick={applyVehicleBulkInput}
                          disabled={saving || !vehicleBulkInput.trim()}
                          className="w-full flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          {t("Trích xuất dữ liệu vào danh sách")}
                        </button>
                      </div>
                    )}

                    {needsIdentifiers && (
                      <IdentifierTable
                        policy={trackingPolicy}
                        identifiers={identifiers}
                        onChange={handleIdentifierChange}
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
                    <div className="flex items-center justify-between gap-3 bg-white p-2 rounded border border-blue-100">
                      <span className="text-sm font-semibold text-blue-900">
                        {t("Số lượng hoàn thành")}:
                      </span>
                      <input
                        type="number"
                        min="0.001"
                        step="any"
                        value={batchCompleteQty}
                        onChange={(e) => setBatchCompleteQty(e.target.value)}
                        className={cn(inputCls, "w-24 text-right font-medium")}
                        placeholder="Số lượng"
                        disabled={saving}
                      />
                    </div>
                    {trackingPolicy === "VEHICLE" && (
                      <div className="space-y-2 pt-3 border-t border-border mt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold flex items-center gap-1.5 text-slate-700">
                            <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                            {t("Nhập dữ liệu hàng loạt")}
                          </label>
                        </div>
                        <div className="text-[11px] text-muted-foreground bg-slate-50 p-2 rounded-md border border-slate-100">
                          <p className="font-medium mb-1">
                            {t("Quy tắc nhập (mỗi dòng 1 xe):")}
                          </p>
                          <p className="font-mono text-[10px] text-slate-600">
                            Số VIN, Số máy, Thuộc tính 1=..., Thuộc tính 2=...,
                            Ghi chú=...
                          </p>
                        </div>
                        <textarea
                          value={vehicleBulkInput}
                          onChange={(e) => setVehicleBulkInput(e.target.value)}
                          disabled={saving}
                          rows={5}
                          className={cn(
                            inputCls,
                            "w-full font-mono text-xs bg-slate-50/50 focus:bg-white resize-none border-slate-200",
                          )}
                          placeholder={
                            "VIN001,ENG001,Màu=Đen,Nội thất=Nỉ,Ghi chú=Giao khách VIP ngay\nVIN002,ENG002,Option=Đủ,Ghi chú=Chờ đăng kiểm"
                          }
                        />
                        <button
                          type="button"
                          onClick={applyVehicleBulkInput}
                          disabled={saving || !vehicleBulkInput.trim()}
                          className="w-full flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                        >
                          <ListChecks className="h-3.5 w-3.5" />
                          {t("Trích xuất dữ liệu vào danh sách")}
                        </button>
                      </div>
                    )}

                    {needsIdentifiers && (
                      <IdentifierTable
                        policy={trackingPolicy}
                        identifiers={identifiers}
                        onChange={handleIdentifierChange}
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

                {/* Identifier input for current unit (unit-by-unit mode) */}
                {needsIdentifiers && (
                  <IdentifierTable
                    policy={trackingPolicy}
                    identifiers={identifiers.slice(0, 1)}
                    onChange={handleIdentifierChange}
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

            {/* Unified result list */}
            {(
              (trackingPolicy === "VEHICLE"
                ? localOrder.producedVehicles
                : localOrder.producedSerials) ?? []
            ).length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  {trackingPolicy === "VEHICLE"
                    ? t("Danh sách xe đã sản xuất")
                    : trackingPolicy === "LOT"
                      ? t("Danh sách lô đã sản xuất")
                      : t("Danh sách định danh đã sản xuất")}
                </p>
                <div className="overflow-x-auto rounded-md border border-border">
                  <table className="min-w-full text-xs">
                    <thead className="bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-2 py-1 text-left font-semibold w-10">
                          #
                        </th>
                        {trackingPolicy === "VEHICLE" && (
                          <>
                            <th className="px-2 py-1 text-left font-semibold">
                              Số VIN
                            </th>
                            <th className="px-2 py-1 text-left font-semibold">
                              {t("Số máy")}
                            </th>
                          </>
                        )}
                        {trackingPolicy === "SERIAL" && (
                          <th className="px-2 py-1 text-left font-semibold">
                            {t("Serial")}
                          </th>
                        )}
                        {trackingPolicy === "LOT" && (
                          <th className="px-2 py-1 text-left font-semibold">
                            {t("Số lô")}
                          </th>
                        )}
                        <th className="px-2 py-1 text-left font-semibold">
                          {t("Thuộc tính mở rộng")}
                        </th>
                        <th className="px-2 py-1 text-left font-semibold">
                          {t("Ghi chú")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-white">
                      {(
                        (trackingPolicy === "VEHICLE"
                          ? localOrder.producedVehicles
                          : localOrder.producedSerials) ?? []
                      ).map((item: any, i: number) => {
                        let entries: Array<{ key: string; value: string }> = [];
                        if (item.attributes) {
                          if (Array.isArray(item.attributes)) {
                            entries = item.attributes;
                          } else if (typeof item.attributes === "object") {
                            entries = Object.entries(item.attributes).map(
                              ([k, v]) => ({
                                key: k,
                                value: String(v),
                              }),
                            );
                          }
                        }

                        return (
                          <tr key={item.id} className="hover:bg-muted/30">
                            <td className="px-2 py-2 text-muted-foreground">
                              {i + 1}
                            </td>
                            {trackingPolicy === "VEHICLE" && (
                              <>
                                <td className="px-2 py-2 font-medium text-blue-600">
                                  {item.vinNo || "—"}
                                </td>
                                <td className="px-2 py-2 font-medium text-blue-600">
                                  {item.engineNo || "—"}
                                </td>
                              </>
                            )}
                            {trackingPolicy === "SERIAL" && (
                              <td className="px-2 py-2 font-medium text-blue-600">
                                {item.serialNo || "—"}
                              </td>
                            )}
                            {trackingPolicy === "LOT" && (
                              <td className="px-2 py-2 font-medium text-blue-600">
                                {item.lotNo || "—"}
                              </td>
                            )}
                            <td className="px-2 py-2 text-muted-foreground">
                              {entries.length > 0 ? (
                                <ul className="flex flex-col gap-1">
                                  {entries.map((entry, idx) => (
                                    <li
                                      key={idx}
                                      className="flex gap-1.5 items-start"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                      <span>
                                        <span className="font-medium text-slate-700">
                                          {entry.key}:
                                        </span>{" "}
                                        {entry.value}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-2 py-2 text-muted-foreground">
                              {item.notes || "—"}
                            </td>
                          </tr>
                        );
                      })}
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

        {mode === "view" ? (
          <>
            <DrawerRow
              label={t("Ngày bắt đầu (kế hoạch)")}
              value={localOrder.plannedStartDate?.slice(0, 10) || "—"}
            />
            <DrawerRow
              label={t("Ngày hoàn thành (kế hoạch)")}
              value={localOrder.plannedEndDate?.slice(0, 10) || "—"}
            />
            <DrawerRow label={t("Ghi chú")} value={localOrder.notes || "—"} />
          </>
        ) : (
          <div className="space-y-4 px-1 pb-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("Ngày bắt đầu (kế hoạch)")}
              </label>
              <DatePicker
                value={editStartDate}
                onChange={setEditStartDate}
                disabled={saving || isInProgress}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("Ngày hoàn thành (kế hoạch)")}
              </label>
              <DatePicker
                value={editEndDate}
                onChange={setEditEndDate}
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {t("Ghi chú")}
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className={cn(inputCls, "w-full resize-none")}
                rows={3}
                placeholder={t("Nhập ghi chú chung...")}
                disabled={saving}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={mode === "view" ? handleToggleEdit : undefined}
      confirmOnClose={mode === "edit"}
      title={t("Tiến trình sản xuất")}
      titleExtra={statusBadge}
      actions={
        mode === "view"
          ? [{ label: t("Đóng"), onClick: onClose, variant: "outline" }]
          : [
              {
                label: t("Hủy"),
                onClick: handleToggleEdit,
                variant: "outline",
                disabled: saving,
              },
              { label: t("Lưu"), onClick: handleSaveOrder, loading: saving },
            ]
      }
      loading={isLoading}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      rightPanelTitle={t("Thông tin chung")}
      rightPanelDefaultCollapsed={false}
    />
  );
}
