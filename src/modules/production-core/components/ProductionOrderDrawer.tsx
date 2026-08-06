import { useMemo } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DataTable } from "@/shared/components/DataTable";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { useT } from "@/core/i18n";
import {
  DrawerField,
  DrawerSection,
  DrawerRow,
  inputCls,
} from "@/shared/components/DrawerModal";
import { CellInput } from "@/shared/components/CellInput";
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
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import React from "react";

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

  const [colSortConfig, setColSortConfig] = React.useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [colFilters, setColFilters] = React.useState<Record<string, string>>(
    {},
  );
  const [colSelectedFilters, setColSelectedFilters] = React.useState<
    Record<string, string[]>
  >({});

  const getFilteredLinesForCol = React.useCallback(
    (excludeCol: string) => {
      return (
        bomLines?.filter((line: BomLikeLine) => {
          const s = localSearch.toLowerCase();
          const name = (line.itemName || "").toLowerCase();
          const sku = (line.itemCode || line.itemId || "").toLowerCase();
          const matchSearch = name.includes(s) || sku.includes(s);

          const requiredQty = Number(line.qtyRequired || 0);
          const effectiveItemId =
            alternativeItems[line.originalItemId ?? line.itemId ?? ""] ||
            line.itemId ||
            "";
          const availableQty = (
            balances[effectiveItemId] || { availableQty: 0 }
          ).availableQty;

          if (showLackingOnly && requiredQty <= availableQty) return false;
          if (!matchSearch) return false;

          if (excludeCol !== "itemCode") {
            if (
              colFilters.itemCode &&
              !(line.itemCode || "")
                .toLowerCase()
                .includes(colFilters.itemCode.toLowerCase())
            )
              return false;
            if (
              colSelectedFilters.itemCode?.length &&
              !colSelectedFilters.itemCode.includes(line.itemCode || "")
            )
              return false;
          }

          if (excludeCol !== "itemName") {
            if (
              colFilters.itemName &&
              !(line.itemName || "")
                .toLowerCase()
                .includes(colFilters.itemName.toLowerCase())
            )
              return false;
            if (
              colSelectedFilters.itemName?.length &&
              !colSelectedFilters.itemName.includes(line.itemName || "")
            )
              return false;
          }

          if (excludeCol !== "required") {
            if (
              colFilters.required &&
              !requiredQty.toString().includes(colFilters.required)
            )
              return false;
            if (
              colSelectedFilters.required?.length &&
              !colSelectedFilters.required.includes(requiredQty.toString())
            )
              return false;
          }

          if (excludeCol !== "available") {
            if (
              colFilters.available &&
              !availableQty.toString().includes(colFilters.available)
            )
              return false;
            if (
              colSelectedFilters.available?.length &&
              !colSelectedFilters.available.includes(availableQty.toString())
            )
              return false;
          }

          if (excludeCol !== "note") {
            if (colFilters.note || colSelectedFilters.note?.length) {
              const linePath = line.path || line.itemId || "";
              const note = lineNotes[linePath] || "";
              if (
                colFilters.note &&
                !note.toLowerCase().includes(colFilters.note.toLowerCase())
              )
                return false;
              if (
                colSelectedFilters.note?.length &&
                !colSelectedFilters.note.includes(note)
              )
                return false;
            }
          }

          return true;
        }) || []
      );
    },
    [
      bomLines,
      localSearch,
      showLackingOnly,
      alternativeItems,
      balances,
      colFilters,
      colSelectedFilters,
      lineNotes,
    ],
  );

  const filteredBomLines = useMemo(() => {
    let arr = getFilteredLinesForCol("none");

    if (colSortConfig) {
      const { key, direction } = colSortConfig;
      arr = [...arr].sort((a, b) => {
        let aVal: any = "";
        let bVal: any = "";
        if (key === "itemCode") {
          aVal = a.itemCode || "";
          bVal = b.itemCode || "";
        } else if (key === "itemName") {
          aVal = a.itemName || "";
          bVal = b.itemName || "";
        } else if (key === "required") {
          aVal = Number(a.qtyRequired || 0);
          bVal = Number(b.qtyRequired || 0);
        } else if (key === "available") {
          const aEffId =
            alternativeItems[a.originalItemId ?? a.itemId ?? ""] ||
            a.itemId ||
            "";
          aVal = (balances[aEffId] || { availableQty: 0 }).availableQty;
          const bEffId =
            alternativeItems[b.originalItemId ?? b.itemId ?? ""] ||
            b.itemId ||
            "";
          bVal = (balances[bEffId] || { availableQty: 0 }).availableQty;
        } else if (key === "note") {
          aVal = lineNotes[a.path || a.itemId || ""] || "";
          bVal = lineNotes[b.path || b.itemId || ""] || "";
        }

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return arr;
  }, [
    getFilteredLinesForCol,
    colSortConfig,
    alternativeItems,
    balances,
    lineNotes,
  ]);

  const handleColSort = (key: string, state: "asc" | "desc" | "none") => {
    if (state === "none") setColSortConfig(null);
    else setColSortConfig({ key, direction: state });
  };

  const handleColSearch = (key: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleColFilterChange = (key: string, vals: string[]) => {
    setColSelectedFilters((prev) => ({ ...prev, [key]: vals }));
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (showLackingOnly) count++;
    if (localSearch) count++;
    Object.values(colFilters).forEach((v) => {
      if (v) count++;
    });
    Object.values(colSelectedFilters).forEach((arr) => {
      if (arr && arr.length > 0) count++;
    });
    return count;
  }, [showLackingOnly, localSearch, colFilters, colSelectedFilters]);

  const clearAllFilters = React.useCallback(() => {
    setColFilters({});
    setColSelectedFilters({});
    setShowLackingOnly(false);
    setLocalSearch("");
  }, [setShowLackingOnly, setLocalSearch]);

  const itemCodeOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("itemCode");
    const vals = new Set(lines.map((l: BomLikeLine) => l.itemCode || ""));
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol]);

  const itemNameOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("itemName");
    const vals = new Set(lines.map((l: BomLikeLine) => l.itemName || ""));
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol]);

  const requiredOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("required");
    const vals = new Set(
      lines.map((l: BomLikeLine) => Number(l.qtyRequired || 0).toString()),
    );
    return Array.from(vals)
      .filter((v) => v !== "0")
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol]);

  const availableOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("available");
    const vals = new Set(
      lines.map((l: BomLikeLine) => {
        const effectiveItemId =
          alternativeItems[l.originalItemId ?? l.itemId ?? ""] ||
          l.itemId ||
          "";
        return (
          balances[effectiveItemId] || { availableQty: 0 }
        ).availableQty.toString();
      }),
    );
    return Array.from(vals)
      .filter((v) => v !== "0")
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol, alternativeItems, balances]);

  const noteOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("note");
    const vals = new Set(
      lines.map((l: BomLikeLine) => {
        const linePath = l.path || l.itemId || "";
        return lineNotes[linePath] || "";
      }),
    );
    return Array.from(vals)
      .filter(Boolean)
      .map((v) => ({ label: v, value: v }));
  }, [getFilteredLinesForCol, lineNotes]);

  const tableColumns = useMemo(
    () => [
      {
        key: "index",
        header: "#",
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: BomLikeLine, idx: number) => (
          <span className="text-muted-foreground">{idx}</span>
        ),
      },
      {
        key: "itemCode",
        header: (
          <TableColumnHeaderFilter
            title={t("Mã Linh Kiện")}
            sortState={
              colSortConfig?.key === "itemCode"
                ? colSortConfig.direction
                : "none"
            }
            onSortChange={(state) => handleColSort("itemCode", state)}
            searchValue={colFilters.itemCode || ""}
            onSearchChange={(val) => handleColSearch("itemCode", val)}
            selectedFilters={colSelectedFilters.itemCode || []}
            onFilterChange={(vals) => handleColFilterChange("itemCode", vals)}
            filterOptions={itemCodeOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px]",
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
        header: (
          <TableColumnHeaderFilter
            title={t("Tên Linh Kiện")}
            sortState={
              colSortConfig?.key === "itemName"
                ? colSortConfig.direction
                : "none"
            }
            onSortChange={(state) => handleColSort("itemName", state)}
            searchValue={colFilters.itemName || ""}
            onSearchChange={(val) => handleColSearch("itemName", val)}
            selectedFilters={colSelectedFilters.itemName || []}
            onFilterChange={(vals) => handleColFilterChange("itemName", vals)}
            filterOptions={itemNameOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px]",
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
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-top",
        cell: (line: BomLikeLine, _: number, meta: any) => {
          const {
            saving,
            viewOnly,
            isCompleted,
            isConfirmed,
            alternativeItems,
            altItemOptions,
            setAlternativeItem,
            clearAlternativeItem,
            setAltItemSearch,
            fetchNextAltItems,
            loadingAltItems,
          } = meta;
          const linePath = line.path || line.itemId || "";
          const selectedAltItemId = alternativeItems[linePath] ?? "";
          const altOption = altItemOptions.find(
            (o: any) => o.value === selectedAltItemId,
          );

          const isDisabled = !!(
            saving ||
            viewOnly ||
            isCompleted ||
            isConfirmed ||
            line.isLeaf === false
          );

          if (isDisabled && !selectedAltItemId) {
            return (
              <div className="flex items-center min-h-[38px] px-3">
                <span className="text-muted-foreground">—</span>
              </div>
            );
          }

          const displayLabel =
            altOption?.label || line.alternativeItemName || selectedAltItemId;

          return (
            <div className="flex flex-col min-w-[150px] min-h-[38px] w-full h-full">
              {!isDisabled && (
                <Combobox
                  variant="spreadsheet"
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
                <div className="flex flex-wrap items-center gap-2 px-2 pb-2 pt-1">
                  <Tooltip content={displayLabel}>
                    <span className="inline-block truncate max-w-[150px] xl:max-w-[250px] rounded-md bg-blue-50 text-blue-700 font-medium px-2 py-0.5 italic">
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
        header: (
          <TableColumnHeaderFilter
            title={t("Cần Dùng")}
            sortState={
              colSortConfig?.key === "required"
                ? colSortConfig.direction
                : "none"
            }
            onSortChange={(state) => handleColSort("required", state)}
            searchValue={colFilters.required || ""}
            onSearchChange={(val) => handleColSearch("required", val)}
            selectedFilters={colSelectedFilters.required || []}
            onFilterChange={(vals) => handleColFilterChange("required", vals)}
            filterOptions={requiredOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px] text-right",
        className: "min-w-[150px] text-right tabular-nums",
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
        header: (
          <TableColumnHeaderFilter
            title={t("Khả Dụng")}
            sortState={
              colSortConfig?.key === "available"
                ? colSortConfig.direction
                : "none"
            }
            onSortChange={(state) => handleColSort("available", state)}
            searchValue={colFilters.available || ""}
            onSearchChange={(val) => handleColSearch("available", val)}
            selectedFilters={colSelectedFilters.available || []}
            onFilterChange={(vals) => handleColFilterChange("available", vals)}
            filterOptions={availableOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px] text-right",
        className: "min-w-[150px] text-right tabular-nums",
        cell: (line: BomLikeLine, _: number, meta: any) => {
          const { alternativeItems, balances } = meta;
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
        header: (
          <TableColumnHeaderFilter
            title={t("Ghi chú")}
            sortState={
              colSortConfig?.key === "note" ? colSortConfig.direction : "none"
            }
            onSortChange={(state) => handleColSort("note", state)}
            searchValue={colFilters.note || ""}
            onSearchChange={(val) => handleColSearch("note", val)}
            selectedFilters={colSelectedFilters.note || []}
            onFilterChange={(vals) => handleColFilterChange("note", vals)}
            filterOptions={noteOptions}
            align="center"
          />
        ),
        minSize: 150,
        enableResizing: true,
        headerClassName: "min-w-[150px]",
        className: "min-w-[150px] p-0 align-middle",
        cell: (line: BomLikeLine, _: number, meta: any) => {
          const { saving, viewOnly, lineNotes, setLineNote } = meta;
          const linePath = line.path || line.itemId || "";
          const isDisabled = !!(saving || viewOnly || line.isLeaf === false);
          if (isDisabled && !lineNotes[linePath]) {
            return (
              <div className="flex items-center min-h-[38px] px-3">
                <span className="text-muted-foreground">—</span>
              </div>
            );
          }
          return (
            <CellInput
              value={lineNotes[linePath] || ""}
              onValueChange={(val) => setLineNote(linePath, val)}
              disabled={isDisabled}
              placeholder={t("Nhập ghi chú")}
            />
          );
        },
      },
    ],
    [
      t,
      colSortConfig,
      colFilters,
      colSelectedFilters,
      itemCodeOptions,
      itemNameOptions,
      requiredOptions,
      availableOptions,
      noteOptions,
    ],
  );

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
                  activeCount={activeFilterCount}
                  onClear={clearAllFilters}
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
            <DataTable
              variant="spreadsheet"
              containerClassName="max-h-[calc(100vh-350px)] overflow-auto"
              enableColumnResizing={true}
              items={filteredBomLines}
              emptyLabel={t("Không có dữ liệu")}
              getRowKey={(line: BomLikeLine) =>
                line.id ? `${line.id}` : String(filteredBomLines.indexOf(line))
              }
              tableMeta={{
                saving,
                viewOnly,
                isCompleted,
                isConfirmed,
                alternativeItems,
                altItemOptions,
                balances,
                lineNotes,
                setAlternativeItem,
                clearAlternativeItem,
                setAltItemSearch,
                fetchNextAltItems,
                loadingAltItems,
                setLineNote,
              }}
              columns={tableColumns}
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
