import { useMemo } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DocumentLineTable } from "@/shared/components/DocumentLineTable";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import {
  DrawerField,
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Combobox } from "@/shared/components/Combobox";
import type { ErpProductionOrder } from "@/modules/production-core/api/productionCoreApi";
import { Skeleton } from "@/shared/components/Skeleton";
import { DatePicker } from "@/shared/components/DatePicker";
import { cn } from "@/shared/utils";
import { GiFormDrawer } from "@/modules/goods-issues-core/components/GiFormDrawer";
import { ProductionRunDrawer } from "./ProductionRunDrawer";
import { Tooltip } from "@/core/components/ui/Tooltip";
import * as Popover from "@radix-ui/react-popover";
import { FilterButton } from "@/shared/components/FilterPanel";
import { SearchInput } from "@/shared/components/SearchInput";
import { Checkbox } from "@/shared/components/ui/checkbox";

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
  productionRunOpen?: boolean;
  onOpenProductionRun?: () => void;
  onCloseProductionRun?: () => void;
}

function fmtQty(value?: string | null) {
  if (!value) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

export function ProductionOrderDrawer({
  open,
  loading,
  editing,
  viewOnly,
  onClose,
  onSaved,
  onToggleEdit,
  drawerState,
  productionRunOpen = false,
  onOpenProductionRun,
  onCloseProductionRun,
}: ProductionOrderDrawerProps) {
  const t = useT();
  const {
    form,
    setForm,
    itemOptions,
    availableBoms,
    bomOptions,
    saving,
    error,
    handleSubmit,
    issueDrawer,
    bomLines,
    balances,
    localSearch,
    setLocalSearch,
    handleConfirmOrder,
    alternativeItems,
    setAlternativeItem,
    clearAlternativeItem,
    lineNotes,
    setLineNote,
    altItemOptions,
    setAltItemSearch,
    fetchNextAltItems,
    loadingAltItems,
    showLackingOnly,
    setShowLackingOnly,
    bomLoading,
  } = drawerState;

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";

  const isConfirmed =
    editing?.status === "CONFIRMED" || editing?.status === "IN_PROGRESS";
  const isCompleted = editing?.status === "COMPLETED";

  const isDraft = editing?.status === "DRAFT";

  const showProductionRunAction =
    !!editing && ["CONFIRMED", "IN_PROGRESS"].includes(editing.status || "");

  const productionRunAction = showProductionRunAction
    ? {
        label:
          editing?.status === "IN_PROGRESS"
            ? t("Tiếp tục sản xuất")
            : t("Tiến hành sản xuất"),
        onClick: () => onOpenProductionRun?.(),
        variant: "secondary" as const,
        align: "left" as const,
      }
    : null;

  const actions = viewOnly
    ? [
        ...(productionRunAction ? [productionRunAction] : []),
        {
          label: t("Đóng"),
          onClick: onClose,
          variant: "outline" as const,
        },
      ]
    : [
        ...(productionRunAction ? [productionRunAction] : []),
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
                disabled: saving,
                onClick: () => handleSubmit(editing?.status || "CONFIRMED"),
              },
            ]),
      ];

  const filteredBomLines = bomLines?.filter((line: BomLikeLine) => {
    const s = localSearch.toLowerCase();
    const name = (line.itemName || "").toLowerCase();
    const sku = (line.itemId || "").toLowerCase();
    const matchSearch = name.includes(s) || sku.includes(s);
    if (!showLackingOnly) return matchSearch;

    const requiredQty = Number(line.qtyRequired || 0);
    const effectiveItemId =
      alternativeItems[line.originalItemId ?? line.itemId ?? ""] ||
      line.itemId ||
      "";
    const availableQty = (balances[effectiveItemId] || { availableQty: 0 })
      .availableQty;
    return matchSearch && requiredQty > availableQty;
  });

  const aggregatedRequired = useMemo(() => {
    const map: Record<string, number> = {};
    bomLines?.forEach((line: BomLikeLine) => {
      const effId =
        alternativeItems[line.path || line.itemId || ""] || line.itemId || "";
      map[effId] = (map[effId] || 0) + Number(line.qtyRequired || 0);
    });
    return map;
  }, [bomLines, alternativeItems]);

  const leftPanel = (
    <div className="flex h-full flex-col space-y-6">
      <DrawerSection
        title={t("CHI TIẾT BOM") + " (" + (bomLines?.length || 0) + ")"}
        titleExtra={
          <Popover.Root>
            <Popover.Trigger asChild>
              <div>
                <FilterButton
                  onClick={() => {}}
                  activeCount={
                    (showLackingOnly ? 1 : 0) + (localSearch ? 1 : 0)
                  }
                />
              </div>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={4}
                className="z-[9999] w-64 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 shadow-xl card-shadow animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 block">
                      {t("Tìm kiếm")}
                    </label>
                    <SearchInput
                      placeholder={t("Tìm kiếm mã / tên...")}
                      value={localSearch}
                      onChange={setLocalSearch}
                      className="w-full [&>input]:h-9 [&>input]:text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 block">
                      {t("Bộ lọc khác")}
                    </label>
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={showLackingOnly}
                        onCheckedChange={(c) => setShowLackingOnly(c === true)}
                      />
                      <span className="text-foreground">
                        {t("Chỉ hiện NVL thiếu")}
                      </span>
                    </label>
                  </div>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        }
      >
        {bomLoading ? (
          <div className="pl-4 py-4 text-xs text-muted-foreground animate-pulse">
            {t("Đang tải cấu trúc NVL...")}
          </div>
        ) : filteredBomLines && filteredBomLines.length > 0 ? (
          <div className="w-full">
            <DocumentLineTable
              tableContainerClassName="max-h-[calc(100vh-350px)] overflow-y-auto"
              data={filteredBomLines}
              getRowKey={(line: BomLikeLine, idx: number) =>
                line.id ? `${line.id}-${idx}` : String(idx)
              }
              viewOnly={true}
              rowClassName={(line: BomLikeLine) => {
                if (
                  (line as Record<string, unknown>).itemTypeCode === "SERVICE"
                )
                  return "";
                const linePath = line.path || line.itemId || "";
                const effectiveItemId =
                  alternativeItems[linePath] || line.itemId || "";
                const availableQty = (
                  balances[effectiveItemId] || { availableQty: 0 }
                ).availableQty;

                const displayRequired =
                  aggregatedRequired[effectiveItemId] || 0;
                const isLacking = displayRequired > availableQty;
                return (!editing || isDraft) && isLacking ? "bg-red-50" : "";
              }}
              columns={[
                {
                  key: "itemCode",
                  header: t("Mã Linh Kiện"),
                  width: "15%",
                  minWidth: "100px",
                  fixed: "left",
                  cell: (line: BomLikeLine) => (
                    <div
                      className="truncate text-xs font-medium"
                      style={{ paddingLeft: `${(line.level || 0) * 16}px` }}
                    >
                      {(line.level || 0) > 0 && (
                        <span className="text-muted-foreground mr-1">└─</span>
                      )}
                      {line.itemCode || "—"}
                    </div>
                  ),
                },
                {
                  key: "itemName",
                  header: t("Tên Linh Kiện"),
                  width: "25%",
                  minWidth: "200px",
                  cell: (line: BomLikeLine) => (
                    <Tooltip content={line.itemName || ""}>
                      <div className="truncate max-w-[200px] xl:max-w-[300px]">
                        {line.itemName || "—"}
                      </div>
                    </Tooltip>
                  ),
                },
                {
                  key: "altItem",
                  header: t("NVL thay thế"),
                  width: "30%",
                  minWidth: "200px",
                  cell: (line: BomLikeLine) => {
                    const linePath = line.path || line.itemId || "";
                    const selectedAltItemId = alternativeItems[linePath] ?? "";
                    const altOption = altItemOptions.find(
                      (o) => o.value === selectedAltItemId,
                    );

                    const isDisabled = !!(
                      saving ||
                      viewOnly ||
                      isCompleted ||
                      isConfirmed ||
                      line.isLeaf === false
                    );

                    if (isDisabled && !selectedAltItemId) {
                      return <span className="text-muted-foreground">—</span>;
                    }

                    const displayLabel =
                      altOption?.label ||
                      line.alternativeItemName ||
                      selectedAltItemId;

                    return (
                      <div className="space-y-2 min-w-[200px]">
                        {!isDisabled && (
                          <Combobox
                            value={selectedAltItemId}
                            onChange={(value) => {
                              if (!value) {
                                clearAlternativeItem(linePath);
                                return;
                              }
                              setAlternativeItem(linePath, value);
                            }}
                            options={altItemOptions}
                            placeholder={t("Chọn NVL thay thế")}
                            searchPlaceholder={t("Tìm SKU / tên NVL")}
                            onSearch={setAltItemSearch}
                            onScrollBottom={fetchNextAltItems}
                            loading={loadingAltItems}
                            disabled={isDisabled}
                          />
                        )}
                        {selectedAltItemId ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Tooltip content={displayLabel}>
                              <span className="inline-block truncate max-w-[200px] xl:max-w-[300px] rounded-md bg-blue-50 text-blue-700 font-medium px-2 py-0.5 italic">
                                {displayLabel}
                              </span>
                            </Tooltip>
                          </div>
                        ) : null}
                      </div>
                    );
                  },
                },
                {
                  key: "required",
                  header: t("Cần Dùng"),
                  align: "right",
                  minWidth: "100px",
                  cell: (line: BomLikeLine) => {
                    const requiredQty = Number(line.qtyRequired || 0);
                    const displayRequired = requiredQty;
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
                  minWidth: "100px",
                  cell: (line: BomLikeLine) => {
                    const requiredQty = Number(line.qtyRequired || 0);
                    const displayRequired = requiredQty;
                    const linePath = line.path || line.itemId || "";
                    const effectiveItemId =
                      alternativeItems[linePath] || line.itemId || "";

                    if (line.itemTypeCode === "SERVICE") {
                      return <span className="text-muted-foreground">—</span>;
                    }

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
                  key: "note",
                  header: t("Ghi chú"),
                  cell: (line: BomLikeLine) => {
                    const linePath = line.path || line.itemId || "";
                    const isDisabled = !!(
                      saving ||
                      viewOnly ||
                      line.isLeaf === false
                    );
                    if (isDisabled && !lineNotes[linePath]) {
                      return <span className="text-muted-foreground">—</span>;
                    }
                    return (
                      <input
                        value={lineNotes[linePath] || ""}
                        onChange={(e) => setLineNote(linePath, e.target.value)}
                        disabled={isDisabled}
                        className={cn(inputCls, "min-w-[150px] text-xs h-8")}
                        placeholder={t("Nhập ghi chú")}
                      />
                    );
                  },
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
    <>
      <DrawerField label={t("Thành phẩm")} required>
        <Combobox
          value={form.finishedGoodItemId}
          onChange={(v) => setForm((p) => ({ ...p, finishedGoodItemId: v }))}
          options={itemOptions}
          placeholder={t("Chọn thành phẩm")}
          searchPlaceholder={t("Tìm SKU / tên thành phẩm")}
          disabled={
            saving || isConfirmed || isCompleted || viewOnly || !!editing
          }
        />
      </DrawerField>

      {form.finishedGoodItemId && availableBoms.length > 0 && (
        <DrawerField label={t("Phiên bản BOM")}>
          <Combobox
            value={form.bomId}
            onChange={(v) => setForm((p) => ({ ...p, bomId: v }))}
            options={bomOptions}
            placeholder={t("Chọn phiên bản BOM")}
            searchPlaceholder={t("Tìm BOM")}
            disabled={saving || isConfirmed || isCompleted || viewOnly}
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
            setForm((p) => ({ ...p, qtyToProduce: e.target.value }))
          }
          disabled={saving || isConfirmed || isCompleted || viewOnly}
          className={inputCls}
          placeholder="1"
        />
      </DrawerField>

      {editing && (
        <DrawerRow
          label={t("Đã sản xuất")}
          value={
            <span className="font-semibold text-emerald-700">
              {fmtQty(editing.qtyProduced)} / {fmtQty(editing.qtyToProduce)}
            </span>
          }
        />
      )}

      <div className="border-t border-border my-2" />

      <DrawerField label={t("Mã lệnh")}>
        <input
          value={form.referenceNo}
          onChange={(e) =>
            setForm((p) => ({ ...p, referenceNo: e.target.value }))
          }
          disabled={saving || isConfirmed || isCompleted || viewOnly}
          className={inputCls}
          placeholder={t("Tự động theo tháng (MO-YYYYMMXXXX)")}
        />
      </DrawerField>

      <DrawerField label={t("Mã kho")}>
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
          onChange={(v) => setForm((p) => ({ ...p, plannedStartDate: v }))}
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
    </>
  );

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={mode}
        collapsibleRightPanel={true}
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
        rightPanelTitle={t("Thông tin quản lý")}
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
      <ProductionRunDrawer
        open={productionRunOpen}
        order={editing}
        onClose={onCloseProductionRun ?? (() => {})}
        onRefresh={onSaved}
      />
    </>
  );
}
