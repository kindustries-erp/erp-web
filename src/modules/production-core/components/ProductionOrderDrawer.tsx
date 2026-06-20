import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
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
import { DatePicker } from "@/shared/components/DatePicker";
import { ChevronRight, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";

import type { UseProductionOrderDrawerReturn } from "../hooks/useProductionOrderDrawer";
import type { BomLikeLine } from "../hooks/useProductionOrderDrawer";

export interface ProductionOrderDrawerProps {
  open: boolean;
  loading?: boolean;
  editing: ErpProductionOrder | null;
  viewOnly?: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
  onToggleEdit?: () => void;
  drawerState: UseProductionOrderDrawerReturn;
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

export function ProductionOrderDrawer({
  open,
  loading,
  editing,
  viewOnly,
  onClose,
  onToggleEdit,
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
    issueDrawer,
    handleStartProduction,
    handleCompleteProduction,
    startQty,
    setStartQty,
    completeQty,
    setCompleteQty,
    completeUnitCost,
    setCompleteUnitCost,
    showStartDialog,
    setShowStartDialog,
    showCompleteDialog,
    setShowCompleteDialog,
    showGeneralInfo,
    setShowGeneralInfo,
    bomLines,
    balances,
    localSearch,
    setLocalSearch,
    handleConfirmOrder,
    alternativeItems,
    setAlternativeItem,
    clearAlternativeItem,
    altItemOptions,
    setAltItemSearch,
    fetchNextAltItems,
    loadingAltItems,
  } = drawerState;

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  const isConfirmed =
    editing?.status === "CONFIRMED" || editing?.status === "IN_PROGRESS";
  const isCompleted = editing?.status === "COMPLETED";

  const isDraft = editing?.status === "DRAFT";

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
        ...(!editing || isDraft
          ? [
              {
                label: t("Lưu Nháp"),
                onClick: () => handleSubmit("DRAFT"),
                variant: "secondary" as const,
                disabled: saving,
                loading: saving,
              },
            ]
          : []),
        ...(isDraft
          ? [
              {
                label: t("Xác nhận lệnh"),
                primary: true,
                loading: saving,
                disabled: saving,
                onClick: handleConfirmOrder,
              },
            ]
          : [
              {
                label: editing ? t("Lưu thay đổi") : t("Tạo Lệnh Sản Xuất"),
                primary: true,
                loading: saving,
                disabled: saving || isConfirmed || isCompleted,
                onClick: () => handleSubmit("CONFIRMED"),
              },
            ]),
      ];

  const filteredBomLines = bomLines?.filter((line: BomLikeLine) => {
    const s = localSearch.toLowerCase();
    const name = (line.itemName || "").toLowerCase();
    const sku = (line.itemId || "").toLowerCase();
    return name.includes(s) || sku.includes(s);
  });

  const leftPanel = (
    <div className="flex h-full flex-col space-y-6">
      <DrawerSection
        title={t(`CHI TIẾT BOM (${bomLines?.length || 0})`)}
        titleExtra={
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={t("Tìm kiếm mã / tên...")}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className={cn(inputCls, "h-8 text-xs py-1 px-2 w-[200px]")}
            />
          </div>
        }
      >
        {filteredBomLines && filteredBomLines.length > 0 ? (
          <div className="w-full">
            <DocumentLineTable
              data={filteredBomLines}
              getRowKey={(line: BomLikeLine) => line.id || ""}
              viewOnly={true}
              rowClassName={(line: BomLikeLine) => {
                const requiredQty = Number(line.qtyRequired || 0);
                const displayRequired = editing
                  ? requiredQty
                  : requiredQty * Number(form.qtyToProduce || 1);

                const effectiveItemId =
                  alternativeItems[line.originalItemId ?? line.itemId ?? ""] ||
                  line.itemId ||
                  "";
                const availableQty = (
                  balances[effectiveItemId] || { availableQty: 0 }
                ).availableQty;

                const isLacking = displayRequired > availableQty;
                return (!editing || isDraft) && isLacking ? "bg-red-50" : "";
              }}
              columns={[
                {
                  key: "itemCode",
                  header: t("Mã Linh Kiện"),
                  cell: (line: BomLikeLine) => (
                    <span className="font-medium">
                      {line.itemCode || line.itemId || "—"}
                    </span>
                  ),
                },
                {
                  key: "itemName",
                  header: t("Tên Linh Kiện"),
                  cell: (line: BomLikeLine) => line.itemName || "—",
                },
                {
                  key: "altItemCode",
                  header: t("Mã LK thay thế"),
                  cell: (line: BomLikeLine) => {
                    const originalItemId =
                      line.originalItemId ?? line.itemId ?? "";
                    const selectedAltItemId =
                      alternativeItems[originalItemId] ?? "";
                    const altOption = altItemOptions.find(
                      (o) => o.value === selectedAltItemId,
                    );
                    const label =
                      altOption?.label || line.alternativeItemName || "";
                    const code = label.includes(" — ")
                      ? label.split(" — ")[0]
                      : line.alternativeItemCode || "—";
                    return (
                      <span className="font-medium text-blue-700">
                        {selectedAltItemId ? code : "—"}
                      </span>
                    );
                  },
                },
                {
                  key: "altItem",
                  header: t("NVL thay thế"),
                  cell: (line: BomLikeLine) => {
                    const originalItemId =
                      line.originalItemId ?? line.itemId ?? "";
                    const selectedAltItemId =
                      alternativeItems[originalItemId] ?? "";
                    const effectiveItemId =
                      selectedAltItemId || line.itemId || "";
                    const baseBalance = balances[line.itemId ?? ""] || {
                      availableQty: 0,
                    };
                    const effectiveBalance = balances[effectiveItemId] || {
                      availableQty: 0,
                    };
                    const altOption = altItemOptions.find(
                      (o) => o.value === selectedAltItemId,
                    );

                    return (
                      <div className="space-y-2 min-w-[250px]">
                        <Combobox
                          value={selectedAltItemId}
                          onChange={(value) => {
                            if (!value) {
                              clearAlternativeItem(originalItemId);
                              return;
                            }
                            setAlternativeItem(originalItemId, value);
                          }}
                          options={altItemOptions}
                          placeholder={t("Chọn NVL thay thế")}
                          searchPlaceholder={t("Tìm SKU / tên NVL")}
                          onSearch={setAltItemSearch}
                          onScrollBottom={fetchNextAltItems}
                          loading={loadingAltItems}
                          disabled={
                            saving || viewOnly || isCompleted || isConfirmed
                          }
                        />
                        {selectedAltItemId ? (
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 font-medium text-blue-800">
                              {t("Đang thay thế")}:{" "}
                              {altOption?.label ||
                                line.alternativeItemName ||
                                selectedAltItemId}
                            </span>
                            <span className="text-muted-foreground">
                              {t("Tồn gốc")}:{" "}
                              {fmtQty(String(baseBalance.availableQty ?? 0))}
                            </span>
                            <span className="text-muted-foreground">
                              {t("Tồn thay thế")}:{" "}
                              {fmtQty(
                                String(effectiveBalance.availableQty ?? 0),
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground">
                            {editing && isDraft
                              ? t(
                                  "Có thể chọn NVL thay thế trước khi xác nhận.",
                                )
                              : t("Tùy chọn cho mọi dòng BOM.")}
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "required",
                  header: t("Cần Dùng"),
                  align: "right",
                  cell: (line: BomLikeLine) => {
                    const requiredQty = Number(line.qtyRequired || 0);
                    const displayRequired = editing
                      ? requiredQty
                      : requiredQty * Number(form.qtyToProduce || 1);
                    return (
                      <span className="text-amber-700 font-semibold">
                        {fmtQty(displayRequired.toString())}
                      </span>
                    );
                  },
                },
                {
                  key: "available",
                  header: t("Khả Dụng"),
                  align: "right",
                  cell: (line: BomLikeLine) => {
                    const requiredQty = Number(line.qtyRequired || 0);
                    const displayRequired = editing
                      ? requiredQty
                      : requiredQty * Number(form.qtyToProduce || 1);
                    const effectiveItemId =
                      alternativeItems[
                        line.originalItemId ?? line.itemId ?? ""
                      ] ||
                      line.itemId ||
                      "";
                    const availableQty = (
                      balances[effectiveItemId] || { availableQty: 0 }
                    ).availableQty;
                    const isLacking = displayRequired > availableQty;
                    return (
                      <span
                        className={cn(
                          "font-semibold",
                          isLacking ? "text-red-600" : "text-emerald-700",
                        )}
                      >
                        {fmtQty(availableQty.toString())}
                      </span>
                    );
                  },
                },
                {
                  key: "issued",
                  header: t("Đã Xuất"),
                  align: "right",
                  cell: (line: BomLikeLine) => (
                    <span className="text-muted-foreground">
                      {fmtQty(line.qtyIssued || "0")}
                    </span>
                  ),
                },
                {
                  key: "uom",
                  header: t("ĐVT"),
                  cell: (line: BomLikeLine) => (
                    <span className="text-muted-foreground">
                      {line.uom || "—"}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic px-2 py-4">
            {t("Không có dữ liệu BOM hoặc chưa chọn thành phẩm")}
          </div>
        )}
      </DrawerSection>
    </div>
  );

  const rightPanel = (
    <div
      className={cn(
        "shrink-0 space-y-4 transition-all duration-300 xl:sticky xl:top-0",
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
            className="overflow-x-hidden overflow-y-auto w-full xl:max-h-[calc(100vh-190px)] space-y-4"
            style={{ scrollbarWidth: "none" }}
          >
            <DrawerField label={t("Thành phẩm")} required>
              <Combobox
                value={form.finishedGoodItemId}
                onChange={(v) =>
                  setForm((p) => ({ ...p, finishedGoodItemId: v }))
                }
                options={itemOptions}
                placeholder={t("Chọn thành phẩm")}
                searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
                disabled={
                  saving || isConfirmed || isCompleted || viewOnly || !!editing
                }
              />
            </DrawerField>

            <DrawerField label={t("Số lượng kế hoạch")} required>
              <input
                type="number"
                min="0.001"
                step="any"
                value={form.qtyToProduce}
                onChange={(e) =>
                  setForm((p) => ({ ...p, qtyToProduce: e.target.value }))
                }
                disabled={saving || isConfirmed || isCompleted || viewOnly}
                className={inputCls}
                placeholder="1"
              />
            </DrawerField>

            {editing && (
              <DrawerField label={t("Số lượng đã sản xuất")}>
                <div className="text-sm font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-md px-3 py-2">
                  {fmtQty(editing.qtyProduced)} / {fmtQty(editing.qtyToProduce)}
                </div>
              </DrawerField>
            )}

            <div className="border-t border-border pt-4 mt-2 mb-2"></div>

            <DrawerField label={t("Reference No")}>
              <input
                value={form.referenceNo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, referenceNo: e.target.value }))
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
                  setForm((p) => ({ ...p, warehouseCode: e.target.value }))
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
                  setForm((p) => ({ ...p, plannedStartDate: v }))
                }
                disabled={saving || isConfirmed || isCompleted || viewOnly}
              />
            </DrawerField>

            <DrawerField label={t("Ngày hoàn thành (kế hoạch)")}>
              <DatePicker
                className={inputCls}
                value={form.plannedEndDate}
                onChange={(v) => setForm((p) => ({ ...p, plannedEndDate: v }))}
                disabled={saving || isConfirmed || isCompleted || viewOnly}
              />
            </DrawerField>

            {editing && (isConfirmed || isCompleted) && (
              <div className="pt-4 border-t border-border space-y-2 mt-4">
                {/* ── Sản xuất button (CONFIRMED / IN_PROGRESS only) ── */}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      setStartQty(editing.qtyToProduce ?? "1");
                      setShowStartDialog(true);
                    }}
                    disabled={saving || viewOnly}
                    className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
                  >
                    <span>{t("Sản xuất")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {/* ── Start dialog ── */}
                {showStartDialog && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-900">
                      {t("Nhập số lượng cần sản xuất")}
                    </p>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={startQty}
                      onChange={(e) => setStartQty(e.target.value)}
                      className={cn(inputCls, "w-full")}
                      placeholder="Số lượng"
                      disabled={saving}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartProduction}
                        disabled={
                          saving ||
                          !Number(startQty) ||
                          Number(startQty) <= 0 ||
                          Number(startQty) > Number(editing.qtyToProduce ?? 0)
                        }
                        className="flex-1 rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                      >
                        {saving ? t("Đang xử lý...") : t("Xác nhận")}
                      </button>
                      <button
                        onClick={() => setShowStartDialog(false)}
                        disabled={saving}
                        className="flex-1 rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                      >
                        {t("Huỷ")}
                      </button>
                    </div>
                  </div>
                )}
                {/* ── Hoàn thành button (IN_PROGRESS only) ── */}
                {editing.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => {
                      const remaining =
                        Number(editing.qtyToProduce ?? 0) -
                        Number(editing.qtyProduced ?? 0);
                      setCompleteQty(
                        remaining > 0 ? remaining.toFixed(3) : "1",
                      );
                      setCompleteUnitCost("0");
                      setShowCompleteDialog(true);
                    }}
                    disabled={saving || viewOnly}
                    className="flex w-full items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <span>{t("Hoàn thành")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                {/* ── Complete dialog ── */}
                {showCompleteDialog && (
                  <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-emerald-900">
                      {t("Nhập số lượng thành phẩm hoàn thành")}
                    </p>
                    <input
                      type="number"
                      min="0.001"
                      step="any"
                      value={completeQty}
                      onChange={(e) => setCompleteQty(e.target.value)}
                      className={cn(inputCls, "w-full")}
                      placeholder="Số lượng hoàn thành"
                      disabled={saving}
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={completeUnitCost}
                      onChange={(e) => setCompleteUnitCost(e.target.value)}
                      className={cn(inputCls, "w-full")}
                      placeholder="Đơn giá nhập kho (0 nếu bỏ qua)"
                      disabled={saving}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCompleteProduction}
                        disabled={
                          saving ||
                          !Number(completeQty) ||
                          Number(completeQty) <= 0 ||
                          Number(completeQty) >
                            Number(editing.qtyToProduce ?? 0) -
                              Number(editing.qtyProduced ?? 0)
                        }
                        className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {saving ? t("Đang xử lý...") : t("Xác nhận")}
                      </button>
                      <button
                        onClick={() => setShowCompleteDialog(false)}
                        disabled={saving}
                        className="flex-1 rounded-md border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {t("Huỷ")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DrawerSection>
    </div>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        onClose={onClose}
        onToggleEdit={onToggleEdit}
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
      <GiFormDrawer drawer={issueDrawer} />
    </>
  );
}
