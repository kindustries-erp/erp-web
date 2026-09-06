import React, { useMemo, useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { CheckCircle2, PlayCircle } from "lucide-react";
import type { ErpProductionOrder } from "../../api/productionCoreApi";
import {
  ProductionIdentifierReviewTable,
  type ProductionIdentifier,
  type TrackingPolicy,
  identifiersAllValid,
  findVehicleDuplicate,
  makeIdentifierRows,
  emptyIdentifier,
  generateInternalSerial,
} from "./ProductionIdentifierReviewTable";

export interface ProductionIdentifierDeclareDrawerProps {
  open: boolean;
  onClose: () => void;
  order: ErpProductionOrder | null;
  policy: TrackingPolicy;
  identifiers: ProductionIdentifier[];
  setIdentifiers: React.Dispatch<React.SetStateAction<ProductionIdentifier[]>>;
  batchCompleteQty: string;
  setBatchCompleteQty: (qty: string) => void;
  onBatchComplete: () => Promise<void>;
  saving?: boolean;
  disabled?: boolean;
}

function fmtQty(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

export function ProductionIdentifierDeclareDrawer({
  open,
  onClose,
  order,
  policy,
  identifiers,
  setIdentifiers,
  batchCompleteQty,
  setBatchCompleteQty,
  onBatchComplete,
  saving = false,
  disabled = false,
}: ProductionIdentifierDeclareDrawerProps) {
  const t = useT();

  const fgItem = order?.finishedGoodItem as any;
  const skuPrefix = fgItem?.sku || fgItem?.itemCode || "FG";
  const fgName =
    order?.finishedGoodItemName || fgItem?.itemName || fgItem?.name || "—";
  const orderRef = order?.referenceNo || order?.id || "";
  const orderSuffix = orderRef.slice(-4);
  const bomVersion = (order?.outputMetadata as any)?.bomVersion;

  const qtyToProduce = Number(order?.qtyToProduce ?? 0);
  const qtyProduced = Number(order?.qtyProduced ?? 0);
  const remaining = Math.max(0, qtyToProduce - qtyProduced);

  // Isolated Local State for high performance (Zero-latency)
  const [localIdentifiers, setLocalIdentifiers] = useState<
    ProductionIdentifier[]
  >([]);
  const [localQty, setLocalQty] = useState<string>("1");

  const needsIdentifiers = ["SERIAL", "LOT", "VEHICLE"].includes(policy);

  // Initialize local state when drawer opens or order changes
  React.useEffect(() => {
    if (open) {
      const initialQtyStr =
        batchCompleteQty || String(remaining > 0 ? remaining : 1);
      const initialQty = Math.max(1, Math.floor(Number(initialQtyStr) || 1));
      setLocalQty(String(initialQty));

      if (identifiers && identifiers.length === initialQty) {
        setLocalIdentifiers(identifiers);
      } else {
        setLocalIdentifiers(
          makeIdentifierRows(initialQty, skuPrefix, orderSuffix),
        );
      }
    }
  }, [open, batchCompleteQty, remaining, identifiers, skuPrefix, orderSuffix]);

  const handleQtyChange = React.useCallback(
    (newQtyStr: string) => {
      setLocalQty(newQtyStr);
      const qty = Math.max(1, Math.floor(Number(newQtyStr) || 1));
      if (qty <= 0) return;

      setLocalIdentifiers((prev) => {
        if (prev.length === qty) return prev;
        if (prev.length < qty) {
          const added = Array.from({ length: qty - prev.length }, (_, idx) =>
            emptyIdentifier(
              generateInternalSerial(
                skuPrefix,
                prev.length + idx + 1,
                orderSuffix,
              ),
            ),
          );
          return [...prev, ...added];
        }
        return prev.slice(0, qty);
      });
    },
    [skuPrefix, orderSuffix],
  );

  const numBatchQty = Number(localQty) || 0;

  const isIdentifiersValid =
    !needsIdentifiers ||
    (localIdentifiers.length > 0 &&
      identifiersAllValid(localIdentifiers, policy) &&
      (policy !== "VEHICLE" || !findVehicleDuplicate(localIdentifiers)));

  const canConfirm =
    !saving &&
    !disabled &&
    numBatchQty > 0 &&
    numBatchQty <= remaining &&
    isIdentifiersValid;

  const handleIdentifierChange = React.useCallback(
    (index: number, val: ProductionIdentifier) => {
      setLocalIdentifiers((prev) =>
        prev.map((row, i) => (i === index ? val : row)),
      );
    },
    [],
  );

  const handleSetRows = React.useCallback((newRows: ProductionIdentifier[]) => {
    setLocalIdentifiers(newRows);
    if (newRows.length > 0) {
      setLocalQty(String(newRows.length));
    }
  }, []);

  const handleConfirm = async () => {
    if (!canConfirm) return;
    // Sync back to parent state before executing batch complete
    setIdentifiers(localIdentifiers);
    setBatchCompleteQty(localQty);
    await onBatchComplete();
  };

  const titleExtra = useMemo(() => {
    let badgeText = "Không theo dõi định danh";
    if (policy === "VEHICLE") badgeText = "Định danh Xe (VIN/Máy/Serial)";
    else if (policy === "SERIAL") badgeText = "Định danh Serial phụ tùng";
    else if (policy === "LOT") badgeText = "Định danh Số Lô";

    return (
      <Badge variant="outline" className="font-semibold text-xs py-0.5">
        {badgeText}
      </Badge>
    );
  }, [policy]);

  const actions = useMemo(() => {
    return [
      {
        label: t("Đóng"),
        onClick: onClose,
        variant: "outline" as const,
        disabled: saving,
      },
      ...(!disabled
        ? [
            {
              label: saving
                ? t("Đang ghi nhận nhập kho...")
                : t("Xác nhận hoàn thành & Nhập kho"),
              primary: true,
              loading: saving,
              disabled: !canConfirm,
              onClick: handleConfirm,
            },
          ]
        : []),
    ];
  }, [t, onClose, saving, disabled, canConfirm, handleConfirm]);

  const rightPanel = useMemo(() => {
    return (
      <div className="space-y-3 pb-3">
        {/* Section: Thông tin Lệnh SX */}
        <DrawerSection
          title={t("Thông tin Lệnh sản xuất")}
          collapsible
          defaultCollapsed={false}
        >
          <DrawerRow
            label={t("Mã lệnh SX")}
            value={
              <span className="font-semibold text-foreground font-mono">
                {orderRef || "—"}
              </span>
            }
          />
          <DrawerRow
            label={t("Thành phẩm")}
            value={
              <span className="font-semibold text-foreground">{fgName}</span>
            }
          />
          <DrawerRow
            label={t("Mã SKU")}
            value={
              <span className="font-mono text-xs text-muted-foreground">
                {skuPrefix}
              </span>
            }
          />
          {bomVersion && (
            <DrawerRow
              label={t("Phiên bản BOM")}
              value={
                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                  v{bomVersion}
                </span>
              }
            />
          )}
          <DrawerRow
            label={t("Chính sách định danh")}
            value={
              <Badge variant="outline" className="text-[10px] font-semibold">
                {policy}
              </Badge>
            }
          />
        </DrawerSection>

        {/* Section: Tiến độ sản xuất */}
        <DrawerSection
          title={t("Tiến độ sản xuất")}
          collapsible
          defaultCollapsed={false}
        >
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("Kế hoạch sản xuất")}:
              </span>
              <span className="font-bold font-mono text-sm">
                {fmtQty(qtyToProduce)} {t("đơn vị")}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t("Đã hoàn thành trước đó")}:
              </span>
              <span className="font-bold font-mono text-sm text-emerald-600">
                {fmtQty(qtyProduced)} {t("đơn vị")}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <span className="text-muted-foreground font-semibold">
                {t("Còn lại cần sản xuất")}:
              </span>
              <span className="font-bold font-mono text-sm text-amber-600">
                {fmtQty(remaining)} {t("đơn vị")}
              </span>
            </div>

            <div className="pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50/80 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {t("Hoàn thành đợt này")}:{" "}
                  <strong className="font-bold font-mono">{numBatchQty}</strong>{" "}
                  {t("đơn vị")}
                </span>
              </div>
            </div>
          </div>
        </DrawerSection>

        {/* Section: Hướng dẫn nghiệp vụ */}
        <DrawerSection
          title={t("Quy tắc định danh")}
          collapsible
          defaultCollapsed={true}
        >
          <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed bg-muted/20 p-2.5 rounded-lg border border-border/50">
            {policy === "VEHICLE" ? (
              <>
                <p>
                  • <strong>Số khung & Số máy</strong>: Bắt buộc nhập chính xác
                  theo số dập trên xe thực tế.
                </p>
                <p>
                  • <strong>Số Serial xe</strong>: Tùy chọn, điền theo tem xuất
                  xưởng nếu có.
                </p>
                <p>
                  • <strong>Số Serial nội bộ</strong>: Tự động sinh chống trùng
                  kết hợp mã Lệnh SX & ngày tháng.
                </p>
              </>
            ) : (
              <p>
                • <strong>Số Serial phụ tùng / kho</strong>: Tự động sinh hoặc
                nhập tay theo quy chuẩn quản lý tồn kho.
              </p>
            )}
          </div>
        </DrawerSection>
      </div>
    );
  }, [
    t,
    orderRef,
    fgName,
    skuPrefix,
    bomVersion,
    policy,
    qtyToProduce,
    qtyProduced,
    remaining,
    numBatchQty,
  ]);

  return (
    <StandardFormDrawer
      open={open}
      mode={disabled ? "view" : "edit"}
      onClose={onClose}
      title={
        policy === "VEHICLE"
          ? t("Nghiệm thu & Khai báo Số khung, Số máy Xe")
          : t("Nghiệm thu & Hoàn thành sản xuất")
      }
      subtitle={orderRef ? `${t("Lệnh sản xuất")}: ${orderRef}` : undefined}
      titleExtra={titleExtra}
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      actions={actions}
      leftPanel={
        <div className="space-y-4 pb-4">
          {/* Top Card: Khai báo số lượng hoàn thành đợt này */}
          <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4 text-emerald-600" />
                  {t("Số lượng nghiệm thu & hoàn thành đợt này")}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t(
                    "Số dòng định danh bên dưới sẽ tự động đồng bộ 1:1 theo số lượng này.",
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={remaining}
                  value={localQty}
                  onChange={(e) => handleQtyChange(e.target.value)}
                  disabled={saving || disabled || remaining <= 0}
                  className={`${inputCls} w-28 text-right font-bold text-sm font-mono h-8`}
                  placeholder="Số lượng"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-medium"
                  onClick={() => handleQtyChange(String(remaining))}
                  disabled={saving || disabled || remaining <= 0}
                >
                  {t("Tất cả còn lại")} ({remaining})
                </Button>
              </div>
            </div>
          </div>

          {/* Review Table (Auto-sync 1:1 rows) */}
          {needsIdentifiers && (
            <ProductionIdentifierReviewTable
              policy={policy}
              identifiers={localIdentifiers}
              onChange={handleIdentifierChange}
              onSetIdentifiers={handleSetRows}
              requiredQty={numBatchQty}
              skuPrefix={skuPrefix}
              orderSuffix={orderSuffix}
              itemName={fgName}
              disabled={disabled || saving}
            />
          )}
        </div>
      }
      rightPanel={rightPanel}
    />
  );
}
