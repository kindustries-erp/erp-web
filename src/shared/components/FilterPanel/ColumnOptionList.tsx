import React, { useState, useMemo, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { operationalApi } from "@/modules/operational/api/operationalApi";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { ColumnFilterDescriptor } from "@/shared/components/DataTable/createColumnHeaderFilter";

interface ColumnOptionListProps {
  descriptor: ColumnFilterDescriptor;
  selectedValues: string[];
  onChangeSelected: (vals: string[]) => void;
  allFilters?: Record<string, string[]>;
}

export function ColumnOptionList({
  descriptor,
  selectedValues = [],
  onChangeSelected,
  allFilters,
}: ColumnOptionListProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAllMatchingMode = selectedValues[0] === "__ALL_MATCHING__";

  const filtersToPass = useMemo(() => {
    if (!allFilters || !descriptor.key) return {};
    const passed = { ...allFilters };
    delete passed[descriptor.key];
    return passed;
  }, [allFilters, descriptor.key]);

  const filtersStr = useMemo(
    () =>
      Object.keys(filtersToPass).length > 0
        ? JSON.stringify(filtersToPass)
        : undefined,
    [filtersToPass],
  );

  const shouldFetchOptions =
    !descriptor.filterOptions &&
    Boolean(descriptor.fetchOptions || descriptor.key);

  const {
    data: optionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isOptionsLoading,
  } = useInfiniteQuery({
    queryKey: [
      descriptor.queryKeyPrefix || "filter-panel-column-options",
      descriptor.key,
      debouncedSearch,
      filtersStr,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!descriptor.key) return { items: [], total: 0, next: null };
      if (descriptor.fetchOptions) {
        return descriptor.fetchOptions({
          columnKey: descriptor.key,
          search: debouncedSearch,
          pageParam: pageParam as number,
          filtersStr,
        });
      }
      const res = await operationalApi.getInventoryStockColumnOptions(
        descriptor.key,
        debouncedSearch,
        pageParam as number,
        20,
        filtersStr,
      );
      return {
        items: res.items.map((i: string) => ({ label: i, value: i })),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    getNextPageParam: (lastPage: any) => lastPage.next,
    enabled: shouldFetchOptions,
  });

  const finalOptions = useMemo(() => {
    let opts: { label: string; value: string }[] = [];
    if (descriptor.filterOptions && descriptor.filterOptions.length > 0) {
      if (!debouncedSearch) {
        opts = descriptor.filterOptions;
      } else {
        const keywords = debouncedSearch
          .split(";")
          .map((k) => k.trim())
          .filter(Boolean);
        if (keywords.length === 0) {
          opts = descriptor.filterOptions;
        } else {
          opts = descriptor.filterOptions.filter((opt) => {
            const labelLower = (opt.label || "").toLowerCase();
            const valueLower = (opt.value || "").toLowerCase();
            return keywords.some((kw) => {
              const kwLower = kw.toLowerCase();
              return (
                labelLower.includes(kwLower) || valueLower.includes(kwLower)
              );
            });
          });
        }
      }
    } else if (descriptor.key) {
      const apiOptions = (
        optionsData?.pages.flatMap((p: any) => p.items) || []
      ).filter(
        (o: any) => o.value !== "" && o.value !== null && o.value !== undefined,
      );
      const apiValues = new Set(apiOptions.map((o: any) => o.value));
      const missingSelected = isAllMatchingMode
        ? []
        : selectedValues
            .filter((v) => !apiValues.has(v) && v !== "__BLANK__")
            .map((v) => ({ label: v, value: v }));
      opts = [...missingSelected, ...apiOptions];
    }

    if (descriptor.showBlankOption) {
      opts = [{ label: "(Trống)", value: "__BLANK__" }, ...opts];
    }
    return opts;
  }, [
    optionsData,
    descriptor.filterOptions,
    descriptor.key,
    descriptor.showBlankOption,
    selectedValues,
    debouncedSearch,
    isAllMatchingMode,
  ]);

  const handleToggle = (val: string) => {
    if (isAllMatchingMode) {
      const all = finalOptions.map((o) => o.value);
      onChangeSelected(all.filter((v) => v !== val));
    } else {
      const next = selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val];
      onChangeSelected(next);
    }
  };

  const handleSelectAll = () => {
    if (descriptor.enableSelectAllMatching) {
      if (isAllMatchingMode) {
        onChangeSelected([]);
      } else {
        onChangeSelected(["__ALL_MATCHING__", search]);
      }
    } else {
      if (selectedValues.length === finalOptions.length) {
        onChangeSelected([]);
      } else {
        onChangeSelected(finalOptions.map((o) => o.value));
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

  return (
    <div className="space-y-1.5">
      {/* Search within options */}
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
        <Input
          placeholder="Tìm giá trị..."
          className="pl-8 pr-7 h-7 text-xs bg-muted/30 border-border/50 focus:bg-background"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="absolute right-2 text-muted-foreground/70 hover:text-foreground"
            onClick={() => setSearch("")}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Checkbox List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-36 overflow-y-auto space-y-0.5 pr-1 rounded-lg bg-muted/20 p-1"
      >
        {isOptionsLoading && finalOptions.length === 0 ? (
          <div className="py-3 flex justify-center text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </div>
        ) : finalOptions.length > 0 ? (
          <>
            <label className="flex items-center gap-2 px-1.5 py-1 hover:bg-muted/50 rounded-md cursor-pointer text-xs select-none transition-colors">
              <Checkbox
                checked={
                  descriptor.enableSelectAllMatching
                    ? isAllMatchingMode
                    : selectedValues.length === finalOptions.length &&
                      finalOptions.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <span className="font-semibold text-muted-foreground">
                (Chọn tất cả)
              </span>
            </label>
            {finalOptions.map((opt) => {
              const isChecked =
                isAllMatchingMode || selectedValues.includes(opt.value);
              const label = descriptor.formatOptionLabel
                ? descriptor.formatOptionLabel(opt.label)
                : opt.label;

              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-1.5 py-1 hover:bg-muted/50 rounded-md cursor-pointer text-xs select-none transition-colors"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleToggle(opt.value)}
                  />
                  <span
                    className="truncate flex-1 text-foreground"
                    title={label}
                  >
                    {label}
                  </span>
                </label>
              );
            })}
            {isFetchingNextPage && (
              <div className="py-1 flex justify-center text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
              </div>
            )}
          </>
        ) : (
          <div className="py-2 text-center text-[11px] text-muted-foreground">
            Không tìm thấy giá trị
          </div>
        )}
      </div>
    </div>
  );
}
