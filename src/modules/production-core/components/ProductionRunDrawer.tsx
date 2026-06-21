import { useState, useCallback, useEffect } from "react";
import { PlayCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import {
  DrawerModal,
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
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

export interface ProductionRunDrawerProps {
  open: boolean;
  order: ErpProductionOrder | null;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function ProductionRunDrawer({
  open,
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
  const [batchUnitCost, setBatchUnitCost] = useState("0");
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  useEffect(() => {
    setLocalOrder(order);
    setBatchCompleteQty("1");
    setBatchUnitCost("0");
    setShowBatchDialog(false);
  }, [order]);

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
    setSaving(true);
    try {
      await productionCoreApi.complete(localOrder.id, { qtyFinished: 1 });
      showToast({ title: t("Đã hoàn thành 1 đơn vị"), variant: "success" });
      await refresh();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, t("Không thể hoàn thành")),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [localOrder, refresh, showToast, t]);

  const handleBatchComplete = useCallback(async () => {
    if (!localOrder?.id) return;
    const qty = Number(batchCompleteQty);
    if (!qty || qty <= 0) {
      showToast({ title: t("Số lượng không hợp lệ"), variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await productionCoreApi.complete(localOrder.id, {
        qtyFinished: qty,
        unitCost: Number(batchUnitCost) || 0,
      });
      showToast({
        title: t("Đã hoàn thành sản xuất hàng loạt"),
        variant: "success",
      });
      setShowBatchDialog(false);
      await refresh();
    } catch (e) {
      showToast({
        title: getErrorMessage(e, t("Không thể hoàn thành")),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [localOrder, batchCompleteQty, batchUnitCost, refresh, showToast, t]);

  if (!localOrder) return null;

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

  // ── Status badge ────────────────────────────────────────────────────────
  const statusBadge = (
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

  // ── Left panel — actions ────────────────────────────────────────────────
  const leftPanel = (
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
                  setBatchCompleteQty(remaining > 0 ? String(remaining) : "1");
                  setBatchUnitCost("0");
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
                  {t("Hoàn thành nhiều đơn vị")}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

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
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">
                      {t("Đơn giá nhập kho")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={batchUnitCost}
                      onChange={(e) => setBatchUnitCost(e.target.value)}
                      className={cn(inputCls, "w-full")}
                      placeholder="0 nếu bỏ qua"
                      disabled={saving}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleBatchComplete}
                      disabled={
                        saving ||
                        !Number(batchCompleteQty) ||
                        Number(batchCompleteQty) <= 0 ||
                        Number(batchCompleteQty) > remaining
                      }
                      className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {saving ? t("Đang xử lý...") : t("Xác nhận")}
                    </button>
                    <button
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
              <p className="text-xs text-muted-foreground">
                {t("Hoàn thành từng đơn vị")} — {t("còn lại")}{" "}
                <span className="font-semibold text-foreground">
                  {fmtQty(remaining)}
                </span>
              </p>
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
                          isDone ? "text-emerald-700" : "text-muted-foreground",
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
        <DrawerSection title={t("Trạng thái")}>
          <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">
              {t("Lệnh sản xuất đã hoàn thành")}
            </span>
          </div>
        </DrawerSection>
      )}
    </div>
  );

  // ── Right panel — general info ──────────────────────────────────────────
  const rightPanel = (
    <>
      <DrawerRow label={t("Mã lệnh")} value={localOrder.referenceNo || "—"} />
      <DrawerRow
        label={t("Thành phẩm")}
        value={localOrder.finishedGoodItemName || "—"}
      />
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

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Tiến trình sản xuất")}
      titleExtra={statusBadge}
      subtitle={`${localOrder.referenceNo || localOrder.id.slice(0, 8)} · ${localOrder.finishedGoodItemName || "—"}`}
      actions={[{ label: t("Đóng"), onClick: onClose, variant: "outline" }]}
      panelClassName="w-full md:w-[720px] lg:w-[820px]"
    >
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full h-full">
        {/* Main actions */}
        <div className="flex-1 min-w-0 w-full">{leftPanel}</div>

        {/* Info sidebar */}
        <div className="shrink-0 w-full xl:w-[260px] xl:sticky xl:top-0">
          <DrawerSection title={t("Thông tin chung")}>
            {rightPanel}
          </DrawerSection>
        </div>
      </div>
    </DrawerModal>
  );
}
