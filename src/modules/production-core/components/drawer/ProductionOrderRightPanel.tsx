import React from "react";
import {
  DrawerField,
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";
import type { ErpProductionOrder } from "@/modules/production-core/api/productionCoreApi";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";

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

export function ProductionOrderRightPanel({
  mode,
  editing,
  form,
  setForm,
  itemOptions,
  availableBoms,
  bomOptions,
  saving,
  notes = "",
  onNotesChange,
}: ProductionOrderRightPanelProps) {
  const t = useT();
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

      {/* Section 2: Kế hoạch thời gian */}
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
