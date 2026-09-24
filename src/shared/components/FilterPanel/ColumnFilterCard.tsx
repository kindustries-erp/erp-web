import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowDownAZ,
  ArrowUpAZ,
  RotateCcw,
  Search,
  ListFilter,
  Calendar,
  Hash,
  X,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import {
  TableSortState,
  ColumnValueType,
  TextFilterOperator,
  NumberFilterOperator,
} from "@/shared/components/DataTable/types";
import type { ColumnFilterDescriptor } from "@/shared/components/DataTable/createColumnHeaderFilter";
import { setDropdownSearchState } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { ColumnOptionList } from "./ColumnOptionList";
import { cn } from "@/shared/utils";
import {
  periodFirstDay,
  periodLastDay,
  initPeriod,
} from "@/modules/finance/utils/financeHelpers";

interface ColumnFilterCardProps {
  descriptor: ColumnFilterDescriptor;
  defaultExpanded?: boolean;
  searchValue: string;
  onSearchChange: (val: string) => void;
  selectedFilters: string[];
  onFilterChange: (vals: string[]) => void;
  operator?: TextFilterOperator | NumberFilterOperator;
  onOperatorChange?: (op: TextFilterOperator | NumberFilterOperator) => void;
  sortState: TableSortState;
  onSortChange: (state: TableSortState) => void;
  dateFrom?: string;
  dateTo?: string;
  onDateRangeChange?: (from?: string, to?: string) => void;
  allFilters?: Record<string, string[]>;
}

const TEXT_OPERATOR_OPTIONS = [
  { value: TextFilterOperator.CONTAINS, label: "Chứa" },
  { value: TextFilterOperator.NOT_CONTAINS, label: "Không chứa" },
  { value: TextFilterOperator.STARTS_WITH, label: "Bắt đầu bằng" },
  { value: TextFilterOperator.ENDS_WITH, label: "Kết thúc bằng" },
  { value: TextFilterOperator.EQUALS, label: "Chính xác (=)" },
  { value: TextFilterOperator.NOT_EQUALS, label: "Khác (≠)" },
  { value: TextFilterOperator.IS_EMPTY, label: "Trống (rỗng)" },
  { value: TextFilterOperator.IS_NOT_EMPTY, label: "Không trống" },
];

const NUMBER_OPERATOR_OPTIONS = [
  { value: NumberFilterOperator.EQUALS, label: "Bằng (=)" },
  { value: NumberFilterOperator.NOT_EQUALS, label: "Khác (≠)" },
  { value: NumberFilterOperator.GREATER_THAN, label: "Lớn hơn (>)" },
  {
    value: NumberFilterOperator.GREATER_THAN_OR_EQUAL,
    label: "Lớn hơn hoặc bằng (≥)",
  },
  { value: NumberFilterOperator.LESS_THAN, label: "Nhỏ hơn (<)" },
  {
    value: NumberFilterOperator.LESS_THAN_OR_EQUAL,
    label: "Nhỏ hơn hoặc bằng (≤)",
  },
  { value: NumberFilterOperator.BETWEEN, label: "Khoảng (Từ ... Đến ...)" },
];

export function ColumnFilterCard({
  descriptor,
  defaultExpanded = false,
  searchValue,
  onSearchChange,
  selectedFilters,
  onFilterChange,
  operator,
  onOperatorChange,
  sortState,
  onSortChange,
  dateFrom,
  dateTo,
  onDateRangeChange,
  allFilters,
}: ColumnFilterCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Sync expanded if defaultExpanded becomes true from chip click
  useEffect(() => {
    if (defaultExpanded) setExpanded(true);
  }, [defaultExpanded]);

  // Pending Search State
  const [pendingSearch, setPendingSearch] = useState(searchValue || "");

  // Number range split (if operator is between: "10..50")
  const [pendingNumFrom, setPendingNumFrom] = useState(() => {
    if (searchValue && searchValue.includes(".."))
      return searchValue.split("..")[0] || "";
    return searchValue || "";
  });
  const [pendingNumTo, setPendingNumTo] = useState(() => {
    if (searchValue && searchValue.includes(".."))
      return searchValue.split("..")[1] || "";
    return "";
  });

  useEffect(() => {
    if ((searchValue || "") !== pendingSearch) {
      setPendingSearch(searchValue || "");
      if (descriptor.type === ColumnValueType.NUMBER) {
        if (searchValue && searchValue.includes("..")) {
          const parts = searchValue.split("..");
          setPendingNumFrom(parts[0] || "");
          setPendingNumTo(parts[1] || "");
        } else {
          setPendingNumFrom(searchValue || "");
          setPendingNumTo("");
        }
      }
    }
  }, [searchValue]);

  // Pending Filters State (Checkboxes)
  const [pendingFilters, setPendingFilters] = useState<string[]>(
    selectedFilters || [],
  );
  useEffect(() => {
    setPendingFilters(selectedFilters || []);
  }, [selectedFilters]);

  const isAllMatchingMode = pendingFilters[0] === "__ALL_MATCHING__";
  useEffect(() => {
    if (isAllMatchingMode) {
      setPendingFilters(["__ALL_MATCHING__", pendingSearch]);
    }
  }, [pendingSearch, isAllMatchingMode]);

  // Pending Operator State
  const [pendingOperator, setPendingOperator] = useState<
    TextFilterOperator | NumberFilterOperator | undefined
  >(operator);
  useEffect(() => {
    setPendingOperator(operator);
  }, [operator]);

  const handleNumRangeChange = (from: string, to: string) => {
    setPendingNumFrom(from);
    setPendingNumTo(to);
    if (!from && !to) {
      setPendingSearch("");
    } else {
      setPendingSearch(`${from}..${to}`);
    }
  };

  // Pending Date Range
  const [pendingDateFrom, setPendingDateFrom] = useState(dateFrom);
  const [pendingDateTo, setPendingDateTo] = useState(dateTo);
  useEffect(() => {
    setPendingDateFrom(dateFrom);
    setPendingDateTo(dateTo);
  }, [dateFrom, dateTo]);

  const isFilterListActive = Boolean(
    selectedFilters && selectedFilters.length > 0,
  );
  const isSearchActive = Boolean(
    !isFilterListActive && searchValue && searchValue.trim().length > 0,
  );
  const isSortActive = sortState !== TableSortState.NONE;
  const isDateActive = Boolean(dateFrom || dateTo);
  const hasActiveModifiers =
    isSearchActive || isFilterListActive || isSortActive || isDateActive;

  const hasPendingChanges = useMemo(() => {
    if ((pendingSearch || "").trim() !== (searchValue || "").trim())
      return true;
    if (
      JSON.stringify(pendingFilters || []) !==
      JSON.stringify(selectedFilters || [])
    )
      return true;
    if (pendingOperator !== operator) return true;
    if (descriptor.type === ColumnValueType.DATE) {
      if (pendingDateFrom !== dateFrom || pendingDateTo !== dateTo) return true;
    }
    return false;
  }, [
    pendingSearch,
    searchValue,
    pendingFilters,
    selectedFilters,
    pendingOperator,
    operator,
    pendingDateFrom,
    dateFrom,
    pendingDateTo,
    dateTo,
    descriptor.type,
  ]);

  const handleApply = () => {
    const trimmedSearch = (pendingSearch || "").trim();
    onSearchChange(trimmedSearch);
    if (descriptor.key) {
      setDropdownSearchState(descriptor.key, trimmedSearch);
    }
    const finalFilters =
      pendingFilters[0] === "__ALL_MATCHING__"
        ? ["__ALL_MATCHING__", pendingSearch]
        : pendingFilters;
    onFilterChange(finalFilters);
    if (pendingOperator && onOperatorChange && pendingOperator !== operator) {
      onOperatorChange(pendingOperator);
    }
    if (descriptor.type === ColumnValueType.DATE && onDateRangeChange) {
      onDateRangeChange(pendingDateFrom, pendingDateTo);
    }
  };

  const handleClearColumn = () => {
    setPendingSearch("");
    setPendingFilters([]);
    setPendingNumFrom("");
    setPendingNumTo("");
    setPendingDateFrom(undefined);
    setPendingDateTo(undefined);
    setPendingOperator(undefined);
    onSearchChange("");
    onFilterChange([]);
    onSortChange(TableSortState.NONE);
    if (descriptor.key) {
      setDropdownSearchState(descriptor.key, "");
    }
    if (onDateRangeChange) onDateRangeChange(undefined, undefined);
  };

  const getTypeIcon = () => {
    switch (descriptor.type) {
      case ColumnValueType.NUMBER:
        return (
          <Hash className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
        );
      case ColumnValueType.DATE:
        return (
          <Calendar className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
        );
      case ColumnValueType.SELECT:
      case ColumnValueType.STATUS:
        return (
          <ListFilter className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
        );
      case ColumnValueType.TEXT:
      default:
        return (
          <Search className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
        );
    }
  };

  return (
    <div
      id={`filter-card-${descriptor.key}`}
      className={cn(
        "mx-1 my-1.5 rounded-xl transition-all duration-200 overflow-hidden",
        expanded
          ? hasActiveModifiers
            ? "bg-card dark:bg-card/90 shadow-[0_0_16px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] dark:shadow-[0_0_18px_rgba(0,0,0,0.45)]"
            : "bg-card dark:bg-card/80 shadow-[0_0_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_0_14px_rgba(0,0,0,0.35)]"
          : hasActiveModifiers
            ? "bg-primary/[0.04] dark:bg-primary/10 shadow-[0_0_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_0_12px_rgba(0,0,0,0.09)] hover:bg-primary/[0.07]"
            : "bg-card dark:bg-card/60 shadow-[0_0_6px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_0_10px_rgba(0,0,0,0.08)] hover:bg-card/90",
      )}
    >
      {/* Card Header (Click to toggle) */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none gap-2 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center bg-muted/60 dark:bg-muted/40 shrink-0">
            {getTypeIcon()}
          </div>
          <span
            className={cn(
              "text-xs truncate transition-colors",
              hasActiveModifiers
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/80",
            )}
          >
            {descriptor.titleText}
          </span>
          {hasActiveModifiers && (
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isSortActive && (
            <Badge
              variant="outline"
              className="h-4.5 px-1 text-[10px] font-medium border-purple-400/30 text-purple-600 bg-purple-50/70 dark:bg-purple-950/40"
            >
              {sortState === TableSortState.ASC ? (
                <ArrowDownAZ className="h-2.5 w-2.5" />
              ) : (
                <ArrowUpAZ className="h-2.5 w-2.5" />
              )}
            </Badge>
          )}

          {isFilterListActive && (
            <Badge
              variant="secondary"
              className="h-4.5 px-1.5 text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200/50 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40"
            >
              {selectedFilters[0] === "__ALL_MATCHING__"
                ? "Tất cả"
                : selectedFilters.length}
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-muted-foreground/80 hover:text-foreground p-0"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Card Content */}
      {expanded && (
        <div className="px-3 pb-3 pt-0.5 space-y-2.5 animate-in fade-in duration-150">
          {/* Quick Sort Section (Segmented Control Style) */}
          {!descriptor.hideSort && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Sắp xếp
                </span>
              </div>
              <div className="flex p-0.5 rounded-lg bg-muted/60 gap-0.5">
                <button
                  type="button"
                  className={cn(
                    "flex-1 h-6 text-[11px] rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer",
                    sortState === TableSortState.ASC
                      ? "bg-surface text-primary font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() =>
                    onSortChange(
                      sortState === TableSortState.ASC
                        ? TableSortState.NONE
                        : TableSortState.ASC,
                    )
                  }
                >
                  <ArrowDownAZ className="h-3 w-3 shrink-0" />
                  <span>Tăng</span>
                </button>

                <button
                  type="button"
                  className={cn(
                    "flex-1 h-6 text-[11px] rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer",
                    sortState === TableSortState.DESC
                      ? "bg-surface text-primary font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() =>
                    onSortChange(
                      sortState === TableSortState.DESC
                        ? TableSortState.NONE
                        : TableSortState.DESC,
                    )
                  }
                >
                  <ArrowUpAZ className="h-3 w-3 shrink-0" />
                  <span>Giảm</span>
                </button>

                {sortState !== TableSortState.NONE && (
                  <button
                    type="button"
                    className="px-1.5 h-6 text-[10px] rounded-md text-muted-foreground hover:text-red-600 transition-colors cursor-pointer"
                    onClick={() => onSortChange(TableSortState.NONE)}
                    title="Bỏ sắp xếp"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controls For Number Columns */}
          {descriptor.type === ColumnValueType.NUMBER && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Toán tử số
                </span>
              </div>
              <Combobox
                options={NUMBER_OPERATOR_OPTIONS}
                value={pendingOperator || NumberFilterOperator.EQUALS}
                onChange={(v) =>
                  setPendingOperator(
                    (v as NumberFilterOperator) || NumberFilterOperator.EQUALS,
                  )
                }
                placeholder="Chọn toán tử..."
                className="w-full h-7 text-xs bg-muted/30 border-border/50"
              />

              {pendingOperator === NumberFilterOperator.BETWEEN ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Từ..."
                    className="h-7 text-xs bg-muted/30 border-border/50"
                    value={pendingNumFrom}
                    onChange={(e) =>
                      handleNumRangeChange(e.target.value, pendingNumTo)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Đến..."
                    className="h-7 text-xs bg-muted/30 border-border/50"
                    value={pendingNumTo}
                    onChange={(e) =>
                      handleNumRangeChange(pendingNumFrom, e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập giá trị..."
                    className="h-7 text-xs pr-7 bg-muted/30 border-border/50"
                    value={pendingSearch}
                    onChange={(e) => setPendingSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                  {pendingSearch && (
                    <button
                      type="button"
                      className="absolute right-2 text-muted-foreground/70 hover:text-foreground cursor-pointer"
                      onClick={() => setPendingSearch("")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Controls For Text Columns */}
          {descriptor.type === ColumnValueType.TEXT && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Điều kiện lọc văn bản
                </span>
              </div>
              <Combobox
                options={TEXT_OPERATOR_OPTIONS}
                value={pendingOperator || TextFilterOperator.CONTAINS}
                onChange={(v) =>
                  setPendingOperator(
                    (v as TextFilterOperator) || TextFilterOperator.CONTAINS,
                  )
                }
                placeholder="Chọn toán tử..."
                className="w-full h-7 text-xs bg-muted/30 border-border/50"
              />

              {pendingOperator !== TextFilterOperator.IS_EMPTY &&
                pendingOperator !== TextFilterOperator.IS_NOT_EMPTY && (
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      placeholder='Từ khóa ("..." hoặc a;b)'
                      className="pl-8 pr-7 h-7 text-xs bg-muted/30 border-border/50"
                      value={pendingSearch}
                      onChange={(e) => setPendingSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApply();
                        }
                      }}
                    />
                    {pendingSearch && (
                      <button
                        type="button"
                        className="absolute right-2 text-muted-foreground/70 hover:text-foreground cursor-pointer"
                        onClick={() => setPendingSearch("")}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
            </div>
          )}

          {/* Controls For Date Columns */}
          {descriptor.type === ColumnValueType.DATE && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                  Khoảng ngày
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <DatePicker
                  value={pendingDateFrom || ""}
                  onChange={(d) => setPendingDateFrom(d)}
                  placeholder="Từ ngày"
                  className="h-7 text-xs"
                />
                <DatePicker
                  value={pendingDateTo || ""}
                  onChange={(d) => setPendingDateTo(d)}
                  placeholder="Đến ngày"
                  className="h-7 text-xs"
                />
              </div>

              {/* Date Presets */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                <button
                  type="button"
                  className="h-5 px-2 rounded-md bg-muted/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => {
                    const p = initPeriod();
                    setPendingDateFrom(periodFirstDay(p));
                    setPendingDateTo(periodLastDay(p));
                  }}
                >
                  Tháng này
                </button>
                <button
                  type="button"
                  className="h-5 px-2 rounded-md bg-muted/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth()).padStart(2, "0");
                    const p = `${y}-${m === "00" ? "12" : m}`;
                    setPendingDateFrom(periodFirstDay(p));
                    setPendingDateTo(periodLastDay(p));
                  }}
                >
                  Tháng trước
                </button>
                <button
                  type="button"
                  className="h-5 px-2 rounded-md bg-muted/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    setPendingDateFrom(today);
                    setPendingDateTo(today);
                  }}
                >
                  Hôm nay
                </button>
              </div>
            </div>
          )}

          {/* Categorical Option List */}
          {(descriptor.type === ColumnValueType.SELECT ||
            descriptor.type === ColumnValueType.STATUS ||
            Boolean(descriptor.filterOptions || descriptor.fetchOptions)) && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
                Danh sách lựa chọn
              </span>
              <ColumnOptionList
                descriptor={descriptor}
                selectedValues={pendingFilters}
                onChangeSelected={setPendingFilters}
                allFilters={allFilters}
                searchValue={pendingSearch}
                onSearchChange={setPendingSearch}
              />
            </div>
          )}

          {/* Bottom Actions: Clear & Apply */}
          <div className="pt-2 flex items-center justify-between border-t border-border/40 mt-1">
            {hasActiveModifiers ? (
              <button
                type="button"
                className="h-6 px-1.5 text-[11px] text-muted-foreground/70 hover:text-red-600 inline-flex items-center gap-1 transition-colors cursor-pointer"
                onClick={handleClearColumn}
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Xóa lọc cột</span>
              </button>
            ) : (
              <div />
            )}
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="h-6 text-xs px-2.5"
              disabled={!hasPendingChanges && !hasActiveModifiers}
              onClick={handleApply}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
