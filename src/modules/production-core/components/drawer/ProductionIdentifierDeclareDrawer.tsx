import React, { useMemo, useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerRow } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { ErpProductionOrder } from "../../api/productionCoreApi";
import {
  ProductionIdentifierReviewTable,
  type ProductionIdentifier,
  type TrackingPolicy,
  isIdentifierValid,
  findVehicleDuplicate,
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
  onBatchComplete: (
    explicitQty?: number,
    explicitIdentifiers?: ProductionIdentifier[],
    updatedVehicles?: ProductionIdentifier[],
  ) => Promise<void>;
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
  onBatchComplete,
  saving = false,
  disabled = false,
}: ProductionIdentifierDeclareDrawerProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);

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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [closeConfirmModalOpen, setCloseConfirmModalOpen] = useState(false);

  const needsIdentifiers = ["SERIAL", "LOT", "VEHICLE"].includes(policy);

  // Initialize local state when drawer opens: Always strictly allocate qtyToProduce rows
  React.useEffect(() => {
    if (open && order) {
      const targetTotalQty = Math.max(
        1,
        Math.floor(Number(order.qtyToProduce) || 1),
      );
      const producedList =
        (policy === "VEHICLE"
          ? order.producedVehicles
          : order.producedSerials) || [];

      const initialRows: ProductionIdentifier[] = [];

      for (let i = 0; i < targetTotalQty; i++) {
        if (i < producedList.length) {
          const item: any = producedList[i];
          const attrs = item.attributes || {};
          // Số serial xe là tem ngoài tùy chọn, KHÔNG fallback sang item.serialNo khi policy là VEHICLE
          const vSerial =
            attrs.vehicleSerialNo ||
            item.vehicleSerialNo ||
            (policy === "SERIAL" ? item.serialNo : "") ||
            "";
          const iSerial =
            attrs.internalSerialNo ||
            item.internalSerialNo ||
            (policy === "SERIAL" ? item.serialNo : "") ||
            generateInternalSerial(skuPrefix, i + 1, orderSuffix);

          initialRows.push({
            id: item.id || `veh-${i}`,
            vinNo: item.vin || item.vinNo || "",
            engineNo: item.engineNo || "",
            serialNo: vSerial,
            internalSerialNo: iSerial,
            lotNo: item.lotNo || "",
            notes: item.notes || "",
            attributes: [],
            isExisting: true,
            originalVinNo: item.vin || item.vinNo || "",
            originalEngineNo: item.engineNo || "",
            originalSerialNo: vSerial,
            originalInternalSerialNo: iSerial,
            originalNotes: item.notes || "",
          });
        } else {
          initialRows.push(
            emptyIdentifier(
              generateInternalSerial(skuPrefix, i + 1, orderSuffix),
              false,
            ),
          );
        }
      }

      setLocalIdentifiers(initialRows);
    }
  }, [open, order, policy, skuPrefix, orderSuffix]);

  // Newly produced rows (isExisting = false & valid)
  const newProducedRows = useMemo(() => {
    if (!needsIdentifiers) return [];
    return localIdentifiers.filter(
      (r) => !r.isExisting && isIdentifierValid(r, policy),
    );
  }, [localIdentifiers, policy, needsIdentifiers]);

  const newProducedCount = needsIdentifiers
    ? newProducedRows.length
    : remaining;

  // Existing rows that have been updated (isExisting = true & modified)
  const updatedRows = useMemo(() => {
    if (!needsIdentifiers) return [];
    return localIdentifiers.filter(
      (r) =>
        r.isExisting &&
        isIdentifierValid(r, policy) &&
        (r.vinNo !== (r.originalVinNo || "") ||
          r.engineNo !== (r.originalEngineNo || "") ||
          r.serialNo !== (r.originalSerialNo || "") ||
          r.internalSerialNo !== (r.originalInternalSerialNo || "") ||
          r.notes !== (r.originalNotes || "")),
    );
  }, [localIdentifiers, policy, needsIdentifiers]);

  const updatedCount = updatedRows.length;

  // Track if user has made unsaved changes
  const isDirty = useMemo(() => {
    return localIdentifiers.some((r) => {
      if (!r.isExisting) {
        return (
          !!r.vinNo?.trim() ||
          !!r.engineNo?.trim() ||
          !!r.serialNo?.trim() ||
          !!r.notes?.trim()
        );
      }
      return (
        (r.vinNo || "") !== (r.originalVinNo || "") ||
        (r.engineNo || "") !== (r.originalEngineNo || "") ||
        (r.serialNo || "") !== (r.originalSerialNo || "") ||
        (r.internalSerialNo || "") !== (r.originalInternalSerialNo || "") ||
        (r.notes || "") !== (r.originalNotes || "")
      );
    });
  }, [localIdentifiers]);

  // Count unproduced rows that are not yet filled
  const unproducedCount = useMemo(() => {
    if (!needsIdentifiers) return 0;
    return localIdentifiers.filter(
      (r) => !r.isExisting && !isIdentifierValid(r, policy),
    ).length;
  }, [localIdentifiers, policy, needsIdentifiers]);

  // Check error: Existing produced vehicle cannot be cleared/emptied
  const hasExistingClearedError = useMemo(() => {
    if (policy === "VEHICLE") {
      return localIdentifiers.some(
        (r) => r.isExisting && (!r.vinNo?.trim() || !r.engineNo?.trim()),
      );
    }
    if (policy === "SERIAL") {
      return localIdentifiers.some(
        (r) =>
          r.isExisting && !r.internalSerialNo?.trim() && !r.serialNo?.trim(),
      );
    }
    if (policy === "LOT") {
      return localIdentifiers.some((r) => r.isExisting && !r.lotNo?.trim());
    }
    return false;
  }, [localIdentifiers, policy]);

  // Check error: New row partially filled (e.g. only VIN or only Engine entered)
  const hasIncompleteNewError = useMemo(() => {
    if (policy === "VEHICLE") {
      return localIdentifiers.some(
        (r) =>
          !r.isExisting &&
          ((!!r.vinNo?.trim() && !r.engineNo?.trim()) ||
            (!r.vinNo?.trim() && !!r.engineNo?.trim())),
      );
    }
    return false;
  }, [localIdentifiers, policy]);

  // Duplicate checks across all filled identifiers
  const duplicateError = useMemo(() => {
    if (policy === "VEHICLE") {
      const allFilled = localIdentifiers.filter(
        (x) =>
          !!x.vinNo?.trim() || !!x.engineNo?.trim() || !!x.serialNo?.trim(),
      );
      return findVehicleDuplicate(allFilled);
    }
    return null;
  }, [policy, localIdentifiers]);

  const isOverRemaining = newProducedCount > remaining;

  const canConfirm =
    !saving &&
    !disabled &&
    (newProducedCount > 0 || updatedCount > 0) &&
    !isOverRemaining &&
    !duplicateError &&
    !hasExistingClearedError &&
    !hasIncompleteNewError;

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
  }, []);

  const handleValidateAndSubmit = React.useCallback(() => {
    if (saving || disabled) return;

    if (newProducedCount === 0 && updatedCount === 0) {
      showToast({
        title: t("Không có thông tin mới hoặc thay đổi nào để lưu."),
        variant: "destructive",
      });
      return;
    }
    if (hasExistingClearedError) {
      showToast({
        title: t(
          "Xe đã ghi nhận xuất xưởng không được để trống Số khung hoặc Số máy!",
        ),
        variant: "destructive",
      });
      return;
    }
    if (hasIncompleteNewError) {
      showToast({
        title: t("Vui lòng điền đủ cả Số khung và Số máy cho xe mới!"),
        variant: "destructive",
      });
      return;
    }
    if (isOverRemaining) {
      showToast({
        title: `${t("Số lượng khai báo")} (${newProducedCount}) ${t("vượt quá số lượng còn lại")} (${remaining})!`,
        variant: "destructive",
      });
      return;
    }
    if (duplicateError) {
      showToast({
        title: duplicateError,
        variant: "destructive",
      });
      return;
    }

    setConfirmModalOpen(true);
  }, [
    saving,
    disabled,
    newProducedCount,
    updatedCount,
    hasExistingClearedError,
    hasIncompleteNewError,
    isOverRemaining,
    remaining,
    duplicateError,
    showToast,
    t,
  ]);

  const handleRequestClose = React.useCallback(() => {
    if (isDirty) {
      setCloseConfirmModalOpen(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleExecuteBatchComplete = async () => {
    if (!canConfirm) return;
    setConfirmModalOpen(false);
    await onBatchComplete(newProducedCount, newProducedRows, updatedRows);
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

  const primaryButtonLabel = useMemo(() => {
    if (saving) {
      return newProducedCount > 0
        ? t("Đang ghi nhận nhập kho...")
        : t("Đang lưu cập nhật...");
    }
    if (newProducedCount > 0) {
      return t("Xác nhận hoàn thành & Nhập kho");
    }
    return t("Lưu cập nhật thông tin");
  }, [saving, newProducedCount, t]);

  const actions = useMemo(() => {
    return [
      {
        label: t("Đóng"),
        onClick: handleRequestClose,
        variant: "outline" as const,
        disabled: saving,
      },
      ...(!disabled
        ? [
            {
              label: primaryButtonLabel,
              primary: true,
              loading: saving,
              disabled: saving || !canConfirm,
              onClick: handleValidateAndSubmit,
            },
          ]
        : []),
    ];
  }, [
    t,
    handleRequestClose,
    saving,
    disabled,
    primaryButtonLabel,
    canConfirm,
    handleValidateAndSubmit,
  ]);

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
          <DrawerRow
            label={t("Kế hoạch sản xuất")}
            value={
              <span className="font-mono font-bold text-foreground">
                {fmtQty(qtyToProduce)} {t("đơn vị")}
              </span>
            }
          />
          <DrawerRow
            label={t("Đã hoàn thành trước đó")}
            value={
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {fmtQty(qtyProduced)} {t("đơn vị")}
              </span>
            }
          />
          <DrawerRow
            label={t("Còn lại cần sản xuất")}
            value={
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                {fmtQty(remaining)} {t("đơn vị")}
              </span>
            }
          />
          <DrawerRow
            label={t("Hoàn thành đợt này")}
            value={
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {newProducedCount} {t("đơn vị")}
              </span>
            }
          />
          {updatedCount > 0 && (
            <DrawerRow
              label={t("Cập nhật thông tin")}
              value={
                <span className="font-mono font-bold text-foreground">
                  {updatedCount} {t("đơn vị")}
                </span>
              }
            />
          )}

          {(hasExistingClearedError ||
            hasIncompleteNewError ||
            isOverRemaining ||
            duplicateError) && (
            <div className="pt-2 mt-1 border-t border-border/60 space-y-1.5">
              {hasExistingClearedError && (
                <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {t(
                      "Xe đã ghi nhận xuất xưởng không được để trống Số khung hoặc Số máy!",
                    )}
                  </span>
                </div>
              )}
              {hasIncompleteNewError && (
                <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {t("Vui lòng điền đủ cả Số khung và Số máy cho xe mới!")}
                  </span>
                </div>
              )}
              {isOverRemaining && (
                <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {t("Số lượng khai báo")} ({newProducedCount}){" "}
                    {t("vượt quá số lượng còn lại")} ({remaining})!
                  </span>
                </div>
              )}
              {duplicateError && (
                <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{duplicateError}</span>
                </div>
              )}
            </div>
          )}
        </DrawerSection>

        {/* Section: Hướng dẫn nghiệp vụ */}
        <DrawerSection
          title={t("Quy tắc định danh")}
          collapsible
          defaultCollapsed={true}
        >
          <div className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
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
    newProducedCount,
    updatedCount,
    hasExistingClearedError,
    hasIncompleteNewError,
    isOverRemaining,
    duplicateError,
  ]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={disabled ? "view" : "edit"}
        onClose={handleRequestClose}
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
          needsIdentifiers ? (
            <ProductionIdentifierReviewTable
              policy={policy}
              identifiers={localIdentifiers}
              onChange={handleIdentifierChange}
              onSetIdentifiers={handleSetRows}
              requiredQty={qtyToProduce}
              skuPrefix={skuPrefix}
              orderSuffix={orderSuffix}
              itemName={fgName}
              disabled={disabled || saving}
            />
          ) : null
        }
        rightPanel={rightPanel}
      />

      {/* Standard Confirm Modal (Close Confirm Modal UI Style) */}
      <ConfirmModal
        open={confirmModalOpen}
        title={
          newProducedCount > 0
            ? t("Xác nhận hoàn thành & Nhập kho")
            : t("Xác nhận lưu cập nhật thông tin")
        }
        message={
          <div className="space-y-3 text-xs leading-relaxed">
            <p className="font-medium text-foreground">
              {t(
                "Bạn có chắc chắn muốn xác nhận kết quả sản xuất cho Lệnh sản xuất",
              )}{" "}
              <strong className="font-mono font-semibold text-foreground">
                {orderRef}
              </strong>
              {fgName && fgName !== "—" ? ` (${fgName})` : ""}?
            </p>

            <div className="bg-muted/40 rounded-xl p-3 border border-border/60 space-y-2 font-sans text-xs">
              {newProducedCount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    {t("Sản xuất mới & Nhập kho")}:
                  </span>
                  <span className="font-mono font-bold text-sm">
                    {newProducedCount}{" "}
                    {policy === "VEHICLE" ? t("xe") : t("đơn vị")}
                  </span>
                </div>
              )}

              {updatedCount > 0 && (
                <div className="flex items-center justify-between text-foreground font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-foreground/60 shrink-0" />
                    {t("Cập nhật thông tin đã xuất xưởng")}:
                  </span>
                  <span className="font-mono font-bold text-sm">
                    {updatedCount}{" "}
                    {policy === "VEHICLE" ? t("xe") : t("đơn vị")}
                  </span>
                </div>
              )}
            </div>

            {unproducedCount > 0 && (
              <p className="text-[11px] text-muted-foreground">
                {t("Lưu ý: Còn lại")}{" "}
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                  {unproducedCount}
                </span>{" "}
                {policy === "VEHICLE" ? t("xe") : t("đơn vị")}{" "}
                {t(
                  "chưa hoàn thành đợt này (sẽ tiếp tục thực hiện ở các đợt tiếp theo).",
                )}
              </p>
            )}
          </div>
        }
        confirmLabel={
          newProducedCount > 0 ? t("Đồng ý nhập kho") : t("Đồng ý lưu cập nhật")
        }
        cancelLabel={t("Hủy")}
        danger={false}
        loading={saving}
        onConfirm={handleExecuteBatchComplete}
        onCancel={() => setConfirmModalOpen(false)}
      />

      {/* Close Confirm Modal when user has unsaved edits */}
      <ConfirmModal
        open={closeConfirmModalOpen}
        title={t("Hủy bỏ thay đổi?")}
        message={t(
          "Bạn có các thay đổi chưa được lưu trong danh sách khai báo định danh. Bạn có chắc chắn muốn đóng không?",
        )}
        confirmLabel={t("Đồng ý đóng")}
        cancelLabel={t("Tiếp tục chỉnh sửa")}
        danger={true}
        onConfirm={() => {
          setCloseConfirmModalOpen(false);
          onClose();
        }}
        onCancel={() => setCloseConfirmModalOpen(false)}
      />
    </>
  );
}
