import { useState, useMemo } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DataTable } from "@/shared/components/DataTable";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Button } from "@/shared/components/ui/Button";
import { Combobox } from "@/shared/components/Combobox";
import { FilterButton } from "@/shared/components/FilterPanel";
import { CellInput } from "@/shared/components/CellInput";
import { cn } from "@/shared/utils";
import { lineTypeOptions } from "@/modules/operational/utils/operationalHelpers";
import { useOperationalFormStore } from "@/modules/operational/hooks/useOperationalFormStore";
import { useVoucherClientFilter } from "@/modules/inventory-core/hooks/useVoucherClientFilter";
import { InventoryItemPickerDrawer } from "@/modules/inventory-core/components/InventoryItemPickerDrawer";
import { useT } from "@/core/i18n";
import type {
  FormVariant,
  LineDraft,
} from "@/modules/operational/utils/operationalHelpers";

const LineColumnHeaderFilter = ({
  table,
  columnKey,
  title,
  hideFilter,
  queryPrefix,
}: any) => {
  const { listHook, lines, buildFilterOptions } = table.options.meta;
  return (
    <TableColumnHeaderFilter
      title={title}
      sortState={
        listHook.sorts.includes(columnKey)
          ? "asc"
          : listHook.sorts.includes(`-${columnKey}`)
            ? "desc"
            : "none"
      }
      onSortChange={(state: any) => listHook.setSort(columnKey, state)}
      searchValue={listHook.columnSearch[columnKey] || ""}
      onSearchChange={(val: any) => listHook.setColumnSearch(columnKey, val)}
      selectedFilters={listHook.columnFilters[columnKey] || []}
      onFilterChange={(vals: any) => listHook.setColumnFilter(columnKey, vals)}
      align="center"
      columnKey={columnKey}
      queryKeyPrefix={queryPrefix ?? `line-${columnKey}`}
      allFilters={listHook.columnFilters}
      hideFilter={hideFilter}
      fetchOptions={
        hideFilter ? undefined : buildFilterOptions(columnKey, lines)
      }
    />
  );
};

interface FormLineDetailPanelProps {
  variant: FormVariant;
  isPurchaseLocked: boolean;
  hasLinkedReceipts?: boolean;
  purchaseFieldLocked: (
    field: "description" | "qty" | "expectedDate" | "status" | "poNo",
  ) => boolean;
  viewOnly?: boolean;
  purchaseInventoryOptions?: Array<{
    value: string;
    label: string;
    sku: string;
    itemName: string;
    itemType?: string;
    note?: string;
    searchText?: string;
  }>;
  onItemSearch?: (query: string) => void;
  onScrollBottomItems?: () => void;
  loadingItems?: boolean;
}

export function FormLineDetailPanel({
  variant,
  isPurchaseLocked,
  hasLinkedReceipts = false,
  purchaseFieldLocked,
  viewOnly,
}: FormLineDetailPanelProps) {
  const t = useT();
  const [pickerOpen, setPickerOpen] = useState(false);
  const {
    lines,
    setLine,
    setLines,
    addLine,
    syncItemsFromPicker,
    clearAllLines,
    removeLine,
  } = useOperationalFormStore();

  const existingItemIds = useMemo(
    () => lines.map((l) => l.inventory_item_id).filter(Boolean),
    [lines],
  );

  const preSelectedItems = useMemo(
    () =>
      lines
        .filter((l) => Boolean(l.inventory_item_id))
        .map((l) => ({
          id: l.inventory_item_id as string,
          sku: l.item_code,
          itemName: l.item_name || l.description || "",
          itemType: l.line_type || "PART",
          costPrice: Number(l.unit_price || 0),
        })),
    [lines],
  );

  const { listHook, processedLines, buildFilterOptions } =
    useVoucherClientFilter({
      tableId: `form-line-detail-${variant}`,
      lines,
      isOpen: true,
      getCode: (line) => line.item_code || "",
      getName: (line) => line.item_name || line.description || "",
      customSort: (a, b, field, isDesc) => {
        if (field === "qty" || field === "unit_price" || field === "amount") {
          const valA = Number(a[field as keyof LineDraft] || 0);
          const valB = Number(b[field as keyof LineDraft] || 0);
          return isDesc ? valB - valA : valA - valB;
        }
        return null;
      },
    });

  const displayLines = variant === "purchase" ? processedLines : lines;

  const totalQty = useMemo(
    () => displayLines.reduce((sum, line) => sum + Number(line.qty || 0), 0),
    [displayLines],
  );

  const totalAmount = useMemo(
    () => displayLines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [displayLines],
  );

  const makeFilterHeader = (
    key: string,
    title: string,
    opts?: { hideFilter?: boolean; queryPrefix?: string },
  ) => {
    return ({ table }: any) => (
      <LineColumnHeaderFilter
        table={table}
        columnKey={key}
        title={title}
        hideFilter={opts?.hideFilter}
        queryPrefix={opts?.queryPrefix}
      />
    );
  };

  const indexCol = {
    key: "index",
    header: "#",
    size: 40,
    headerClassName: "text-center w-[40px] min-w-[40px]",
    className: "text-center w-[40px] min-w-[40px]",
    cell: (_: any, idx: number) => (
      <span className="text-muted-foreground">{idx}</span>
    ),
  };

  const columns = useMemo(
    () => [
      indexCol,
      {
        key: "item_name",
        header:
          variant === "purchase"
            ? makeFilterHeader("itemName", t("Nội dung / Mặt hàng"), {
                queryPrefix: "item_name",
              })
            : t("Linh kiện / Tên hàng"),
        minSize: 180,
        size: 220,
        enableResizing: true,
        headerClassName: "w-[220px] min-w-[180px]",
        className: "w-[220px] min-w-[180px] align-middle p-0",
        cell: (line: LineDraft) => {
          const isItemLocked =
            isPurchaseLocked ||
            (Boolean(hasLinkedReceipts) && Boolean(line.inventory_item_id));
          const text = line.item_name || line.description || "—";

          return variant === "purchase" ? (
            viewOnly || isItemLocked ? (
              <Tooltip content={text}>
                <div className="font-medium px-3 py-2 block truncate w-full cursor-pointer text-foreground/90">
                  {text}
                </div>
              </Tooltip>
            ) : (
              <CellInput
                className={cn(
                  "w-full h-full min-h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all placeholder:text-muted-foreground/50 font-medium",
                )}
                placeholder={t("Nhập tên mặt hàng / chi phí / dịch vụ...")}
                value={line.item_name}
                disabled={isItemLocked}
                onValueChange={(v) => setLine(line.tempId, "item_name", v)}
              />
            )
          ) : viewOnly ? (
            <div className="space-y-1 px-3 py-2">
              <div className="text-xs text-muted-foreground">
                {line.line_type}
              </div>
              <div className="font-medium">{line.item_code}</div>
              <div>{line.item_name}</div>
            </div>
          ) : (
            <div className="flex flex-col h-full min-h-[38px]">
              <Combobox
                variant="spreadsheet"
                options={lineTypeOptions}
                value={line.line_type}
                disabled={isPurchaseLocked}
                onChange={(v) =>
                  setLine(line.tempId, "line_type", v || "SERVICE")
                }
                allowClear={false}
              />
              <div className="h-[1px] bg-border/50" />
              <CellInput
                className={cn(
                  "w-full h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all placeholder:text-muted-foreground/50",
                )}
                placeholder={t("Mã hàng/SKU")}
                value={line.item_code}
                disabled={isPurchaseLocked}
                onValueChange={(v) => setLine(line.tempId, "item_code", v)}
              />
              <div className="h-[1px] bg-border/50" />
              <CellInput
                className={cn(
                  "w-full h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all placeholder:text-muted-foreground/50 font-medium",
                )}
                placeholder={t("Tên linh kiện/dịch vụ")}
                value={line.item_name}
                disabled={isPurchaseLocked}
                onValueChange={(v) => setLine(line.tempId, "item_name", v)}
              />
            </div>
          );
        },
      },
      ...(variant === "purchase"
        ? [
            {
              key: "item_code",
              header: makeFilterHeader("itemCode", t("Mã linh kiện"), {
                queryPrefix: "item_code",
              }),
              minSize: 140,
              size: 150,
              enableResizing: true,
              headerClassName: "w-[150px] min-w-[140px]",
              className: "w-[150px] min-w-[140px] align-middle p-0",
              cell: (line: LineDraft) => {
                const isInventoryLine = Boolean(line.inventory_item_id);

                return (
                  <div className="px-3 py-2">
                    <TableText
                      text={line.item_code || "—"}
                      enableCopy={Boolean(line.item_code)}
                      textClassName={cn(
                        "font-mono text-xs font-medium",
                        !isInventoryLine
                          ? "text-muted-foreground/40"
                          : "text-foreground/90",
                      )}
                    />
                  </div>
                );
              },
            },
          ]
        : []),
      {
        key: "qty",
        header:
          variant === "purchase"
            ? makeFilterHeader("qty", t("Số lượng"))
            : t("Số lượng"),
        minSize: 140,
        enableResizing: true,
        headerClassName: "text-right w-[140px] min-w-[140px]",
        className: "text-right w-[140px] min-w-[140px] align-middle p-0",
        cell: (line: LineDraft) => {
          const isItemLocked =
            isPurchaseLocked ||
            (Boolean(hasLinkedReceipts) && Boolean(line.inventory_item_id));
          const isQtyLocked = isItemLocked || purchaseFieldLocked("qty");

          return viewOnly || isQtyLocked ? (
            <span className="inline-block w-full text-right text-sm tabular-nums px-3 py-2 font-medium text-foreground/90">
              {Number(line.qty || 0).toLocaleString("vi-VN")}
            </span>
          ) : (
            <CellInput
              type="number"
              min={0}
              step="0.01"
              className={cn(
                "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all font-medium text-emerald-700",
              )}
              value={line.qty}
              disabled={isQtyLocked}
              onValueChange={(v) => setLine(line.tempId, "qty", v)}
            />
          );
        },
      },
      {
        key: "unit_price",
        header:
          variant === "purchase"
            ? makeFilterHeader("unit_price", t("Đơn giá"))
            : t("Đơn giá"),
        minSize: 180,
        enableResizing: true,
        headerClassName: "text-right w-[180px] min-w-[180px]",
        className: "text-right w-[180px] min-w-[180px] align-middle p-0",
        cell: (line: LineDraft) => {
          const isItemLocked =
            isPurchaseLocked ||
            (Boolean(hasLinkedReceipts) && Boolean(line.inventory_item_id));

          return viewOnly || isItemLocked ? (
            <span className="inline-block w-full text-right font-semibold tabular-nums px-3 py-2 text-foreground/90">
              {Number(line.unit_price || 0).toLocaleString("vi-VN")}
            </span>
          ) : (
            <CellInput
              type="number"
              min={0}
              step="0.01"
              className={cn(
                "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all font-medium",
              )}
              value={line.unit_price}
              disabled={isItemLocked}
              onValueChange={(v) => setLine(line.tempId, "unit_price", v)}
            />
          );
        },
      },
      {
        key: "amount",
        header:
          variant === "purchase"
            ? makeFilterHeader("amount", t("Thành tiền"))
            : t("Thành tiền"),
        minSize: 180,
        enableResizing: true,
        headerClassName: "text-right w-[180px] min-w-[180px]",
        className: "text-right w-[180px] min-w-[180px] align-middle p-0",
        cell: (line: LineDraft) => {
          const isItemLocked =
            isPurchaseLocked ||
            (Boolean(hasLinkedReceipts) && Boolean(line.inventory_item_id));

          return viewOnly || isItemLocked ? (
            <span className="inline-block w-full text-right font-semibold tabular-nums px-3 py-2 text-foreground/90">
              {Number(line.amount || 0).toLocaleString("vi-VN")}
            </span>
          ) : (
            <CellInput
              type="number"
              min={0}
              step="0.01"
              className={cn(
                "w-full h-full min-h-[38px] text-right bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all font-semibold",
              )}
              value={line.amount}
              disabled={isItemLocked}
              onValueChange={(v) => setLine(line.tempId, "amount", v)}
            />
          );
        },
      },
      {
        key: "description",
        header:
          variant === "purchase"
            ? makeFilterHeader("description", t("Mô tả"))
            : t("Mô tả"),
        minSize: 240,
        enableResizing: true,
        headerClassName: "w-[240px] min-w-[240px]",
        className: "w-[240px] min-w-[240px] align-middle p-0",
        cell: (line: LineDraft) =>
          viewOnly ? (
            <span className="inline-block w-full px-3 py-2">
              {line.description || "—"}
            </span>
          ) : (
            <CellInput
              className={cn(
                "w-full h-full min-h-[38px] bg-transparent border-0 focus:ring-1 focus:ring-emerald-500 outline-none hover:bg-slate-50 focus:bg-white px-3 transition-all placeholder:text-muted-foreground/50",
              )}
              value={line.description}
              disabled={viewOnly || purchaseFieldLocked("description")}
              onValueChange={(v) => setLine(line.tempId, "description", v)}
              placeholder={t("Nhập mô tả")}
            />
          ),
      },
    ],
    [
      indexCol,
      variant,
      t,
      isPurchaseLocked,
      hasLinkedReceipts,
      viewOnly,
      lineTypeOptions,
      setLine,
      setLines,
      purchaseFieldLocked,
    ],
  );

  const actionsColumn =
    !viewOnly && !isPurchaseLocked
      ? {
          header: "" as any,
          cell: (line: LineDraft) => {
            const isInventoryLine = Boolean(line.inventory_item_id);
            const isLocked = Boolean(hasLinkedReceipts) && isInventoryLine;
            if (isLocked) {
              return (
                <div className="flex justify-center w-full">
                  <span
                    className="text-xs text-muted-foreground/40"
                    title={t("Dòng đã gắn phiếu")}
                  >
                    —
                  </span>
                </div>
              );
            }
            return (
              <div className="flex justify-center w-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeLine(line.tempId, variant)}
                  title={t("Xóa dòng")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        }
      : undefined;

  const clearFilterBtn =
    listHook.activeFilterCount > 0 ? (
      <FilterButton
        activeCount={listHook.activeFilterCount}
        onClick={() => {}}
        className="h-8 py-1.5 ml-2"
        onClear={listHook.resetFilters}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <DrawerSection
        title={
          <span>
            {t("Chi tiết")} ({displayLines.length}/{lines.length})
          </span>
        }
        titleExtra={
          <div className="flex items-center gap-2">
            {clearFilterBtn}
            {!viewOnly && !isPurchaseLocked && (
              <>
                {variant === "purchase" && !hasLinkedReceipts && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                    className="h-8 text-xs font-medium text-primary border-primary/40 hover:bg-primary/5 hover:border-primary transition-all"
                  >
                    <Package className="mr-1.5 h-3.5 w-3.5" />
                    {t("Chọn từ kho")}
                  </Button>
                )}
                {variant !== "purchase" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addLine(variant)}
                    className="h-8 text-xs font-medium"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t("Thêm dòng")}
                  </Button>
                )}
                {!hasLinkedReceipts && lines.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearAllLines(variant)}
                    className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    {t("Xóa tất cả")}
                  </Button>
                )}
              </>
            )}
          </div>
        }
      >
        <DataTable
          tableMeta={{ listHook, lines, buildFilterOptions }}
          items={displayLines}
          getRowKey={(line) => line.tempId}
          variant="spreadsheet"
          emptyLabel={t("Không có dữ liệu")}
          containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"
          columns={columns as any}
          summaryRow={{
            item_name: (
              <div className="text-right w-full font-semibold px-3">
                {t("Tổng cộng")}:
              </div>
            ),
            qty: (
              <div className="text-right font-bold text-primary tabular-nums px-3">
                {Number(totalQty).toLocaleString("vi-VN")}
              </div>
            ),
            amount: (
              <div className="text-right font-bold text-primary tabular-nums px-3">
                {Number(totalAmount).toLocaleString("vi-VN")}
              </div>
            ),
          }}
          actionsColumn={actionsColumn}
        />
      </DrawerSection>

      {/* Multi-select Item Picker Drawer */}
      <InventoryItemPickerDrawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        preSelectedItems={preSelectedItems}
        existingItemIds={existingItemIds as string[]}
        onSelectItems={(selected) => {
          const mapped = selected.map((i) => ({
            id: i.id,
            sku: i.sku,
            itemName: i.itemName,
            itemType:
              typeof i.itemType === "object"
                ? i.itemType?.code || i.itemType?.name || "PART"
                : i.itemType || "PART",
            uom:
              typeof i.uom === "object"
                ? i.uom?.name || i.uom?.code || ""
                : i.uom || "",
            costPrice: (i as any).costPrice ?? (i as any).avgUnitCost,
          }));
          syncItemsFromPicker(mapped, variant);
        }}
      />
    </div>
  );
}
