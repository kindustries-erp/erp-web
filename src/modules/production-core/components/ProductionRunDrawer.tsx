import { useState, useCallback, useEffect } from "react";
import { X, PlayCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import {
  productionCoreApi,
  type ErpProductionOrder,
} from "@/modules/production-core/api/productionCoreApi";
import { inputCls } from "@/shared/components/DrawerModal";

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

export interface ProductionRunDrawerProps {
  open: boolean;
  order: ErpProductionOrder | null;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

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

  // Batch mode state (qtyToProduce > UNIT_ROW_THRESHOLD)
  const [batchCompleteQty, setBatchCompleteQty] = useState("1");
  const [batchUnitCost, setBatchUnitCost] = useState("0");
  const [showBatchCompleteDialog, setShowBatchCompleteDialog] = useState(false);

  // Sync local order when parent passes new order
  useEffect(() => {
    setLocalOrder(order);
    setBatchCompleteQty("1");
    setBatchUnitCost("0");
    setShowBatchCompleteDialog(false);
  }, [order]);
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const refresh = useCallback(async () => {
    if (!localOrder?.id) return;
    try {
      const updated = await productionCoreApi.get(localOrder.id);
      setLocalOrder(updated);
      await onRefresh();
    } catch {
      // ignore refresh errors
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
      showToast({
        title: t("Đã hoàn thành 1 đơn vị"),
        variant: "success",
      });
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
      setShowBatchCompleteDialog(false);
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

  if (!open || !localOrder) return null;

  const qtyToProduce = Number(localOrder.qtyToProduce ?? 0);
  const qtyProduced = Number(localOrder.qtyProduced ?? 0);
  const remaining = qtyToProduce - qtyProduced;
  const isConfirmed = localOrder.status === "CONFIRMED";
  const isInProgress = localOrder.status === "IN_PROGRESS";
  const isCompleted = localOrder.status === "COMPLETED";
  const useBatchMode = qtyToProduce > UNIT_ROW_THRESHOLD;

  const progressPct =
    qtyToProduce > 0 ? Math.min(1, qtyProduced / qtyToProduce) * 100 : 0;

  // Build unit rows for unit-by-unit mode
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

  return (
    <div
      className={cn("fixed inset-0 z-50 flex", "bg-black/40 backdrop-blur-sm")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "ml-auto flex h-full w-full max-w-2xl flex-col bg-background shadow-2xl",
          "border-l border-border",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">
              {t("Tiến trình sản xuất")}
            </span>
            <span className="text-xs text-muted-foreground">
              {localOrder.referenceNo || localOrder.id.slice(0, 8)} ·{" "}
              {localOrder.finishedGoodItemName || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 hover:bg-muted"
              aria-label={t("Đóng")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel — Production list / action */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  {t("Đã sản xuất")}
                </span>
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

            {/* CONFIRMED: Start all */}
            {isConfirmed && (
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
            )}

            {/* IN_PROGRESS: unit-by-unit or batch */}
            {isInProgress && (
              <>
                {useBatchMode ? (
                  /* Batch mode */
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
                        setBatchUnitCost("0");
                        setShowBatchCompleteDialog(true);
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
                    {showBatchCompleteDialog && (
                      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 space-y-3">
                        <p className="text-sm font-semibold text-emerald-900">
                          {t("Nhập số lượng thành phẩm hoàn thành")}
                        </p>
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
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={batchUnitCost}
                          onChange={(e) => setBatchUnitCost(e.target.value)}
                          className={cn(inputCls, "w-full")}
                          placeholder="Đơn giá nhập kho (0 nếu bỏ qua)"
                          disabled={saving}
                        />
                        <div className="flex gap-2">
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
                            onClick={() => setShowBatchCompleteDialog(false)}
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
              </>
            )}

            {/* COMPLETED */}
            {isCompleted && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">
                  {t("Lệnh sản xuất đã hoàn thành")}
                </span>
              </div>
            )}
          </div>

          {/* Right Panel — General information */}
          <div className="hidden w-64 shrink-0 flex-col gap-4 border-l border-border bg-muted/30 p-5 text-sm xl:flex">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("Thông tin chung")}
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">{t("Mã lệnh")}</p>
                <p className="font-medium">{localOrder.referenceNo || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("Thành phẩm")}
                </p>
                <p className="font-medium">
                  {localOrder.finishedGoodItemName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("Kho sản xuất")}
                </p>
                <p className="font-medium">{localOrder.warehouseCode || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("Ngày bắt đầu (kế hoạch)")}
                </p>
                <p className="font-medium">
                  {localOrder.plannedStartDate?.slice(0, 10) || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("Ngày hoàn thành (kế hoạch)")}
                </p>
                <p className="font-medium">
                  {localOrder.plannedEndDate?.slice(0, 10) || "—"}
                </p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">
                  {t("Tiến độ sản xuất")}
                </p>
                <p className="text-base font-bold text-emerald-700">
                  {fmtQty(qtyProduced)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / {fmtQty(qtyToProduce)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
