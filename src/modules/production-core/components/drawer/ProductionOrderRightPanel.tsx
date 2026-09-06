import React, { useMemo } from "react";
import {
  DrawerField,
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { Badge } from "@/shared/components/ui/badge";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import type {
  ErpProductionOrder,
  ExplodePreviewBomInfo,
  BomAttributeDetail,
} from "@/modules/production-core/api/productionCoreApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { Loader2 } from "lucide-react";

export interface ProductionOrderRightPanelProps {
  mode: DrawerMode;
  editing: ErpProductionOrder | null;
  form: {
    finishedGoodItemId: string;
    bomId: string;
    qtyToProduce: string;
    referenceNo: string;
    warehouseCode: string;
    plannedStartDate: string;
    plannedEndDate: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  itemOptions: Array<{ value: string; label: string }>;
  availableBoms: any[];
  bomOptions: Array<{ value: string; label: string }>;
  selectedBomInfo?: ExplodePreviewBomInfo | null;
  bomLoading?: boolean;
  saving: boolean;
  notes?: string;
  onNotesChange?: (notes: string) => void;
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

function resolveAttributeDisplayName(
  attr: BomAttributeDetail,
  locale: string,
): string {
  if (locale === "en" && attr.nameEn) {
    return attr.nameEn;
  }
  return attr.name || attr.code;
}

function resolveAttributeDisplayValue(
  attr: BomAttributeDetail,
  locale: string,
  t: (key: string, fallback?: string) => string,
): React.ReactNode {
  const val = attr.value;
  if (val === undefined || val === null || val === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  if (attr.fieldType === "CHECKBOX") {
    const isTrue = val === true || val === "true";
    return (
      <Badge
        variant={isTrue ? "default" : "secondary"}
        className="text-[10px] font-medium"
      >
        {isTrue ? t("Có", "Yes") : t("Không", "No")}
      </Badge>
    );
  }

  if (attr.fieldType === "SELECT" && Array.isArray(attr.options)) {
    const matched = attr.options.find((o) => o.value === val);
    if (matched) {
      const label =
        locale === "en" && matched.labelEn
          ? matched.labelEn
          : matched.labels?.[locale] || matched.label || matched.value;
      return (
        <Badge
          variant="outline"
          className="text-[11px] font-medium bg-muted/30"
        >
          {label}
        </Badge>
      );
    }
  }

  return <span className="font-medium text-foreground">{String(val)}</span>;
}

export function ProductionOrderRightPanel({
  mode,
  editing,
  form,
  setForm,
  itemOptions,
  availableBoms,
  bomOptions,
  selectedBomInfo,
  bomLoading = false,
  saving,
  notes = "",
  onNotesChange,
}: ProductionOrderRightPanelProps) {
  const t = useT();
  const { locale } = useAppStore();
  const viewOnly = mode === "view";
  const isConfirmed =
    editing?.status === "CONFIRMED" || editing?.status === "IN_PROGRESS";
  const isCompleted = editing?.status === "COMPLETED";
  const isCancelled = editing?.status === "CANCELLED";
  const isImmutable =
    saving || isConfirmed || isCompleted || isCancelled || viewOnly;

  const trackingPolicy = (
    editing?.finishedGoodItem as { trackingPolicy?: string } | undefined
  )?.trackingPolicy;

  const effectiveBomVersion =
    selectedBomInfo?.version ||
    (editing?.outputMetadata as any)?.bomVersion ||
    availableBoms.find(
      (b) => b.id === (form.bomId || (editing?.outputMetadata as any)?.bomId),
    )?.version;

  const selectedBomAttributeDetails = selectedBomInfo?.attributeDetails;
  const uniqueAttributeDetails = useMemo(() => {
    if (!selectedBomAttributeDetails) return [];
    const seen = new Set<string>();
    return selectedBomAttributeDetails.filter((attr) => {
      const key = (attr.code || attr.id || "").toLowerCase();
      if (!key) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedBomAttributeDetails]);

  return (
    <div className="space-y-3 pb-3">
      {/* Section 1: Thông tin chung */}
      <DrawerSection
        title={t("Thông tin chung")}
        collapsible
        defaultCollapsed={false}
      >
        {viewOnly && editing ? (
          <>
            <DrawerRow
              label={t("Mã lệnh")}
              value={
                <span className="font-semibold text-foreground">
                  {editing.referenceNo || editing.id}
                </span>
              }
            />
            <DrawerRow
              label={t("Thành phẩm")}
              value={
                <span className="font-medium text-blue-700 dark:text-blue-400">
                  {editing.finishedGoodItemName ||
                    itemOptions.find(
                      (i) => i.value === editing.finishedGoodItemId,
                    )?.label ||
                    editing.finishedGoodItemId ||
                    "—"}
                </span>
              }
            />
            {effectiveBomVersion && (
              <DrawerRow
                label={t("Phiên bản BOM")}
                value={
                  <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                    v{effectiveBomVersion}
                  </span>
                }
              />
            )}
            {trackingPolicy && trackingPolicy !== "NONE" && (
              <DrawerRow
                label={t("Chính sách định danh")}
                value={
                  <span className="rounded-sm bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                    {trackingPolicy}
                  </span>
                }
              />
            )}
            <DrawerRow
              label={t("Số lượng kế hoạch")}
              value={
                <span className="font-semibold text-foreground">
                  {fmtQty(editing.qtyToProduce)}
                </span>
              }
            />
            <DrawerRow
              label={t("Mã kho")}
              value={editing.warehouseCode || "—"}
            />
            <DrawerRow
              label={t("Ghi chú")}
              value={
                editing.notes || (editing.outputMetadata as any)?.notes || "—"
              }
            />
            {editing.createdAt && (
              <DrawerRow
                label={t("Thời điểm tạo")}
                value={new Date(editing.createdAt).toLocaleString("vi-VN")}
              />
            )}
          </>
        ) : (
          <>
            <DrawerField label={t("Mã lệnh")}>
              <input
                value={form.referenceNo}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, referenceNo: e.target.value }))
                }
                disabled={isImmutable}
                className={inputCls}
                placeholder={t("Tự động theo tháng (MO-YYYYMMXXXX)")}
              />
            </DrawerField>

            <DrawerField label={t("Thành phẩm")} required>
              <Combobox
                value={form.finishedGoodItemId}
                onChange={(v) =>
                  setForm((p: any) => ({ ...p, finishedGoodItemId: v }))
                }
                options={itemOptions}
                placeholder={t("Chọn thành phẩm")}
                searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
                disabled={isImmutable || !!editing}
              />
            </DrawerField>

            {form.finishedGoodItemId && availableBoms.length > 0 && (
              <DrawerField label={t("Phiên bản BOM")}>
                <Combobox
                  value={form.bomId}
                  onChange={(v) => setForm((p: any) => ({ ...p, bomId: v }))}
                  options={bomOptions}
                  placeholder={t("Chọn phiên bản BOM")}
                  searchPlaceholder={t("Tìm BOM")}
                  disabled={isImmutable}
                />
              </DrawerField>
            )}

            <DrawerField label={t("Số lượng kế hoạch")} required>
              <input
                type="number"
                min="0.001"
                step="any"
                value={form.qtyToProduce}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, qtyToProduce: e.target.value }))
                }
                disabled={isImmutable}
                className={inputCls}
                placeholder="1"
              />
            </DrawerField>

            <DrawerField label={t("Mã kho")}>
              <input
                value={form.warehouseCode}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, warehouseCode: e.target.value }))
                }
                disabled={isImmutable}
                className={inputCls}
                placeholder="Ví dụ: WH-01"
              />
            </DrawerField>

            <DrawerField label={t("Ghi chú")}>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => onNotesChange?.(e.target.value)}
                className={inputCls}
                placeholder={t("Nhập ghi chú cho lệnh sản xuất...")}
                disabled={saving}
              />
            </DrawerField>
          </>
        )}
      </DrawerSection>

      {/* Section 2: Thuộc tính định mức (BOM) */}
      {(selectedBomInfo ||
        form.bomId ||
        (editing?.outputMetadata as any)?.bomId) && (
        <DrawerSection
          title={t("Thuộc tính định mức (BOM)", "BOM Attributes")}
          collapsible
          defaultCollapsed={false}
        >
          {bomLoading ? (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>
                {t("Đang tải thuộc tính BOM...", "Loading BOM attributes...")}
              </span>
            </div>
          ) : selectedBomInfo ? (
            <div className="space-y-2.5">
              {/* Danh mục BOM */}
              {selectedBomInfo.categoryName && (
                <DrawerRow
                  label={t("Danh mục BOM", "BOM Category")}
                  value={
                    <Badge
                      variant="outline"
                      className="font-semibold bg-primary/5 text-primary border-primary/20 text-xs"
                    >
                      {selectedBomInfo.categoryName}
                      {selectedBomInfo.categoryCode
                        ? ` (${selectedBomInfo.categoryCode})`
                        : ""}
                    </Badge>
                  }
                />
              )}

              {/* Danh sách thuộc tính (Global & Category) */}
              {uniqueAttributeDetails.length > 0 ? (
                uniqueAttributeDetails.map((attr) => (
                  <DrawerRow
                    key={attr.id || attr.code}
                    label={resolveAttributeDisplayName(attr, locale)}
                    value={resolveAttributeDisplayValue(attr, locale, t)}
                  />
                ))
              ) : !selectedBomInfo.categoryName ? (
                <div className="text-center py-2 text-xs text-muted-foreground italic">
                  {t(
                    "BOM này không có thuộc tính tùy chỉnh.",
                    "This BOM has no custom attributes configured.",
                  )}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-muted-foreground italic">
              {t(
                "Vui lòng chọn BOM để xem thuộc tính.",
                "Please select a BOM to view attributes.",
              )}
            </div>
          )}
        </DrawerSection>
      )}

      {/* Section 3: Kế hoạch thời gian */}
      <DrawerSection
        title={t("Kế hoạch thời gian")}
        collapsible
        defaultCollapsed={false}
      >
        {viewOnly && editing ? (
          <>
            <DrawerRow
              label={t("Ngày bắt đầu (kế hoạch)")}
              value={editing.plannedStartDate?.slice(0, 10) || "—"}
            />
            <DrawerRow
              label={t("Ngày hoàn thành (kế hoạch)")}
              value={editing.plannedEndDate?.slice(0, 10) || "—"}
            />
          </>
        ) : (
          <>
            <DrawerField label={t("Ngày bắt đầu (kế hoạch)")}>
              <DatePicker
                className={inputCls}
                value={form.plannedStartDate}
                onChange={(v) =>
                  setForm((p: any) => ({ ...p, plannedStartDate: v }))
                }
                disabled={isImmutable}
              />
            </DrawerField>

            <DrawerField label={t("Ngày hoàn thành (kế hoạch)")}>
              <DatePicker
                className={inputCls}
                value={form.plannedEndDate}
                onChange={(v) =>
                  setForm((p: any) => ({ ...p, plannedEndDate: v }))
                }
                disabled={isImmutable}
              />
            </DrawerField>
          </>
        )}
      </DrawerSection>
    </div>
  );
}
