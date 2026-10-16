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
import { formatCompositeFilterValue } from "@/shared/utils/format";
import { useTranslation } from "react-i18next";
import type { TableSortStateType, TableColumnAlignType } from "./types";

export interface TableColumnHeaderFilterProps {
  title: React.ReactNode;
  sortState: TableSortStateType;
  onSortChange: (state: "asc" | "desc" | "none") => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: { label: string; value: string }[];
  selectedFilters: string[];
  onFilterChange: (values: string[]) => void;
  align?: TableColumnAlignType;
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

export function setDropdownSearchState(columnKey: string, value: string) {
  if (!columnKey) return;
  dropdownSearchState.set(columnKey, value);
}

export function getDropdownSearchState(columnKey: string): string | undefined {
  if (!columnKey) return undefined;
  return dropdownSearchState.get(columnKey);
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
  const { t } = useTranslation("table");
  const effectiveHideFooter =
    hideFooter ?? (Boolean(dateRangeSlot) && Boolean(hideFilter));
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(() => {
    if (columnKey && getDropdownSearchState(columnKey) !== undefined) {
      return getDropdownSearchState(columnKey) || "";
    }
    return searchValue || "";
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

  const knownLabelsRef = useRef<Map<string, string>>(new Map());

  // Register known labels from filterOptions
  if (filterOptions) {
    for (const opt of filterOptions) {
      if (opt.value != null && opt.label != null) {
        knownLabelsRef.current.set(String(opt.value), String(opt.label));
      }
    }
  }

  // Register known labels from optionsData
  if (optionsData?.pages) {
    for (const page of optionsData.pages) {
      if (page.items) {
        for (const item of page.items) {
          if (typeof item === "object" && item !== null && item.value != null) {
            knownLabelsRef.current.set(
              String(item.value),
              String(item.label || item.value),
            );
          } else if (item != null) {
            knownLabelsRef.current.set(String(item), String(item));
          }
        }
      }
    }
  }

  const finalOptions = useMemo(() => {
    let opts: { label: string; value: string }[];
    const activeChecked = isAllMatchingMode
      ? []
      : pendingFilters.filter(
          (v) => v !== "__ALL_MATCHING__" && v !== "__BLANK__",
        );

    if (filterOptions && filterOptions.length > 0) {
      if (!localSearch) {
        opts = filterOptions;
      } else {
        const keywords = localSearch
          .split(";")
          .map((k) => k.trim())
          .filter(Boolean);
        if (keywords.length === 0) {
          opts = filterOptions;
        } else {
          const matchingOpts = filterOptions.filter((opt) => {
            const labelLower = (opt.label || "").toLowerCase();
            const valueLower = (opt.value || "").toLowerCase();
            return keywords.some((kw) => {
              let isExact = false;
              let cleanKw = kw;
              if (kw.startsWith('"') && kw.endsWith('"') && kw.length >= 2) {
                isExact = true;
                cleanKw = kw.slice(1, -1);
              }
              const kwLower = cleanKw.toLowerCase();
              if (isExact) {
                return labelLower === kwLower || valueLower === kwLower;
              }
              return (
                labelLower.includes(kwLower) || valueLower.includes(kwLower)
              );
            });
          });
          const matchingValues = new Set(matchingOpts.map((o) => o.value));
          const missingChecked = activeChecked
            .filter((v) => !matchingValues.has(v))
            .map((v) => {
              const found = filterOptions.find((o) => o.value === v);
              return (
                found || {
                  label:
                    knownLabelsRef.current.get(v) ||
                    formatCompositeFilterValue(v),
                  value: v,
                }
              );
            });
          opts = [...missingChecked, ...matchingOpts];
        }
      }
    } else if (columnKey) {
      const apiOptions = (
        optionsData?.pages.flatMap((p: any) => p.items) || []
      ).filter(
        (o: any) => o.value !== "" && o.value !== null && o.value !== undefined,
      );
      const apiValues = new Set(apiOptions.map((o: any) => o.value));
      const missingSelected = activeChecked
        .filter((v) => !apiValues.has(v))
        .map((v) => ({
          label: knownLabelsRef.current.get(v) || formatCompositeFilterValue(v),
          value: v,
        }));
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
    pendingFilters,
    isAllMatchingMode,
    localSearch,
    debouncedLocalSearch,
    showBlankOption,
  ]);

  // Restore local search when popover opens, or sync when searchValue is changed/cleared from outside
  useEffect(() => {
    if (open) {
      if (columnKey && getDropdownSearchState(columnKey) !== undefined) {
        setLocalSearch(getDropdownSearchState(columnKey) || "");
      } else {
        setLocalSearch(searchValue || "");
      }
    } else {
      if ((searchValue || "") !== localSearch) {
        setLocalSearch(searchValue || "");
        if (columnKey) setDropdownSearchState(columnKey, searchValue || "");
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

  const handleApply = () => {
    const trimmedSearch = localSearch.trim();
    if (pendingFilters.length > 0) {
      if (pendingFilters[0] === "__ALL_MATCHING__") {
        onFilterChange(["__ALL_MATCHING__", localSearch]);
        onSearchChange(trimmedSearch);
        if (columnKey) setDropdownSearchState(columnKey, trimmedSearch);
      } else {
        onFilterChange(pendingFilters);
        onSearchChange("");
        if (columnKey) setDropdownSearchState(columnKey, "");
      }
    } else if (trimmedSearch) {
      onSearchChange(trimmedSearch);
      onFilterChange([]);
      if (columnKey) setDropdownSearchState(columnKey, trimmedSearch);
    } else {
      onSearchChange("");
      onFilterChange([]);
      if (columnKey) setDropdownSearchState(columnKey, "");
    }
    setOpen(false);
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
          style={{
            background: "var(--popup-bg, rgba(246, 248, 252, 0.65))",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
          }}
          className={cn(
            "z-[9999] rounded-xl border border-border/70 p-0 shadow-[0_16px_40px_-8px_rgba(15,23,42,0.18),0_4px_12px_rgba(15,23,42,0.08),0_0_0_1px_rgba(255,255,255,0.6)_inset] outline-none",
            dateRangeSlot ? "w-72" : "w-64",
          )}
        >
          {!hideSort && (
            <div className="flex items-center gap-1.5 border-b border-border p-2">
              <div className="flex min-w-0 flex-1 rounded-lg border border-border/80 bg-muted/60 shadow-2xs overflow-hidden divide-x divide-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 min-w-0 flex-1 gap-1.5 rounded-none border-0 px-2 text-xs font-medium transition-all select-none cursor-pointer",
                    sortState === "asc"
                      ? "bg-surface text-primary font-semibold shadow-2xs"
                      : "bg-surface/80 hover:bg-surface text-foreground/80 hover:text-foreground",
                  )}
                  aria-label={t("sortAsc", "Sắp xếp tăng dần")}
                  title={t("sortAsc", "Sắp xếp tăng dần")}
                  onClick={() => {
                    onSortChange(sortState === "asc" ? "none" : "asc");
                    setOpen(false);
                  }}
                >
                  <ArrowDownAZ
                    size={14}
                    className={cn(
                      "shrink-0 transition-colors",
                      sortState === "asc"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span>{t("sortAscShort", "Tăng")}</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 min-w-0 flex-1 gap-1.5 rounded-none border-0 px-2 text-xs font-medium transition-all select-none cursor-pointer",
                    sortState === "desc"
                      ? "bg-surface text-primary font-semibold shadow-2xs"
                      : "bg-surface/80 hover:bg-surface text-foreground/80 hover:text-foreground",
                  )}
                  aria-label={t("sortDesc", "Sắp xếp giảm dần")}
                  title={t("sortDesc", "Sắp xếp giảm dần")}
                  onClick={() => {
                    onSortChange(sortState === "desc" ? "none" : "desc");
                    setOpen(false);
                  }}
                >
                  <ArrowUpAZ
                    size={14}
                    className={cn(
                      "shrink-0 transition-colors",
                      sortState === "desc"
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span>{t("sortDescShort", "Giảm")}</span>
                </Button>
              </div>
              {sortState !== "none" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 shrink-0 rounded-md p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={t("clearSort", "Bỏ sắp xếp")}
                  title={t("clearSort", "Bỏ sắp xếp")}
                  onClick={() => onSortChange("none")}
                >
                  <X size={14} />
                </Button>
              )}
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
                    placeholder={t(
                      "searchPlaceholder",
                      'Tìm... ("..." chính xác, ; nhiều từ)',
                    )}
                    title={t(
                      "searchTooltip",
                      'Mẹo: Dùng "text" để tìm chính xác, dùng a;b để tìm nhiều giá trị (OR)',
                    )}
                    className="pl-8 pr-8 h-8 text-xs"
                    value={localSearch}
                    onChange={(e) => {
                      setLocalSearch(e.target.value);
                      if (columnKey)
                        setDropdownSearchState(columnKey, e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApply();
                      }
                    }}
                  />
                  {localSearch && (
                    <button
                      className="absolute right-2 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setLocalSearch("");
                        if (columnKey) setDropdownSearchState(columnKey, "");
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
                            ? t(
                                "selectAllMatching",
                                "(Chọn tất cả kết quả tìm kiếm)",
                              )
                            : t(
                                "selectAllVisible",
                                "(Chọn tất cả đang hiển thị)",
                              )}
                        </span>
                      </label>
                      {finalOptions.map((opt) => {
                        const rawLabel = opt.label || opt.value || "";
                        const formattedComposite =
                          formatCompositeFilterValue(rawLabel);
                        const displayLabel = formatOptionLabel
                          ? formatOptionLabel(formattedComposite)
                          : formattedComposite === "(blank)" ||
                              !formattedComposite
                            ? t("blank", "(Trống)")
                            : formattedComposite;

                        return (
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
                              title={displayLabel}
                            >
                              {displayLabel}
                            </span>
                          </label>
                        );
                      })}
                      {isFetchingNextPage && (
                        <div className="p-2 flex justify-center text-muted-foreground">
                          <Loader2 size={14} className="animate-spin" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-2 text-center text-xs text-muted-foreground">
                      {t("noData", "Không có dữ liệu")}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          {!effectiveHideFooter && (
            <div className="p-2 border-t border-border flex justify-between items-center bg-muted/30 rounded-b-xl">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground hover:bg-transparent px-2 h-7"
                onClick={() => {
                  setPendingFilters([]);
                  setLocalSearch("");
                  if (columnKey) setDropdownSearchState(columnKey, "");
                  onSearchChange("");
                  onFilterChange([]);
                  onSortChange("none");
                  setOpen(false);
                }}
              >
                {t("clearFilter", "Xóa bộ lọc")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-7 px-3"
                onClick={handleApply}
              >
                {t("apply", "Áp dụng")}
              </Button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
