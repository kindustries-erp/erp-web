import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import {
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import type { ErpProductionOrder } from "@/modules/production-core/api/productionCoreApi";
import { Skeleton } from "@/shared/components/Skeleton";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { DatePicker } from "@/shared/components/DatePicker";
import { ChevronRight, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";

export interface ProductionOrderDrawerProps {
  open: boolean;
  loading?: boolean;
  editing: ErpProductionOrder | null;
  viewOnly?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
  drawerState: any; // Using custom state
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

function fmtDate(value?: string | null) {
  if (!value) return "—";
  return value.slice(0, 10);
}

export function ProductionOrderDrawer({
  open,
  loading,
  editing,
  viewOnly,
  onClose,
  drawerState,
}: ProductionOrderDrawerProps) {
  const t = useT();
  const {
    form,
    setForm,
    itemOptions,
    saving,
    error,
    handleSubmit,
    onIssueMaterial,
    onReceiveFinishedGood,
    showGeneralInfo,
    setShowGeneralInfo,
    bomLines,
  } = drawerState;

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  const isConfirmed =
    editing?.status === "CONFIRMED" || editing?.status === "IN_PROGRESS";
  const isCompleted = editing?.status === "COMPLETED";

  const actions = viewOnly
    ? [
        {
          label: t("Đóng"),
          onClick: onClose,
          variant: "outline" as const,
        },
      ]
    : [
        {
          label: t("Hủy"),
          onClick: onClose,
          variant: "outline" as const,
          disabled: saving,
        },
        {
          label: editing ? t("Lưu thay đổi") : t("Tạo Lệnh Sản Xuất"),
          primary: true,
          loading: saving,
          disabled: saving || isConfirmed || isCompleted,
          onClick: handleSubmit,
        },
      ];

  const leftPanel = (
    <div className="flex h-full flex-col p-4 md:p-6 space-y-6">
      <DrawerSection title={t("Thông tin sản phẩm")}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DrawerField label={t("Thành phẩm")} required>
            <Combobox
              value={form.finishedGoodItemId}
              onChange={(v) =>
                setForm((p: any) => ({ ...p, finishedGoodItemId: v }))
              }
              options={itemOptions}
              placeholder={t("Chọn thành phẩm")}
              searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
              disabled={saving || isConfirmed || isCompleted || viewOnly}
            />
          </DrawerField>

          <DrawerField label={t("Số lượng kế hoạch")} required>
            <input
              type="number"
              min="0.001"
              step="any"
              value={form.qtyToProduce}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, qtyToProduce: e.target.value }))
              }
              disabled={saving || isConfirmed || isCompleted || viewOnly}
              className={inputCls}
              placeholder="1"
            />
          </DrawerField>

          {editing && (
            <DrawerField label={t("Số lượng đã sản xuất")}>
              <div className="text-sm font-semibold text-emerald-600">
                {fmtQty(editing.qtyProduced)} / {fmtQty(editing.qtyToProduce)}
              </div>
            </DrawerField>
          )}
        </div>
      </DrawerSection>

      {bomLines && bomLines.length > 0 && (
        <DrawerSection title={t("Nguyên vật liệu (BOM)")}>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="min-w-full text-xs">
              <thead className="bg-muted text-left uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{t("Mặt hàng")}</th>
                  <th className="px-3 py-2 text-right">{t("Cần dùng")}</th>
                  <th className="px-3 py-2 text-right">{t("Đã xuất")}</th>
                  <th className="px-3 py-2">{t("ĐVT")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {bomLines.map((line: any) => {
                  const requiredQty = Number(line.qtyRequired || 0);
                  const displayRequired = editing
                    ? requiredQty
                    : requiredQty * Number(form.qtyToProduce || 1);
                  return (
                    <tr key={line.id}>
                      <td className="px-3 py-2 font-medium">
                        {line.itemName || line.itemId}
                      </td>
                      <td className="px-3 py-2 text-right text-amber-700 font-semibold">
                        {fmtQty(displayRequired.toString())}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-700 font-semibold">
                        {fmtQty(line.qtyIssued || "0")}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {line.uom || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </DrawerSection>
      )}
    </div>
  );

  const rightPanel = (
    <div
      className={cn(
        "shrink-0 space-y-4 transition-all duration-300 xl:sticky xl:top-0 bg-slate-50 border-l border-border",
        showGeneralInfo ? "w-full xl:w-[320px]" : "w-full xl:w-[52px]",
      )}
    >
      <DrawerSection
        title={
          <span
            className={cn(
              "transition-all duration-300 inline-block overflow-hidden whitespace-nowrap align-middle",
              showGeneralInfo
                ? "max-w-[200px] opacity-100"
                : "max-w-0 opacity-0",
            )}
          >
            {t("Thông tin quản lý")}
          </span>
        }
        titleExtra={
          <button
            type="button"
            onClick={() => setShowGeneralInfo(!showGeneralInfo)}
            className="p-1 -mr-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            title={showGeneralInfo ? t("Thu gọn") : t("Mở rộng")}
          >
            {showGeneralInfo ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        }
      >
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out",
            showGeneralInfo ? "opacity-100" : "opacity-0",
          )}
          style={{ gridTemplateRows: showGeneralInfo ? "1fr" : "0fr" }}
        >
          <div
            className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)] space-y-4 p-4 md:p-6"
            style={{ scrollbarWidth: "none" }}
          >
            <DrawerField label={t("Reference No")}>
              <input
                value={form.referenceNo}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, referenceNo: e.target.value }))
                }
                disabled={saving || isConfirmed || isCompleted || viewOnly}
                className={inputCls}
                placeholder={t("Tự động nếu để trống")}
              />
            </DrawerField>

            <DrawerField label={t("Warehouse Code")}>
              <input
                value={form.warehouseCode}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, warehouseCode: e.target.value }))
                }
                disabled={saving || isConfirmed || isCompleted || viewOnly}
                className={inputCls}
                placeholder="Ví dụ: WH-01"
              />
            </DrawerField>

            <DrawerField label={t("Ngày bắt đầu (kế hoạch)")}>
              <DatePicker
                className={inputCls}
                value={form.plannedStartDate}
                onChange={(v) =>
                  setForm((p: any) => ({ ...p, plannedStartDate: v }))
                }
                disabled={saving || isConfirmed || isCompleted || viewOnly}
              />
            </DrawerField>

            <DrawerField label={t("Ngày hoàn thành (kế hoạch)")}>
              <DatePicker
                className={inputCls}
                value={form.plannedEndDate}
                onChange={(v) =>
                  setForm((p: any) => ({ ...p, plannedEndDate: v }))
                }
                disabled={saving || isConfirmed || isCompleted || viewOnly}
              />
            </DrawerField>

            {editing && (isConfirmed || isCompleted) && (
              <div className="pt-4 border-t border-border space-y-2 mt-4">
                <button
                  onClick={onIssueMaterial}
                  className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
                >
                  <span>{t("Xuất kho nguyên vật liệu")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onReceiveFinishedGood}
                  className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                >
                  <span>{t("Nhập kho thành phẩm")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </DrawerSection>
    </div>
  );

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      title={
        viewOnly
          ? t("Chi tiết Lệnh Sản Xuất")
          : editing
            ? t("Cập nhật Lệnh Sản Xuất")
            : t("Tạo mới Lệnh Sản Xuất")
      }
      subtitle={
        editing
          ? `${t("Mã")}: ${editing.referenceNo || editing.id}`
          : t("Nhập thông tin lệnh")
      }
      actions={actions}
      loading={loading}
      error={error}
      leftPanel={loading ? <Skeleton className="h-40" /> : leftPanel}
      rightPanel={loading ? <Skeleton className="h-40" /> : rightPanel}
      titleExtra={
        editing?.status && (
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
              editing.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : editing.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : editing.status === "CANCELLED"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {editing.status}
          </span>
        )
      }
    />
  );
}
