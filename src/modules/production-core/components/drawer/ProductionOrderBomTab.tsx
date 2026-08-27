import React, { useState, useMemo, useCallback } from "react";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { DataTable } from "@/shared/components/DataTable";
import { CellInput } from "@/shared/components/CellInput";
import { Combobox } from "@/shared/components/Combobox";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { SearchInput } from "@/shared/components/SearchInput";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FilterButton } from "@/shared/components/FilterPanel";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/shared/utils";
import { useT } from "@/core/i18n";
import type { BomLikeLine } from "../../hooks/useProductionOrderDrawer";

export interface ProductionOrderBomTabProps {
  bomLines: BomLikeLine[];
  bomLoading: boolean;
  saving: boolean;
  viewOnly?: boolean;
  isCompleted: boolean;
  isConfirmed: boolean;
  balances: Record<
    string,
    { qtyOnHand: number; qtyReserved: number; availableQty: number }
  >;
  alternativeItems: Record<string, string>;
  setAlternativeItem: (lineOriginalItemId: string, altItemId: string) => void;
  clearAlternativeItem: (lineOriginalItemId: string) => void;
  altItemOptions: Array<{ value: string; label: string }>;
  setAltItemSearch: (s: string) => void;
  fetchNextAltItems?: () => void;
  loadingAltItems?: boolean;
  lineNotes: Record<string, string>;
  setLineNote: (lineOriginalItemId: string, note: string) => void;
  localSearch: string;
  setLocalSearch: (s: string) => void;
  showLackingOnly: boolean;
  setShowLackingOnly: (show: boolean) => void;
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

export function ProductionOrderBomTab({
  bomLines,
  bomLoading,
  saving,
  viewOnly = false,
  isCompleted,
  isConfirmed,
  balances,
  alternativeItems,
  setAlternativeItem,
  clearAlternativeItem,
  altItemOptions,
  setAltItemSearch,
  fetchNextAltItems,
  loadingAltItems,
  lineNotes,
  setLineNote,
  localSearch,
  setLocalSearch,
  showLackingOnly,
  setShowLackingOnly,
}: ProductionOrderBomTabProps) {
  const t = useT();

  const [colSortConfig, setColSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [colSelectedFilters, setColSelectedFilters] = useState<
    Record<string, string[]>
  >({});

  const getFilteredLinesForCol = useCallback(
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
          const aEff =
            alternativeItems[a.path || a.itemId || ""] || a.itemId || "";
          const bEff =
            alternativeItems[b.path || b.itemId || ""] || b.itemId || "";
          aVal = (balances[aEff] || { availableQty: 0 }).availableQty;
          bVal = (balances[bEff] || { availableQty: 0 }).availableQty;
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

  const handleColSort = useCallback(
    (key: string, state: "asc" | "desc" | "none") => {
      if (state === "none") {
        setColSortConfig(null);
      } else {
        setColSortConfig({ key, direction: state });
      }
    },
    [],
  );

  const handleColSearch = useCallback((key: string, val: string) => {
    setColFilters((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleColFilterChange = useCallback((key: string, vals: string[]) => {
    setColSelectedFilters((prev) => ({ ...prev, [key]: vals }));
  }, []);

  const itemCodeOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("itemCode");
    return Array.from(new Set(lines.map((l) => l.itemCode || "")))
      .filter(Boolean)
      .map((val) => ({ label: val, value: val }));
  }, [getFilteredLinesForCol]);

  const itemNameOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("itemName");
    return Array.from(new Set(lines.map((l) => l.itemName || "")))
      .filter(Boolean)
      .map((val) => ({ label: val, value: val }));
  }, [getFilteredLinesForCol]);

  const requiredOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("required");
    return Array.from(
      new Set(lines.map((l) => Number(l.qtyRequired || 0).toString())),
    ).map((val) => ({ label: fmtQty(val), value: val }));
  }, [getFilteredLinesForCol]);

  const availableOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("available");
    return Array.from(
      new Set(
        lines.map((l) => {
          const eff =
            alternativeItems[l.path || l.itemId || ""] || l.itemId || "";
          return (balances[eff] || { availableQty: 0 }).availableQty.toString();
        }),
      ),
    ).map((val) => ({ label: fmtQty(val), value: val }));
  }, [getFilteredLinesForCol, alternativeItems, balances]);

  const noteOptions = useMemo(() => {
    const lines = getFilteredLinesForCol("note");
    return Array.from(
      new Set(lines.map((l) => lineNotes[l.path || l.itemId || ""] || "")),
    )
      .filter(Boolean)
      .map((val) => ({ label: val, value: val }));
  }, [getFilteredLinesForCol, lineNotes]);

  const activeFilterCount =
    (localSearch ? 1 : 0) +
    (showLackingOnly ? 1 : 0) +
    Object.values(colFilters).filter(Boolean).length +
    Object.values(colSelectedFilters).filter((arr) => arr?.length > 0).length;

  const clearAllFilters = useCallback(() => {
    setLocalSearch("");
    setShowLackingOnly(false);
    setColFilters({});
    setColSelectedFilters({});
    setColSortConfig(null);
  }, [setLocalSearch, setShowLackingOnly]);

  const tableColumns = useMemo(
    () => [
      {
        key: "itemCode",
        header: (
          <TableColumnHeaderFilter
            title={t("Mã NVL")}
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
          />
        ),
        minSize: 120,
        enableResizing: true,
        headerClassName: "min-w-[120px]",
        className: "min-w-[120px] font-mono text-xs",
        cell: (line: BomLikeLine) => {
          const level = line.level || 0;
          return (
            <div
              className="flex items-center gap-1.5"
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {level > 0 && (
                <span className="text-muted-foreground font-mono select-none">
                  └─
                </span>
              )}
              <span className="font-semibold text-foreground">
                {line.itemCode || "—"}
              </span>
            </div>
          );
        },
      },
      {
        key: "itemName",
        header: (
          <TableColumnHeaderFilter
            title={t("Tên Linh Kiện / NVL")}
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
          />
        ),
        minSize: 180,
        enableResizing: true,
        headerClassName: "min-w-[180px]",
        className: "min-w-[180px]",
        cell: (line: BomLikeLine) => (
          <Tooltip content={line.itemName || ""}>
            <div className="truncate max-w-[200px] xl:max-w-[320px]">
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
          const altOption = altItemOptions?.find(
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
                    <span className="inline-block truncate max-w-[150px] xl:max-w-[250px] rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium px-2 py-0.5 italic text-xs">
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
        minSize: 120,
        enableResizing: true,
        headerClassName: "min-w-[120px] text-right",
        className: "min-w-[120px] text-right tabular-nums",
        cell: (line: BomLikeLine) => {
          const requiredQty = Number(line.qtyRequired || 0);
          return (
            <span className="text-amber-700 dark:text-amber-400 font-semibold">
              {fmtQty(requiredQty.toString())}
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
        minSize: 120,
        enableResizing: true,
        headerClassName: "min-w-[120px] text-right",
        className: "min-w-[120px] text-right tabular-nums",
        cell: (line: BomLikeLine, _: number, meta: any) => {
          const { alternativeItems, balances } = meta;
          const requiredQty = Number(line.qtyRequired || 0);
          const linePath = line.path || line.itemId || "";
          const effectiveItemId =
            alternativeItems[linePath] || line.itemId || "";

          if (line.itemTypeCode === "SERVICE") {
            return <span className="text-muted-foreground">—</span>;
          }

          const availableQty = (
            balances[effectiveItemId] || { availableQty: 0 }
          ).availableQty;
          const isLacking = requiredQty > availableQty;
          return (
            <span
              className={cn(
                "font-semibold",
                isLacking
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-700 dark:text-emerald-400",
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
      handleColSort,
      handleColSearch,
      handleColFilterChange,
    ],
  );

  return (
    <div className="flex h-full flex-col space-y-4">
      <DrawerSection
        title={
          t("CHI TIẾT BOM ĐỊNH MỨC") + " (" + (bomLines?.length || 0) + ")"
        }
        collapsible
        defaultCollapsed={false}
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
          <div className="pl-4 py-6 text-xs text-muted-foreground animate-pulse flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{t("Đang phân rã cây định mức BOM...")}</span>
          </div>
        ) : filteredBomLines && filteredBomLines.length > 0 ? (
          <div className="w-full">
            <DataTable
              variant="spreadsheet"
              containerClassName="max-h-[calc(100vh-320px)] overflow-auto"
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
          <div className="text-sm text-muted-foreground italic px-2 py-6 text-center">
            {t("Không có dữ liệu BOM hoặc chưa chọn thành phẩm")}
          </div>
        )}
      </DrawerSection>
    </div>
  );
}
