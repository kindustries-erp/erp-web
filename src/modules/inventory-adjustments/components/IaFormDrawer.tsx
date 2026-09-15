/**
 * IaFormDrawer — Inventory Adjustment form drawer adapter.
 * Builds type-specific config from useIaDrawer() and delegates rendering
 * to the unified InventoryVoucherFormDrawer shell.
 *
 * Changes vs previous implementation:
 * - STT: uses {idx} (1-based from core) instead of {i + 1}
 * - Combobox moved to "item_code" column (Mã linh kiện) — was incorrectly in "itemName"
 * - Filter: migrated from SearchInput/detailSearch to useTableColumnState (cascading)
 * - All headers use TableColumnHeaderFilter with align="center"
 * - Ghi chú in separate DrawerSection below Thông tin chung
 */
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/shared/utils";
import {
  moduleConfigApi,
  resolveOptionLabel,
} from "@/core/api/moduleConfigApi";
import { useAppStore } from "@/core/config/appStore";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { CellInput } from "@/shared/components/CellInput";
import { CellTextarea } from "@/shared/components/CellTextarea";
import { DrawerField, inputCls } from "@/shared/components/DrawerModal";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DatePicker } from "@/shared/components/DatePicker";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { useUIStore } from "@/core/config/uiStore";
import { ImportExcelModal } from "@/shared/components/ImportExcelModal";
import {
  downloadInventoryTemplate,
  parseExcelFile,
} from "@/shared/utils/excelUtils";
import { basicMastersApi } from "@/modules/basic-masters/api/basicMastersApi";
import { useT } from "@/core/i18n";
import toast from "react-hot-toast";
import { IaFormSectionTitleExtra } from "./IaFormSectionTitleExtra";
import type { UseIaDrawerReturn } from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { InventoryVoucherFormDrawer } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherFormDrawer";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/ModuleEntityCustomFieldsSection";
import { AttributeTypeBadge } from "@/shared/components/AttributeTypeBadge";
import { EntityTagSelector } from "@/modules/tags/components/EntityTagSelector";

function fmtQty(value?: string | number | null) {
  if (!value && value !== 0) return "0";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value ?? "0");
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(n);
}

interface IaFormDrawerProps {
  drawer: UseIaDrawerReturn;
}

export function IaFormDrawer({ drawer }: IaFormDrawerProps) {
  const t = useT();
  const {
    open,
    loading,
    editing,
    viewOnly,
    form,
    setForm,
    saveError,
    saving,
    itemsDict,
    itemOptions,
    setItemSearch,
    fetchNextItems,
    loadingItems,
    close,
    handleSave,
    setViewOnly,
  } = drawer;

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.UPDATE,
  );

  const [isImportOpen, setIsImportOpen] = useState(false);

  // ── Client-side filter / sort / pagination ───────────────────────────────

  const {
    listHook,
    processedLines,
    paginatedLines,
    page,
    pageSize,
    total,
    totalPages,
    setPage,
    setPageSize,
    buildFilterOptions,
  } = useVoucherClientFilter({
    tableId: "ia-details-table",
    lines: form.lines,
    isOpen: open,
    getCode: (line: any) =>
      line.itemCode ||
      (line.itemId && itemsDict[line.itemId]
        ? itemsDict[line.itemId].sku
        : "") ||
      "",
    getName: (line: any) => {
      const rawName =
        line.itemName ||
        (line.itemId && itemsDict[line.itemId]
          ? itemsDict[line.itemId].itemName
          : "") ||
        "";
      const nameParts = rawName.split(" — ");
      return nameParts && nameParts.length > 1 ? nameParts[1] : rawName;
    },
    customExtractors: {
      itemCode: (line: any) =>
        line.itemCode ||
        (line.itemId && itemsDict[line.itemId]
          ? itemsDict[line.itemId].sku
          : "") ||
        "",
      itemName: (line: any) => {
        const rawName =
          line.itemName ||
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].itemName
            : "") ||
          "";
        const nameParts = rawName.split(" — ");
        return nameParts && nameParts.length > 1 ? nameParts[1] : rawName;
      },
      qtyAdjusted: (line: any) => line.qtyAdjusted,
      unitCost: (line: any) => line.unitCost,
    },
    customSort: (a: any, b: any, field: string, isDesc: boolean) => {
      if (field === "qtyAdjusted") {
        const numA = Number(a.qtyAdjusted ?? 0);
        const numB = Number(b.qtyAdjusted ?? 0);
        return isDesc ? numB - numA : numA - numB;
      }
      if (field === "unitCost") {
        const numA = Number(a.unitCost ?? 0);
        const numB = Number(b.unitCost ?? 0);
        return isDesc ? numB - numA : numA - numB;
      }
      return null;
    },
  });

  // ── Totals ─────────────────────────────────────────────────────────────────

  const filteredTotalAmount = useMemo(
    () =>
      processedLines.reduce(
        (sum, line) =>
          sum + Number(line.qtyAdjusted) * Number(line.unitCost || 0),
        0,
      ),
    [processedLines],
  );

  // ── Column header helper ───────────────────────────────────────────────────

  const makeFilterHeader = (
    key: string,
    title: string,
    opts?: { hideFilter?: boolean },
  ) => (
    <TableColumnHeaderFilter
      title={title}
      sortState={
        listHook.sorts.includes(key)
          ? "asc"
          : listHook.sorts.includes(`-${key}`)
            ? "desc"
            : "none"
      }
      onSortChange={(state) => listHook.setSort(key, state)}
      searchValue={listHook.columnSearch[key] || ""}
      onSearchChange={(val) => listHook.setColumnSearch(key, val)}
      selectedFilters={listHook.columnFilters[key] || []}
      onFilterChange={(vals) => listHook.setColumnFilter(key, vals)}
      align="center"
      columnKey={key}
      queryKeyPrefix={`ia-${key}`}
      allFilters={listHook.columnFilters}
      hideFilter={opts?.hideFilter}
      fetchOptions={
        opts?.hideFilter
          ? undefined
          : buildFilterOptions(key as any, form.lines)
      }
    />
  );

  // ── Table columns ──────────────────────────────────────────────────────────

  const tableColumns = [
    {
      key: "index",
      header: <span className="w-full block text-center">#</span>,
      size: 40,
      enableResizing: false,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      cell: (_: any, idx: number) => (
        <span className="w-full block text-center text-muted-foreground">
          {idx}
        </span>
      ),
    },
    {
      // ✅ Combobox moved HERE (Mã linh kiện) — was incorrectly in itemName column
      key: "item_code",
      header: makeFilterHeader("itemCode", t("Mã linh kiện")),
      minSize: 200,
      enableResizing: true,
      headerClassName: "w-[200px] min-w-[200px]",
      className: "w-[200px] min-w-[200px] p-0 align-middle",
      cell: (line: any) => {
        if (viewOnly || editing?.status === "POSTED") {
          const itemCode =
            line.itemCode ||
            (line.itemId && itemsDict[line.itemId]
              ? itemsDict[line.itemId].sku
              : "—");
          return (
            <span className="font-medium text-foreground px-3">{itemCode}</span>
          );
        }
        return (
          <Combobox
            variant="spreadsheet"
            options={itemOptions}
            value={line.itemId}
            fallbackLabel={
              line.itemCode ||
              (line.itemId && itemsDict[line.itemId]
                ? itemsDict[line.itemId].sku
                : undefined)
            }
            disabled={viewOnly || editing?.status === "POSTED"}
            placeholder={t("Chọn linh kiện từ danh mục")}
            searchPlaceholder={t("Tìm mã / tên linh kiện")}
            onSearch={setItemSearch}
            onScrollBottom={fetchNextItems}
            loading={loadingItems}
            onChange={(v) => {
              const found = itemOptions.find((o) => o.value === v) as any;
              setForm((f) => {
                const lines = [...f.lines];
                const actualIndex = form.lines.findIndex((fl) => fl === line);
                if (actualIndex > -1) {
                  lines[actualIndex] = {
                    ...lines[actualIndex],
                    itemId: v || "",
                    itemCode: found?.label || "",
                    itemName: found?._itemName ?? found?.label ?? "",
                  };
                }
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
    {
      // ✅ itemName is now always read-only — shows resolved name after Combobox selection
      key: "itemName",
      header: makeFilterHeader("itemName", t("Tên linh kiện")),
      minSize: 260,
      enableResizing: true,
      headerClassName: "w-[260px] min-w-[260px]",
      className: "w-[260px] min-w-[260px]",
      cell: (line: any) => {
        const rawName =
          line.itemName ||
          (line.itemId && itemsDict[line.itemId]
            ? itemsDict[line.itemId].itemName
            : "") ||
          "—";
        const nameParts = rawName.split(" — ");
        const name = nameParts && nameParts.length > 1 ? nameParts[1] : rawName;
        return (
          <div
            className={cn(
              "font-medium truncate max-w-[260px]",
              "text-foreground",
            )}
            title={name}
          >
            {name}
          </div>
        );
      },
    },
    {
      key: "qtyAdjusted",
      header: makeFilterHeader("qtyAdjusted", t("SL Điều chỉnh")),
      minSize: 140,
      enableResizing: true,
      headerClassName: "text-center w-[140px] min-w-[140px]",
      className: "text-center w-[140px] min-w-[140px] p-0 align-middle",
      cell: (line: any) => {
        if (viewOnly || editing?.status === "POSTED") {
          const val = Number(line.qtyAdjusted);
          return (
            <div
              className={cn(
                "font-medium",
                val > 0 ? "text-emerald-600" : val < 0 ? "text-red-600" : "",
              )}
            >
              {val > 0 ? "+" : ""}
              {fmtQty(val)}
            </div>
          );
        }
        return (
          <CellInput
            type="number"
            className={cn(
              "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all",
            )}
            placeholder={t("SL thực")}
            value={line.qtyAdjusted ?? ""}
            disabled={viewOnly || editing?.status === "POSTED"}
            onValueChange={(v) => {
              setForm((f) => {
                const lines = [...f.lines];
                const actualIndex = form.lines.findIndex((fl) => fl === line);
                if (actualIndex > -1) {
                  lines[actualIndex] = {
                    ...lines[actualIndex],
                    qtyAdjusted: v,
                  };
                }
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
    {
      key: "unitCost",
      header: makeFilterHeader("unitCost", t("Đơn giá")),
      minSize: 140,
      enableResizing: true,
      headerClassName: "text-center w-[140px] min-w-[140px]",
      className: "text-center w-[140px] min-w-[140px] p-0 align-middle",
      cell: (line: any) => {
        if (viewOnly || editing?.status === "POSTED") {
          return <div className="font-medium">{fmtQty(line.unitCost)}</div>;
        }
        return (
          <CellInput
            type="number"
            min={0}
            className={cn(
              "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all",
            )}
            placeholder={t("Đơn giá")}
            value={line.unitCost ?? ""}
            disabled={viewOnly || editing?.status === "POSTED"}
            onValueChange={(v) => {
              setForm((f) => {
                const lines = [...f.lines];
                const actualIndex = form.lines.findIndex((fl) => fl === line);
                if (actualIndex > -1) {
                  lines[actualIndex] = { ...lines[actualIndex], unitCost: v };
                }
                return { ...f, lines };
              });
            }}
          />
        );
      },
    },
    {
      key: "amount",
      header: makeFilterHeader("amount", t("Thành tiền"), { hideFilter: true }),
      minSize: 140,
      enableResizing: true,
      headerClassName: "text-center w-[140px] min-w-[140px]",
      className: "text-center w-[140px] min-w-[140px]",
      cell: (line: any) => {
        const amount =
          Number(line.qtyAdjusted || 0) * Number(line.unitCost || 0);
        return (
          <div className="font-medium text-foreground tabular-nums">
            {amount.toLocaleString("vi-VN")}
          </div>
        );
      },
    },
  ];

  // ── Summary row ────────────────────────────────────────────────────────────

  const summaryRow = {
    itemName: (
      <div className="text-right w-full font-semibold">{t("Tổng")}:</div>
    ),
    qtyAdjusted: (
      <div className="text-center font-semibold">
        {fmtQty(
          processedLines
            .reduce((sum, l) => sum + Number(l.qtyAdjusted || 0), 0)
            .toString(),
        )}
      </div>
    ),
    amount: (
      <div className="text-center font-semibold text-emerald-600">
        {Number(filteredTotalAmount).toLocaleString("vi-VN")}
      </div>
    ),
  };

  // ── Actions column (delete) ────────────────────────────────────────────────

  const actionsColumn =
    !viewOnly && editing?.status !== "POSTED"
      ? {
          header: "" as any,
          cell: (item: any) => (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500"
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  lines: f.lines.filter((l) => l !== item),
                }));
              }}
            >
              ✕
            </Button>
          ),
        }
      : undefined;

  // ── Table footer ───────────────────────────────────────────────────────────

  const tableFooter = undefined;

  // ── Actions ────────────────────────────────────────────────────────────────

  const actions =
    viewOnly || loading
      ? [
          {
            label: t("Đóng"),
            onClick: close,
            variant: "outline" as const,
            disabled: loading,
          },
        ]
      : [
          {
            label: t("Hủy"),
            onClick: close,
            variant: "outline" as const,
            disabled: saving,
          },
          {
            label: t("Lưu nháp"),
            onClick: () => void handleSave("DRAFT"),
            variant: "secondary" as const,
            loading: saving,
            disabled: saving,
          },
          {
            label: editing ? t("Cập nhật") : t("Tạo mới"),
            onClick: () => void handleSave("POSTED"),
            primary: true,
            loading: saving,
            disabled: saving,
          },
        ];

  // ── Status badge ───────────────────────────────────────────────────────────

  const statusBadge =
    editing?.status === "DRAFT" ? (
      <span className="inline-flex rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
        {t("Nháp")}
      </span>
    ) : editing?.status === "POSTED" ? (
      <span className="inline-flex rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
        {t("Đã vào sổ")}
      </span>
    ) : editing?.status === "CANCELLED" ? (
      <span className="inline-flex rounded-md bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800">
        {t("Đã hủy")}
      </span>
    ) : undefined;

  // ── Right panel content (Thông tin chung) ─────────────────────────────────

  const locale = useAppStore((s) => s.locale);

  // Lấy danh sách thuộc tính động cho INVENTORY_ADJUSTMENT để nạp options cho Lý do điều chỉnh (code: category)
  const { data: iaAttrDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", "INVENTORY_ADJUSTMENT"],
    queryFn: () =>
      moduleConfigApi.getGlobalAttributeDefs("INVENTORY_ADJUSTMENT"),
    staleTime: 60000,
  });

  const adjustmentReasonOptions = useMemo(() => {
    const reasonDef = Array.isArray(iaAttrDefs)
      ? iaAttrDefs.find((d) => d?.code === "category" && !d?.isDeleted)
      : undefined;
    if (reasonDef?.options && reasonDef.options.length > 0) {
      return reasonDef.options.map((opt) => ({
        value: opt.value,
        label: resolveOptionLabel(opt, locale, t),
        code: opt.value,
      }));
    }
    return [
      { value: "PERIODIC", label: t("Kiểm kê định kỳ"), code: "PERIODIC" },
      {
        value: "DAMAGED",
        label: t("Hàng hỏng hóc / Hao hụt"),
        code: "DAMAGED",
      },
      {
        value: "COUNT_ERROR",
        label: t("Sai lệch kiểm đếm"),
        code: "COUNT_ERROR",
      },
      {
        value: "RECLASSIFY",
        label: t("Phân loại quy cách"),
        code: "RECLASSIFY",
      },
      { value: "OTHER", label: t("Lý do khác"), code: "OTHER" },
    ];
  }, [iaAttrDefs, locale, t]);

  const currentReasonVal = form.globalAttributes?.category || "";

  const currentReasonLabel = useMemo(() => {
    const opt = adjustmentReasonOptions.find(
      (o) => o.value === currentReasonVal,
    );
    return opt?.label || currentReasonVal || "—";
  }, [adjustmentReasonOptions, currentReasonVal]);

  // ── Thống kê tóm tắt biến động kiểm kê ──────────────────────────────
  const { totalPositiveQty, totalNegativeQty } = useMemo(() => {
    let pos = 0;
    let neg = 0;
    for (const line of form.lines) {
      const q = Number(line.qtyAdjusted || 0);
      if (q > 0) pos += q;
      else if (q < 0) neg += Math.abs(q);
    }
    return { totalPositiveQty: pos, totalNegativeQty: neg };
  }, [form.lines]);

  // ── Right panel content (1. THÔNG TIN CHUNG) ───────────────────────────────

  const rightPanelContent = (
    <>
      <DrawerField label={t("Số phiếu")}>
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent font-mono">
            {form.adjustmentNo || "—"}
          </div>
        ) : (
          <input
            className={inputCls}
            placeholder={t("Tự động nếu để trống")}
            value={form.adjustmentNo}
            disabled={editing?.status === "POSTED"}
            onChange={(e) =>
              setForm((f) => ({ ...f, adjustmentNo: e.target.value }))
            }
          />
        )}
      </DrawerField>

      <DrawerField label={t("Ngày điều chỉnh")}>
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
            {form.adjustmentDate ? form.adjustmentDate.slice(0, 10) : "—"}
          </div>
        ) : (
          <DatePicker
            value={form.adjustmentDate ? form.adjustmentDate.slice(0, 10) : ""}
            disabled={editing?.status === "POSTED"}
            onChange={(v) => setForm((f) => ({ ...f, adjustmentDate: v }))}
          />
        )}
      </DrawerField>

      <DrawerField label={t("Người kiểm kê / Lập phiếu")}>
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
            {form.globalAttributes?.adjusted_by ||
              form.globalAttributes?.auditor ||
              "—"}
          </div>
        ) : (
          <input
            className={inputCls}
            placeholder={t("Họ tên người kiểm kê hoặc phụ trách...")}
            value={
              form.globalAttributes?.adjusted_by ||
              form.globalAttributes?.auditor ||
              ""
            }
            disabled={editing?.status === "POSTED"}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                globalAttributes: {
                  ...f.globalAttributes,
                  adjusted_by: e.target.value,
                  auditor: e.target.value,
                },
              }))
            }
          />
        )}
      </DrawerField>
    </>
  );

  const tagsSlot = (
    <>
      {/* Thẻ nhãn (Tags) */}
      <div className="pt-1">
        <div className="text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          {t("tags", "Thẻ nhãn")}
        </div>
        {editing?.id ? (
          <EntityTagSelector
            entityType="erp_inventory_adjustment"
            entityId={editing.id}
            readOnly={viewOnly}
          />
        ) : !viewOnly ? (
          <EntityTagSelector
            entityType="erp_inventory_adjustment"
            entityId="__pending__"
            readOnly={false}
            pendingMode
          />
        ) : null}
      </div>

      {/* Summary Cards khi ở chế độ View hoặc khi có dòng */}
      {viewOnly && form.lines.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="flex flex-col items-center justify-center p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              {t("Tổng tăng (+)")}
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base tabular-nums">
              +{fmtQty(totalPositiveQty)}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
              {t("Tổng giảm (-)")}
            </span>
            <span className="font-bold text-rose-700 dark:text-rose-300 text-base tabular-nums">
              -{fmtQty(totalNegativeQty)}
            </span>
          </div>
        </div>
      )}
    </>
  );

  // ── Default attributes slot (2. THUỘC TÍNH MẶC ĐỊNH) ───────────────────────

  const defaultAttributesSlot = (
    <div className="space-y-4">
      <DrawerField
        label={
          <span className="inline-flex items-center gap-1.5 flex-wrap">
            <span>{t("inventory.adjustmentReason", "Lý do điều chỉnh")}</span>
            <AttributeTypeBadge type="system" />
          </span>
        }
      >
        {viewOnly ? (
          <div className="font-medium text-[color:var(--foreground)] text-sm px-3 py-2 bg-gray-50 dark:bg-muted/40 rounded-lg border border-transparent">
            {currentReasonLabel}
          </div>
        ) : (
          <Combobox
            options={adjustmentReasonOptions}
            value={currentReasonVal}
            disabled={editing?.status === "POSTED"}
            placeholder={t("— Chọn —")}
            allowClear={true}
            onChange={(v) =>
              setForm((f) => ({
                ...f,
                globalAttributes: {
                  ...f.globalAttributes,
                  category: v || "",
                },
              }))
            }
          />
        )}
      </DrawerField>
    </div>
  );

  // ── Remarks content (Ghi chú section) ─────────────────────────────────────

  const remarksContent = (
    <CellTextarea
      className={`${inputCls} min-h-[60px] resize-y`}
      value={form.remarks}
      disabled={viewOnly}
      onValueChange={(val) => setForm((f) => ({ ...f, remarks: val }))}
      placeholder={t("Nhập ghi chú chung nếu có...")}
    />
  );

  // ── Section info ───────────────────────────────────────────────────────────

  const sectionTitle =
    t("Chi tiết") +
    " (" +
    (processedLines.length < form.lines.length
      ? `${processedLines.length}/${form.lines.length}`
      : form.lines.length) +
    ")";

  const sectionTitleExtra = (
    <IaFormSectionTitleExtra
      activeFilterCount={listHook.activeFilterCount}
      onResetFilters={listHook.resetFilters}
      canAddLine={!viewOnly && editing?.status !== "POSTED"}
      onAddLine={() => {
        setForm((f) => ({
          ...f,
          lines: [
            ...f.lines,
            {
              itemId: "",
              itemCode: "",
              itemName: "",
              qtyAdjusted: "",
              unitCost: "",
            },
          ],
        }));
      }}
      onOpenImport={() => setIsImportOpen(true)}
      tableId="ia-details-table"
      t={t}
    />
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <InventoryVoucherFormDrawer
      open={open}
      mode={viewOnly ? "view" : editing ? "edit" : "create"}
      noAnimation={!!drawer.unifiedContext}
      title={
        editing
          ? viewOnly
            ? t("Phiếu điều chỉnh")
            : t("Sửa điều chỉnh")
          : t("Tạo phiếu điều chỉnh")
      }
      subtitle={
        editing?.adjustmentNo ?? t("inventory.adjustment", "Điều chỉnh kho")
      }
      statusBadge={statusBadge}
      onClose={close}
      onToggleEdit={
        viewOnly &&
        editing &&
        canUpdate &&
        !["CANCELLED", "POSTED"].includes(editing.status || "DRAFT")
          ? () => setViewOnly(false)
          : undefined
      }
      actions={actions}
      loading={loading}
      error={saveError}
      unifiedContext={drawer.unifiedContext}
      // Table
      tableId="ia-details-table"
      enableColumnVisibility={true}
      sectionTitle={sectionTitle}
      sectionTitleExtra={sectionTitleExtra}
      tableItems={paginatedLines}
      getRowKey={(item) => String(form.lines.indexOf(item))}
      tableColumns={tableColumns}
      summaryRow={summaryRow}
      actionsColumn={actionsColumn}
      emptyLabel={t("Không có dữ liệu")}
      tableFooter={tableFooter}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={setPage}
      onPageSize={setPageSize}
      pageSizeOptions={[20, 50, 100, 200]}
      // Right panel
      rightPanelContent={rightPanelContent}
      defaultAttributesSlot={defaultAttributesSlot}
      remarksContent={remarksContent}
      tagsSlot={tagsSlot}
      customFieldsSlot={
        <ModuleEntityCustomFieldsSection
          moduleKey="INVENTORY_ADJUSTMENT"
          entityId={editing?.id}
          editMode={!viewOnly}
          globalAttributes={form.globalAttributes}
          onGlobalAttributesChange={(attrs) =>
            setForm((f) => ({ ...f, globalAttributes: attrs }))
          }
          includeSystemAttributes={false}
          hideCategorySection={true}
          globalTitle={t("customAttributes", "THUỘC TÍNH TÙY CHỈNH")}
          globalCollapsible={true}
          globalDefaultCollapsed={false}
        />
      }
      // No print slot for IA
      importModalSlot={
        <ImportExcelModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onDownloadTemplate={async () => {
            const headers = ["Mã linh kiện", "Số lượng điều chỉnh", "Đơn giá"];
            let refItems: any[] = [];
            try {
              const res = await basicMastersApi.list({
                entities: "inventoryItems",
                limit: 5000,
              });
              refItems = (res.items.inventoryItems || []).map((item: any) => ({
                sku: item.sku || "",
                name: item.itemName || "",
              }));
            } catch (e) {
              console.error("Failed to fetch reference items", e);
            }
            downloadInventoryTemplate(
              headers,
              "Template_DieuChinhKho.xlsx",
              refItems,
            );
          }}
          onUpload={async (file, overwrite) => {
            try {
              const data = await parseExcelFile(file);
              let skipped = 0;
              const newLines: any[] = [];
              let allItems: any[] = [];
              try {
                const res = await basicMastersApi.list({
                  entities: "inventoryItems",
                  limit: 5000,
                });
                allItems = res.items.inventoryItems || [];
              } catch (e) {
                console.error("Failed to fetch items for upload lookup", e);
              }
              const skuToId: Record<string, string> = {};
              const idToName: Record<string, string> = {};
              const idToSku: Record<string, string> = {};
              allItems.forEach((item: any) => {
                if (item.sku) {
                  skuToId[item.sku.toLowerCase()] = item.id;
                  idToName[item.id] = item.itemName;
                  idToSku[item.id] = item.sku;
                }
              });
              data.forEach((row: any) => {
                const sku = row["Mã linh kiện"]?.toString().trim();
                const qty = row["Số lượng điều chỉnh"]?.toString().trim();
                const price = row["Đơn giá"]?.toString().trim();
                if (!sku) return;
                const itemId = skuToId[sku.toLowerCase()];
                if (itemId) {
                  newLines.push({
                    itemId,
                    itemCode: idToSku[itemId] || "",
                    itemName: idToName[itemId] || "",
                    qtyAdjusted: qty || "",
                    unitCost: price || "",
                  });
                } else {
                  skipped++;
                }
              });
              if (skipped > 0) {
                toast.error(
                  `Đã bỏ qua ${skipped} dòng chứa mã linh kiện không tồn tại.`,
                );
              }
              setForm((f) => {
                const filteredOldLines = overwrite
                  ? []
                  : f.lines.filter((l: any) => l.itemId);
                return { ...f, lines: [...filteredOldLines, ...newLines] };
              });
              setIsImportOpen(false);
            } catch {
              toast.error("Lỗi khi đọc file Excel");
            }
          }}
        />
      }
    />
  );
}
