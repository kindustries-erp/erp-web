import React from "react";
import { PlayCircle, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { EmptyState } from "@/shared/components/EmptyState";
import { useT } from "@/core/i18n";
import type { ErpProductionOrder } from "../../api/productionCoreApi";
import {
  type ProductionIdentifier,
  type TrackingPolicy,
  emptyIdentifier,
  makeIdentifierRows,
  isIdentifierValid,
  identifiersAllValid,
  findVehicleDuplicate,
  generateInternalSerial,
} from "./ProductionIdentifierReviewTable";

export {
  type ProductionIdentifier,
  type TrackingPolicy,
  emptyIdentifier,
  makeIdentifierRows,
  isIdentifierValid,
  identifiersAllValid,
  findVehicleDuplicate,
  generateInternalSerial,
};

function fmtQty(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export interface ProductionOrderExecutionTabProps {
  order: ErpProductionOrder | null;
  saving: boolean;
  onStartAll: () => Promise<void>;
  onCompleteOne?: () => Promise<void>;
  onBatchComplete?: () => Promise<void>;
  batchCompleteQty?: string;
  setBatchCompleteQty?: (qty: string) => void;
  showBatchDialog?: boolean;
  setShowBatchDialog?: (show: boolean) => void;
  vehicleBulkInput?: string;
  setVehicleBulkInput?: (val: string) => void;
  applyVehicleBulkInput?: () => void;
  identifiers?: ProductionIdentifier[];
  setIdentifiers: React.Dispatch<React.SetStateAction<ProductionIdentifier[]>>;
  handleIdentifierChange?: (index: number, val: ProductionIdentifier) => void;
  trackingPolicy: TrackingPolicy;
  needsIdentifiers?: boolean;
  onOpenIdentifierDrawer?: () => void;
  orderSuffix?: string;
}

export function ProductionOrderExecutionTab({
  order,
  saving,
  onStartAll,
  setIdentifiers,
  trackingPolicy,
  onOpenIdentifierDrawer,
  orderSuffix = "",
  setBatchCompleteQty,
}: ProductionOrderExecutionTabProps) {
  const t = useT();

  const qtyToProduce = Number(order?.qtyToProduce ?? 0);
  const qtyProduced = Number(order?.qtyProduced ?? 0);
  const remaining = Math.max(0, qtyToProduce - qtyProduced);

  const isDraft = order?.status === "DRAFT";
  const isConfirmed = order?.status === "CONFIRMED";
  const isInProgress = order?.status === "IN_PROGRESS";
  const isCompleted = order?.status === "COMPLETED";
  const isCancelled = order?.status === "CANCELLED";

  const skuPrefix =
    (order?.finishedGoodItem as any)?.sku ||
    (order?.finishedGoodItem as any)?.itemCode ||
    "FG";

  const handleOpenCompletion = () => {
    const targetQty = remaining > 0 ? remaining : 1;
    if (setBatchCompleteQty) {
      setBatchCompleteQty(String(targetQty));
    }
    setIdentifiers(makeIdentifierRows(targetQty, skuPrefix, orderSuffix));
    if (onOpenIdentifierDrawer) {
      onOpenIdentifierDrawer();
    }
  };

  const producedList =
    (trackingPolicy === "VEHICLE"
      ? order?.producedVehicles
      : order?.producedSerials) ?? [];

  // Section Title with inline (X / Y) format
  const sectionTitle = (
    <div className="flex items-center gap-2">
      <span>{t("Danh sách thành phẩm đã xuất xưởng")}</span>
      <span className="font-mono font-semibold text-xs text-muted-foreground">
        ({fmtQty(qtyProduced)} / {fmtQty(qtyToProduce)})
      </span>
    </div>
  );

  // Title Extra Header Action & Progress Info
  const titleExtra = (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {isCompleted && (
        <Badge
          variant="outline"
          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          ✓ {t("Hoàn thành")} {fmtQty(qtyProduced)}/{fmtQty(qtyToProduce)}
        </Badge>
      )}

      {/* Action Button for CONFIRMED -> Start Production */}
      {isConfirmed && (
        <button
          type="button"
          onClick={onStartAll}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-amber-300 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5" />
          )}
          <span>
            {saving
              ? t("Đang xuất kho NVL...")
              : t("Bắt đầu sản xuất & Xuất kho")}
          </span>
        </button>
      )}

      {/* Action Button for IN_PROGRESS -> Open Completion & Declaration Drawer */}
      {isInProgress && (
        <Button
          size="sm"
          variant="primary"
          onClick={handleOpenCompletion}
          disabled={saving || remaining <= 0}
          className="gap-1.5 font-semibold text-xs shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("Nghiệm thu")}</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Banner: Status DRAFT */}
      {isDraft && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-amber-900 dark:text-amber-300">
              {t("Lệnh sản xuất đang ở trạng thái Nháp (DRAFT)")}
            </h5>
            <p className="text-amber-800/90 dark:text-amber-400 mt-0.5">
              {t(
                "Vui lòng kiểm tra định mức BOM và bấm 'Xác nhận lệnh' ở góc dưới để hệ thống tự động giữ chỗ nguyên vật liệu và mở khóa tiến trình.",
              )}
            </p>
          </div>
        </div>
      )}

      {/* Banner: Status CONFIRMED */}
      {isConfirmed && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3.5 text-xs">
          <PlayCircle className="h-4 w-4 text-foreground/70 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-foreground">
              {t("Giai đoạn 1: Sẵn sàng sản xuất & Xuất kho NVL")}
            </h5>
            <p className="text-muted-foreground mt-0.5">
              {t(
                "Nhấn nút 'Bắt đầu sản xuất & Xuất kho' ở góc phải để hệ thống tự động sinh Phiếu xuất kho NVL (XK-...) và chuyển sang Đang sản xuất.",
              )}
            </p>
          </div>
        </div>
      )}

      {/* Banner: Status CANCELLED */}
      {isCancelled && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50/70 dark:bg-red-950/30 p-3.5 text-xs">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <div>
            <h5 className="font-semibold text-red-900 dark:text-red-300">
              {t("Lệnh sản xuất đã bị hủy")}
            </h5>
            <p className="text-red-800/90 dark:text-red-400 mt-0.5">
              {t("Các giữ chỗ tồn kho và nguyên vật liệu đã được hoàn trả.")}
            </p>
          </div>
        </div>
      )}

      {/* Single Unified Section: Danh sách thành phẩm đã xuất xưởng */}
      <DrawerSection
        title={sectionTitle}
        titleExtra={titleExtra}
        collapsible
        defaultCollapsed={false}
      >
        {producedList.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm max-h-[420px] overflow-y-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/70 text-muted-foreground border-b border-border sticky top-0 backdrop-blur z-10">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold w-10">#</th>
                  {trackingPolicy === "VEHICLE" && (
                    <>
                      <th className="px-3 py-2 text-left font-semibold font-mono">
                        Số khung (VIN)
                      </th>
                      <th className="px-3 py-2 text-left font-semibold font-mono">
                        {t("Số máy")}
                      </th>
                      <th className="px-3 py-2 text-left font-semibold font-mono">
                        {t("Số Serial xe")}
                      </th>
                      <th className="px-3 py-2 text-left font-semibold font-mono text-primary bg-primary/5">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {t("Số Serial nội bộ")}
                        </span>
                      </th>
                    </>
                  )}
                  {trackingPolicy === "SERIAL" && (
                    <>
                      <th className="px-3 py-2 text-left font-semibold font-mono">
                        {t("Số Serial")}
                      </th>
                      <th className="px-3 py-2 text-left font-semibold font-mono text-primary bg-primary/5">
                        {t("Số Serial nội bộ")}
                      </th>
                    </>
                  )}
                  {trackingPolicy === "LOT" && (
                    <th className="px-3 py-2 text-left font-semibold font-mono">
                      {t("Số lô")}
                    </th>
                  )}
                  <th className="px-3 py-2 text-left font-semibold">
                    {t("Ghi chú")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {producedList.map((item: any, i: number) => {
                  const attrs = item.attributes || {};
                  const vehicleSerial =
                    attrs.vehicleSerialNo || item.vehicleSerialNo || "";
                  const internalSerial =
                    attrs.internalSerialNo ||
                    item.internalSerialNo ||
                    item.serialNo ||
                    "";

                  return (
                    <tr key={item.id || i} className="hover:bg-muted/30">
                      <td className="px-3 py-2 text-muted-foreground font-mono">
                        {i + 1}
                      </td>

                      {trackingPolicy === "VEHICLE" && (
                        <>
                          <td className="px-3 py-2 font-mono font-medium text-emerald-700 dark:text-emerald-400">
                            {item.vin || item.vinNo || "—"}
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-foreground">
                            {item.engineNo || "—"}
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-foreground">
                            {vehicleSerial || "—"}
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-primary bg-primary/5">
                            {internalSerial || "—"}
                          </td>
                        </>
                      )}

                      {trackingPolicy === "SERIAL" && (
                        <>
                          <td className="px-3 py-2 font-mono font-medium text-foreground">
                            {vehicleSerial || item.serialNo || "—"}
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-primary bg-primary/5">
                            {internalSerial || "—"}
                          </td>
                        </>
                      )}

                      {trackingPolicy === "LOT" && (
                        <td className="px-3 py-2 font-mono font-medium text-foreground">
                          {item.lotNo || "—"}
                        </td>
                      )}

                      <td className="px-3 py-2 text-muted-foreground">
                        {item.notes || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            size="sm"
            message={
              isCompleted
                ? t("Chưa có bản ghi thành phẩm xuất xưởng")
                : t("Chưa có thành phẩm nào được nghiệm thu xuất xưởng")
            }
            description={
              isInProgress
                ? t(
                    "Bấm nút 'Nghiệm thu & Khai báo...' ở góc phải để bắt đầu nghiệm thu thành phẩm nhập kho.",
                  )
                : isConfirmed
                  ? t("Bấm 'Bắt đầu sản xuất & Xuất kho' để bắt đầu.")
                  : t("Tiến trình sẽ mở khóa khi lệnh được xác nhận.")
            }
            className="border border-dashed rounded-xl py-10 bg-muted/10 my-1"
          />
        )}
      </DrawerSection>
    </div>
  );
}
