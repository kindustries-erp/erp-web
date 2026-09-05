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
import { FilterButton } from "@/shared/components/FilterPanel";
import type { UseIaDrawerReturn } from "@/modules/inventory-adjustments/hooks/useIaDrawer";
import { InventoryVoucherFormDrawer } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherFormDrawer";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/ModuleEntityCustomFieldsSection";

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

  const t = useT();
  const [isImportOpen, setIsImportOpen] = useState(false);

  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);
  useEffect(() => {
    setGlobalLoading(saving);
  }, [saving, setGlobalLoading]);

  const canUpdate = useHasPermission(
    ErpResource.INVENTORY_ADJUSTMENTS,
    ErpAction.UPDATE,
  );

  // ── Client-side filter / sort ──────────────────────────────────────────────

  const { listHook, processedLines, buildFilterOptions } =
    useVoucherClientFilter({
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
        const nameParts = line.itemName?.split(" — ");
        return nameParts && nameParts.length > 1
          ? nameParts[1]
          : line.itemName || "";
      },
      customSort: (a, b, field, isDesc) => {
        if (field === "qtyAdjusted") {
          return isDesc
            ? Number(b.qtyAdjusted ?? 0) - Number(a.qtyAdjusted ?? 0)
            : Number(a.qtyAdjusted ?? 0) - Number(b.qtyAdjusted ?? 0);
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
      header: "#",
      size: 40,
      headerClassName: "text-center w-[40px] min-w-[40px]",
      className: "text-center w-[40px] min-w-[40px]",
      // ✅ Use {idx} — core DataTable is already 1-based, do NOT add +1
      cell: (_: any, idx: number) => (
        <span className="text-muted-foreground">{idx}</span>
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
        const nameParts = line.itemName?.split(" — ");
        const name =
          nameParts && nameParts.length > 1
            ? nameParts[1]
            : line.itemName || "—";
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
      header: makeFilterHeader("qtyAdjusted", t("SL Điều chỉnh"), {
        hideFilter: true,
      }),
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
      header: makeFilterHeader("unitCost", t("Đơn giá"), { hideFilter: true }),
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

  // Lấy danh sách thuộc tính động cho INVENTORY_ADJUSTMENT để nạp options cho Lý do điều chỉnh (code: type_inventory_adjustment)
  const { data: iaAttrDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", "INVENTORY_ADJUSTMENT"],
    queryFn: () =>
      moduleConfigApi.getGlobalAttributeDefs("INVENTORY_ADJUSTMENT"),
    staleTime: 60000,
  });

  const adjustmentReasonOptions = useMemo(() => {
    const reasonDef = Array.isArray(iaAttrDefs)
      ? iaAttrDefs.find(
          (d) =>
            (d?.code === "type_inventory_adjustment" ||
              d?.code === "adjustment_reason" ||
              d?.code === "reason") &&
            !d?.isDeleted,
        )
      : undefined;
    if (reasonDef?.options && reasonDef.options.length > 0) {
      return reasonDef.options.map((opt) => ({
        value: opt.value,
        label: resolveOptionLabel(opt, locale, t),
      }));
    }
    return [
      { value: "PERIODIC", label: t("Kiểm kê định kỳ") },
      { value: "DAMAGED", label: t("Hàng hỏng hóc / hao hụt") },
      { value: "COUNT_ERROR", label: t("Sai lệch kiểm đếm") },
      { value: "RECLASSIFY", label: t("Phân loại quy cách") },
      { value: "OTHER", label: t("Lý do khác") },
    ];
  }, [iaAttrDefs, locale, t]);

  const rightPanelContent = (
    <>
      <DrawerField label={t("Số phiếu")}>
        <input
          className={inputCls}
          placeholder={t("Tự động nếu để trống")}
          value={form.adjustmentNo}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(e) =>
            setForm((f) => ({ ...f, adjustmentNo: e.target.value }))
          }
        />
      </DrawerField>
      <DrawerField label={t("Ngày điều chỉnh")}>
        <DatePicker
          value={form.adjustmentDate ? form.adjustmentDate.slice(0, 10) : ""}
          disabled={viewOnly || editing?.status === "POSTED"}
          onChange={(v) => setForm((f) => ({ ...f, adjustmentDate: v }))}
        />
      </DrawerField>
      <DrawerField label={t("Lý do điều chỉnh")}>
        <Combobox
          options={adjustmentReasonOptions}
          value={
            form.globalAttributes?.type_inventory_adjustment ||
            form.globalAttributes?.adjustment_reason ||
            ""
          }
          disabled={viewOnly || editing?.status === "POSTED"}
          placeholder={t("— Chọn —")}
          allowClear={true}
          onChange={(v) =>
            setForm((f) => ({
              ...f,
              globalAttributes: {
                ...f.globalAttributes,
                type_inventory_adjustment: v || "",
                adjustment_reason: v || "",
              },
            }))
          }
        />
      </DrawerField>
    </>
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

  const clearFilterBtn =
    listHook.activeFilterCount > 0 ? (
      <FilterButton
        activeCount={listHook.activeFilterCount}
        onClick={() => {}}
        onClear={listHook.resetFilters}
      />
    ) : null;

  const sectionTitleExtra = (
    <div className="flex items-center gap-2">
      {clearFilterBtn}
      {!viewOnly && editing?.status !== "POSTED" && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => {
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
          >
            + {t("Thêm dòng")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold"
            onClick={() => setIsImportOpen(true)}
          >
            {t("Nhập từ Excel")}
          </Button>
        </>
      )}
    </div>
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
      sectionTitle={sectionTitle}
      sectionTitleExtra={sectionTitleExtra}
      tableItems={processedLines}
      getRowKey={(item) => String(form.lines.indexOf(item))}
      tableColumns={tableColumns}
      summaryRow={summaryRow}
      actionsColumn={actionsColumn}
      emptyLabel={t("Không có dữ liệu")}
      tableFooter={tableFooter}
      // Right panel
      rightPanelContent={rightPanelContent}
      remarksContent={remarksContent}
      customFieldsSlot={
        <ModuleEntityCustomFieldsSection
          moduleKey="INVENTORY_ADJUSTMENT"
          entityId={editing?.id}
          editMode={!viewOnly}
          globalAttributes={form.globalAttributes}
          onGlobalAttributesChange={(attrs) =>
            setForm((f) => ({ ...f, globalAttributes: attrs }))
          }
          hideCategorySection={true}
          globalTitle={t("moduleConfig.customFields", "Trường tùy chỉnh")}
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
