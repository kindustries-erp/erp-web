import React, { useState, useEffect } from "react";
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

  // Local text/number input values before submitting / debouncing
  const [localText, setLocalText] = useState(searchValue);
  useEffect(() => {
    setLocalText(searchValue);
  }, [searchValue]);

  // Number range split (if operator is between: "10..50")
  const [numFrom, setNumFrom] = useState(() => {
    if (searchValue.includes("..")) return searchValue.split("..")[0] || "";
    return searchValue;
  });
  const [numTo, setNumTo] = useState(() => {
    if (searchValue.includes("..")) return searchValue.split("..")[1] || "";
    return "";
  });

  const handleNumRangeApply = (from: string, to: string) => {
    setNumFrom(from);
    setNumTo(to);
    if (!from && !to) {
      onSearchChange("");
    } else {
      onSearchChange(`${from}..${to}`);
    }
  };

  const isSearchActive = Boolean(searchValue && searchValue.trim().length > 0);
  const isFilterListActive = Boolean(
    selectedFilters && selectedFilters.length > 0,
  );
  const isSortActive = sortState !== TableSortState.NONE;
  const isDateActive = Boolean(dateFrom || dateTo);
  const hasActiveModifiers =
    isSearchActive || isFilterListActive || isSortActive || isDateActive;

  const handleClearColumn = () => {
    onSearchChange("");
    onFilterChange([]);
    onSortChange(TableSortState.NONE);
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
              {selectedFilters.length}
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
                    "flex-1 h-6 text-[11px] rounded-md flex items-center justify-center gap-1 transition-all",
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
                    "flex-1 h-6 text-[11px] rounded-md flex items-center justify-center gap-1 transition-all",
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
                    className="px-1.5 h-6 text-[10px] rounded-md text-muted-foreground hover:text-red-600 transition-colors"
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
                value={operator || NumberFilterOperator.EQUALS}
                onChange={(v) =>
                  onOperatorChange?.(
                    (v as NumberFilterOperator) || NumberFilterOperator.EQUALS,
                  )
                }
                placeholder="Chọn toán tử..."
                className="w-full h-7 text-xs bg-muted/30 border-border/50"
              />

              {operator === NumberFilterOperator.BETWEEN ? (
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Từ..."
                    className="h-7 text-xs bg-muted/30 border-border/50"
                    value={numFrom}
                    onChange={(e) => handleNumRangeApply(e.target.value, numTo)}
                  />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Đến..."
                    className="h-7 text-xs bg-muted/30 border-border/50"
                    value={numTo}
                    onChange={(e) =>
                      handleNumRangeApply(numFrom, e.target.value)
                    }
                  />
                </div>
              ) : (
                <div className="relative flex items-center">
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập giá trị..."
                    className="h-7 text-xs pr-7 bg-muted/30 border-border/50"
                    value={localText}
                    onChange={(e) => {
                      setLocalText(e.target.value);
                      onSearchChange(e.target.value);
                    }}
                  />
                  {localText && (
                    <button
                      type="button"
                      className="absolute right-2 text-muted-foreground/70 hover:text-foreground"
                      onClick={() => {
                        setLocalText("");
                        onSearchChange("");
                      }}
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
                value={operator || TextFilterOperator.CONTAINS}
                onChange={(v) =>
                  onOperatorChange?.(
                    (v as TextFilterOperator) || TextFilterOperator.CONTAINS,
                  )
                }
                placeholder="Chọn toán tử..."
                className="w-full h-7 text-xs bg-muted/30 border-border/50"
              />

              {operator !== TextFilterOperator.IS_EMPTY &&
                operator !== TextFilterOperator.IS_NOT_EMPTY && (
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      placeholder='Từ khóa ("..." hoặc a;b)'
                      className="pl-8 pr-7 h-7 text-xs bg-muted/30 border-border/50"
                      value={localText}
                      onChange={(e) => {
                        setLocalText(e.target.value);
                        onSearchChange(e.target.value);
                      }}
                    />
                    {localText && (
                      <button
                        type="button"
                        className="absolute right-2 text-muted-foreground/70 hover:text-foreground"
                        onClick={() => {
                          setLocalText("");
                          onSearchChange("");
                        }}
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
                  value={dateFrom || ""}
                  onChange={(d) => onDateRangeChange?.(d, dateTo)}
                  placeholder="Từ ngày"
                  className="h-7 text-xs"
                />
                <DatePicker
                  value={dateTo || ""}
                  onChange={(d) => onDateRangeChange?.(dateFrom, d)}
                  placeholder="Đến ngày"
                  className="h-7 text-xs"
                />
              </div>

              {/* Date Presets */}
              <div className="flex flex-wrap gap-1 pt-0.5">
                <button
                  type="button"
                  className="h-5 px-2 rounded-md bg-muted/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const p = initPeriod();
                    onDateRangeChange?.(periodFirstDay(p), periodLastDay(p));
                  }}
                >
                  Tháng này
                </button>
                <button
                  type="button"
                  className="h-5 px-2 rounded-md bg-muted/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth()).padStart(2, "0");
                    const p = `${y}-${m === "00" ? "12" : m}`;
                    onDateRangeChange?.(periodFirstDay(p), periodLastDay(p));
                  }}
                >
                  Tháng trước
                </button>
                <button
                  type="button"
                  className="h-5 px-2 rounded-md bg-muted/60 hover:bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const today = new Date().toISOString().slice(0, 10);
                    onDateRangeChange?.(today, today);
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
                selectedValues={selectedFilters}
                onChangeSelected={onFilterChange}
                allFilters={allFilters}
              />
            </div>
          )}

          {/* Clear Column Action */}
          {hasActiveModifiers && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                className="h-5 px-1.5 text-[11px] text-muted-foreground/70 hover:text-red-600 inline-flex items-center gap-1 transition-colors"
                onClick={handleClearColumn}
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Xóa lọc cột</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
