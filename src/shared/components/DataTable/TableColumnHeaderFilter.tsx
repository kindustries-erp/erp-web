import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  ListFilter,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { operationalApi } from "@/modules/operational/api/operationalApi";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/shared/utils";

export interface TableColumnHeaderFilterProps {
  title: React.ReactNode;
  sortState: "asc" | "desc" | "none";
  onSortChange: (state: "asc" | "desc" | "none") => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: { label: string; value: string }[];
  selectedFilters: string[];
  onFilterChange: (values: string[]) => void;
  align?: "left" | "center" | "right";
  className?: string;
  columnKey?: string;
  queryKeyPrefix?: string;
  allFilters?: Record<string, string[]>;
  formatOptionLabel?: (label: string) => string;
  fetchOptions?: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{
    items: { label: string; value: string }[];
    total: number;
    next: number | null;
  }>;
  hideFilter?: boolean;
  hideFilterList?: boolean;
  hideFooter?: boolean;
  enableSelectAllMatching?: boolean;
  isActive?: boolean;
  showBlankOption?: boolean;
  hideSort?: boolean;
  /** Optional slot rendered between Sort buttons and Search input (e.g. a date range picker). Can be a function that receives a close function. */
  dateRangeSlot?:
    | React.ReactNode
    | ((props: { close: () => void }) => React.ReactNode);
}

const dropdownSearchState = new Map<string, string>();

export function clearAllDropdownSearchStates() {
  dropdownSearchState.clear();
}

export function TableColumnHeaderFilter({
  title,
  sortState,
  onSortChange,
  searchValue,
  onSearchChange,
  filterOptions,
  selectedFilters,
  onFilterChange,
  align = "left",
  className,
  columnKey,
  queryKeyPrefix,
  allFilters,
  formatOptionLabel,
  fetchOptions,
  hideFilter,
  hideFilterList,
  hideFooter,
  enableSelectAllMatching,
  isActive,
  dateRangeSlot,
  showBlankOption = false,
  hideSort = false,
}: TableColumnHeaderFilterProps) {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(() => {
    if (columnKey && dropdownSearchState.has(columnKey)) {
      return dropdownSearchState.get(columnKey) || "";
    }
    return searchValue;
  });
  const [pendingFilters, setPendingFilters] =
    useState<string[]>(selectedFilters);
  const debouncedLocalSearch = useDebounce(localSearch, 300);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAllMatchingMode = pendingFilters[0] === "__ALL_MATCHING__";

  useEffect(() => {
    if (isAllMatchingMode) {
      setPendingFilters(["__ALL_MATCHING__", debouncedLocalSearch]);
    }
  }, [debouncedLocalSearch]);

  const shouldFetchOptions = !!columnKey;

  const filtersToPass = useMemo(() => {
    if (!allFilters || !columnKey) return {};
    const passed = { ...allFilters };
    delete passed[columnKey];
    return passed;
  }, [allFilters, columnKey]);
  const filtersStr = useMemo(
    () =>
      Object.keys(filtersToPass).length > 0
        ? JSON.stringify(filtersToPass)
        : undefined,
    [filtersToPass],
  );

  const {
    data: optionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isOptionsLoading,
  } = useInfiniteQuery({
    queryKey: [
      queryKeyPrefix || "inventory-stock-column-options",
      columnKey,
      debouncedLocalSearch,
      filtersStr,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!columnKey) return { items: [], total: 0, next: null };
      if (fetchOptions) {
        return fetchOptions({
          columnKey,
          search: debouncedLocalSearch,
          pageParam: pageParam as number,
          filtersStr,
        });
      }
      const res = await operationalApi.getInventoryStockColumnOptions(
        columnKey,
        debouncedLocalSearch,
        pageParam as number,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((i) => ({ label: i, value: i })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    getNextPageParam: (lastPage: any) => lastPage.next,
    enabled: open && !!shouldFetchOptions,
  });

  const finalOptions = useMemo(() => {
    let opts: { label: string; value: string }[];
    if (filterOptions && filterOptions.length > 0) {
      if (!debouncedLocalSearch) {
        opts = filterOptions;
      } else {
        const searchLower = debouncedLocalSearch.toLowerCase();
        opts = filterOptions.filter(
          (opt) =>
            (opt.label || "").toLowerCase().includes(searchLower) ||
            (opt.value || "").toLowerCase().includes(searchLower),
        );
      }
    } else if (columnKey) {
      const apiOptions = optionsData?.pages.flatMap((p: any) => p.items) || [];
      const apiValues = new Set(apiOptions.map((o: any) => o.value));
      const isAllMatchingActive = selectedFilters[0] === "__ALL_MATCHING__";
      const missingSelected = isAllMatchingActive
        ? []
        : selectedFilters
            .filter((v) => !apiValues.has(v) && v !== "__BLANK__")
            .map((v) => ({ label: v, value: v }));
      opts = [...missingSelected, ...apiOptions];
    } else {
      opts = filterOptions || [];
    }

    if (showBlankOption) {
      opts = [{ label: "(blank)", value: "__BLANK__" }, ...opts];
    }
    return opts;
  }, [
    optionsData,
    filterOptions,
    columnKey,
    selectedFilters,
    debouncedLocalSearch,
    showBlankOption,
  ]);

  // Restore local search when popover opens
  useEffect(() => {
    if (open) {
      if (columnKey && dropdownSearchState.has(columnKey)) {
        setLocalSearch(dropdownSearchState.get(columnKey) || "");
      } else {
        setLocalSearch(searchValue);
      }
    }
  }, [open, searchValue, columnKey]);

  const isFilterActive =
    isActive || !!searchValue || selectedFilters.length > 0;
  const isSortActive = sortState !== "none";
  const hasActiveModifiers = isFilterActive || isSortActive;

  const handleToggleFilter = (value: string) => {
    const next = pendingFilters.includes(value)
      ? pendingFilters.filter((v) => v !== value)
      : [...pendingFilters, value];
    setPendingFilters(next);
  };

  const handleSelectAll = () => {
    if (enableSelectAllMatching) {
      if (isAllMatchingMode) {
        setPendingFilters([]);
      } else {
        setPendingFilters(["__ALL_MATCHING__", localSearch]);
      }
    } else {
      if (pendingFilters.length === finalOptions.length) {
        setPendingFilters([]);
      } else {
        setPendingFilters(finalOptions.map((o) => o.value));
      }
    }
  };

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setPendingFilters(selectedFilters);
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <div
          className={cn(
            "flex items-center gap-1 w-full cursor-pointer hover:text-foreground transition-colors group select-none",
            align === "right" && "justify-end",
            align === "center" && "justify-center",
            className,
          )}
        >
          {title}
          <div
            className={cn(
              "flex items-center justify-center rounded-md transition-colors relative gap-0.5 px-0.5 min-w-[20px] h-5",
              hasActiveModifiers
                ? "text-primary"
                : "text-muted-foreground/30 opacity-0 group-hover:opacity-100",
              open && "opacity-100 bg-muted",
            )}
          >
            {(!hasActiveModifiers || isFilterActive) && (
              <ListFilter size={14} />
            )}
            {isSortActive &&
              (sortState === "asc" ? (
                <ArrowDownAZ size={14} />
              ) : (
                <ArrowUpAZ size={14} />
              ))}
            {hasActiveModifiers && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
            )}
          </div>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align={align === "right" ? "end" : "start"}
          sideOffset={8}
          className={cn(
            "z-[9999] rounded-xl border border-border bg-surface p-0 shadow-lg outline-none",
            dateRangeSlot ? "w-72" : "w-64",
          )}
        >
          {!hideSort && (
            <div className="flex flex-col gap-1 border-b border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start font-normal rounded-sm h-8",
                  sortState === "asc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "",
                )}
                onClick={() => {
                  onSortChange(sortState === "asc" ? "none" : "asc");
                  setOpen(false);
                }}
              >
                <ArrowDownAZ size={14} className="mr-2" />
                Sắp xếp tăng dần
                {sortState === "asc" && <Check size={14} className="ml-auto" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "justify-start font-normal rounded-sm h-8",
                  sortState === "desc"
                    ? "bg-primary/10 text-primary font-medium"
                    : "",
                )}
                onClick={() => {
                  onSortChange(sortState === "desc" ? "none" : "desc");
                  setOpen(false);
                }}
              >
                <ArrowUpAZ size={14} className="mr-2" />
                Sắp xếp giảm dần
                {sortState === "desc" && (
                  <Check size={14} className="ml-auto" />
                )}
              </Button>
            </div>
          )}

          {/* Date range slot (e.g. for invoiceDate column) */}
          {typeof dateRangeSlot === "function"
            ? dateRangeSlot({ close: () => setOpen(false) })
            : dateRangeSlot}

          {!hideFilter && (
            <>
              {/* Search */}
              <div className="p-2 border-b border-border">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm trong bảng..."
                    className="pl-8 pr-8 h-8 text-xs"
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value);
                      if (columnKey)
                        dropdownSearchState.set(columnKey, e.target.value);
                    }}
                  />
                  {localSearch && (
                    <button
                      className="absolute right-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setLocalSearch("");
                        if (columnKey) dropdownSearchState.set(columnKey, "");
                      }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Multi-select Filters */}
              {!hideFilterList && (
                <div
                  className="p-2 max-h-48 overflow-y-auto flex flex-col"
                  ref={scrollRef}
                  onScroll={handleScroll}
                >
                  {isOptionsLoading && finalOptions.length === 0 ? (
                    <div className="p-4 flex justify-center text-muted-foreground">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  ) : finalOptions.length > 0 ? (
                    <>
                      <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">
                        <Checkbox
                          checked={
                            enableSelectAllMatching
                              ? isAllMatchingMode
                              : pendingFilters.length === finalOptions.length &&
                                finalOptions.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-xs font-medium">
                          {enableSelectAllMatching
                            ? "(Chọn tất cả kết quả tìm kiếm)"
                            : "(Chọn tất cả đang hiển thị)"}
                        </span>
                      </label>
                      {finalOptions.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer"
                        >
                          <Checkbox
                            checked={
                              isAllMatchingMode ||
                              pendingFilters.includes(opt.value)
                            }
                            onCheckedChange={() => {
                              if (isAllMatchingMode) {
                                const all = finalOptions.map((o) => o.value);
                                setPendingFilters(
                                  all.filter((v) => v !== opt.value),
                                );
                              } else {
                                handleToggleFilter(opt.value);
                              }
                            }}
                          />
                          <span
                            className="text-xs truncate"
                            title={
                              formatOptionLabel
                                ? formatOptionLabel(opt.label)
                                : opt.label
                            }
                          >
                            {formatOptionLabel
                              ? formatOptionLabel(opt.label)
                              : opt.label || "(Trống)"}
                          </span>
                        </label>
                      ))}
                      {isFetchingNextPage && (
                        <div className="p-2 flex justify-center text-muted-foreground">
                          <Loader2 size={14} className="animate-spin" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          {!hideFooter && (
            <div className="p-2 border-t border-border flex justify-between items-center bg-muted/50 rounded-b-xl">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent px-2 h-7"
                onClick={() => {
                  setPendingFilters([]);
                  setLocalSearch("");
                  if (columnKey) dropdownSearchState.set(columnKey, "");
                  onSearchChange("");
                  onFilterChange([]);
                  setOpen(false);
                }}
              >
                Xóa bộ lọc
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-7 px-3"
                onClick={() => {
                  onSearchChange(localSearch);
                  let finalFilters = pendingFilters;
                  if (pendingFilters[0] === "__ALL_MATCHING__") {
                    finalFilters = ["__ALL_MATCHING__", localSearch];
                  }
                  onFilterChange(finalFilters);
                  setOpen(false);
                }}
              >
                Áp dụng
              </Button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
