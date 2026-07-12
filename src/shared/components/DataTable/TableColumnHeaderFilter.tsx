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
  requireSearchToFetchOptions?: boolean;
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
  requireSearchToFetchOptions,
}: TableColumnHeaderFilterProps) {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedLocalSearch = useDebounce(localSearch, 300);
  const scrollRef = useRef<HTMLDivElement>(null);

  const shouldFetchOptions =
    columnKey &&
    (!requireSearchToFetchOptions || debouncedLocalSearch.trim().length > 0);

  const {
    data: optionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isOptionsLoading,
  } = useInfiniteQuery({
    queryKey: [
      "inventory-stock-column-options",
      columnKey,
      debouncedLocalSearch,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!columnKey) return { items: [], total: 0, next: null };
      const res = await operationalApi.getInventoryStockColumnOptions(
        columnKey,
        debouncedLocalSearch,
        pageParam as number,
        20,
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
    if (columnKey) {
      if (requireSearchToFetchOptions && !debouncedLocalSearch.trim()) {
        return selectedFilters.map((v) => ({ label: v, value: v }));
      }
      const apiOptions = optionsData?.pages.flatMap((p: any) => p.items) || [];
      const apiValues = new Set(apiOptions.map((o: any) => o.value));
      const missingSelected = selectedFilters
        .filter((v) => !apiValues.has(v))
        .map((v) => ({ label: v, value: v }));
      return [...missingSelected, ...apiOptions];
    }
    return filterOptions || [];
  }, [
    optionsData,
    filterOptions,
    columnKey,
    selectedFilters,
    requireSearchToFetchOptions,
    debouncedLocalSearch,
  ]);

  // Sync local search when popover opens/closes
  useEffect(() => {
    if (open) {
      setLocalSearch(searchValue);
    }
  }, [open, searchValue]);

  const hasActiveFilters =
    searchValue || selectedFilters.length > 0 || sortState !== "none";

  const handleToggleFilter = (value: string) => {
    const next = selectedFilters.includes(value)
      ? selectedFilters.filter((v) => v !== value)
      : [...selectedFilters, value];
    onFilterChange(next);
  };

  const handleSelectAll = () => {
    if (selectedFilters.length === finalOptions.length) {
      onFilterChange([]);
    } else {
      onFilterChange(finalOptions.map((o) => o.value));
    }
  };

  const applySearch = () => {
    onSearchChange(localSearch);
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
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div
          className={cn(
            "flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors group select-none",
            align === "right" && "justify-end",
            align === "center" && "justify-center",
            className,
          )}
        >
          {title}
          <div
            className={cn(
              "flex items-center justify-center w-5 h-5 rounded-md transition-colors",
              hasActiveFilters
                ? "text-primary"
                : "text-muted-foreground/30 opacity-0 group-hover:opacity-100",
              open && "opacity-100 bg-muted",
            )}
          >
            <ListFilter size={14} />
          </div>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align={align === "right" ? "end" : "start"}
          sideOffset={8}
          className="z-[9999] w-64 rounded-xl border border-border bg-surface p-0 shadow-lg outline-none"
        >
          {/* Sorting */}
          <div className="p-2 border-b border-border flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start w-full text-left font-normal",
                sortState === "asc" && "bg-muted text-primary",
              )}
              onClick={() => onSortChange(sortState === "asc" ? "none" : "asc")}
            >
              <ArrowDownAZ size={14} className="mr-2" />
              Sắp xếp tăng dần
              {sortState === "asc" && <Check size={14} className="ml-auto" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start w-full text-left font-normal",
                sortState === "desc" && "bg-muted text-primary",
              )}
              onClick={() =>
                onSortChange(sortState === "desc" ? "none" : "desc")
              }
            >
              <ArrowUpAZ size={14} className="mr-2" />
              Sắp xếp giảm dần
              {sortState === "desc" && <Check size={14} className="ml-auto" />}
            </Button>
          </div>

          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm trong bảng..."
                className="pl-8 pr-8 h-8 text-xs"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch();
                }}
                onBlur={applySearch}
              />
              {localSearch && (
                <button
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setLocalSearch("");
                    onSearchChange("");
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Multi-select Filters */}
          <div
            className="p-2 max-h-48 overflow-y-auto flex flex-col"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {requireSearchToFetchOptions &&
            !debouncedLocalSearch.trim() &&
            finalOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Nhập từ khóa để tìm kiếm các lựa chọn...
              </div>
            ) : isOptionsLoading && finalOptions.length === 0 ? (
              <div className="p-4 flex justify-center text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
              </div>
            ) : finalOptions.length > 0 ? (
              <>
                <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer">
                  <Checkbox
                    checked={
                      selectedFilters.length === finalOptions.length &&
                      finalOptions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-xs font-medium">
                    (Chọn tất cả đang hiển thị)
                  </span>
                </label>
                {finalOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedFilters.includes(opt.value)}
                      onCheckedChange={() => handleToggleFilter(opt.value)}
                    />
                    <span className="text-xs truncate" title={opt.label}>
                      {opt.label || "(Trống)"}
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
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
