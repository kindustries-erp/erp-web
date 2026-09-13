import React, { useState, useMemo } from "react";
import { Filter, X, RotateCcw, Search } from "lucide-react";
import { cn } from "@/shared/utils";
import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { MultiSelect } from "@/shared/components/MultiSelect";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { PERIOD_OPTS } from "@/modules/finance/utils/financeHelpers";
import { useT } from "@/core/i18n";
import type {
  FilterPanelConfig,
  FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";
import type { DataTableColumn } from "@/shared/components/DataTable/types";
import type { TableListHookLike } from "@/shared/components/DataTable/createColumnHeaderFilter";
import {
  useUnifiedTableFilter,
  type UnifiedTableFilterReturn,
} from "@/shared/hooks/useUnifiedTableFilter";
import { ActiveFilterChips } from "./FilterPanel/ActiveFilterChips";
import { ColumnFilterCard } from "./FilterPanel/ColumnFilterCard";

// ── FilterButton (trigger) ───────────────────────────────────────────────────

export interface FilterButtonProps {
  onClick?: () => void;
  activeCount: number;
  onClear?: () => void;
  className?: string;
}

export function FilterButton({
  onClick,
  activeCount,
  onClear,
  className,
}: FilterButtonProps) {
  const t = useT();

  if (activeCount > 0) {
    if (onClear) {
      return (
        <div
          className={cn(
            "inline-flex items-stretch h-8 rounded-lg border border-border bg-surface text-foreground shadow-xs hover:border-border-hover transition-colors animate-in fade-in duration-150 overflow-hidden",
            className,
          )}
        >
          <Tooltip content={`${t("Bộ lọc")} (${activeCount})`}>
            <button
              type="button"
              onClick={onClick}
              className={cn(
                "flex items-center gap-1.5 px-2.5 text-xs font-semibold text-foreground transition-colors outline-none",
                onClick
                  ? "hover:bg-muted hover:text-foreground cursor-pointer"
                  : "cursor-default",
              )}
            >
              <Filter className="h-3.5 w-3.5 text-foreground shrink-0" />
              <span className="leading-none text-[11px] text-foreground font-bold">
                ({activeCount})
              </span>
            </button>
          </Tooltip>
          <Tooltip content={t("Xóa tất cả bộ lọc")}>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center justify-center px-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive border-l border-border/80 transition-colors outline-none cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        </div>
      );
    }

    return (
      <Tooltip content={`${t("Bộ lọc")} (${activeCount})`}>
        <Button
          variant="secondary"
          onClick={onClick}
          className={cn(
            "h-8 px-2.5 gap-1.5 shrink-0 border-primary/40 text-primary bg-primary/10 hover:bg-primary/15 font-semibold text-xs",
            className,
          )}
        >
          <Filter className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="leading-none text-[11px] text-primary font-bold">
            ({activeCount})
          </span>
        </Button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={t("Bộ lọc")}>
      <Button
        variant="secondary"
        size="icon"
        onClick={onClick}
        className={cn("relative h-8 w-8 px-0 shrink-0", className)}
      >
        <Filter className="h-4 w-4" />
      </Button>
    </Tooltip>
  );
}

// ── FilterPanel ──────────────────────────────────────────────────────────────

export interface FilterPanelProps<T = any> {
  config?: FilterPanelConfig;
  filter?: FilterPanelReturn;
  columns?: DataTableColumn<T>[];
  tableId?: string;
  listHook?: TableListHookLike;
  unifiedFilter?: UnifiedTableFilterReturn;
  className?: string;
}

export function FilterPanel<T = any>({
  config,
  filter: legacyFilter,
  columns,
  tableId,
  listHook,
  unifiedFilter: directUnifiedFilter,
  className,
}: FilterPanelProps<T>) {
  const t = useT();

  // Internal unified filter hook if directUnifiedFilter is not passed
  const internalUnifiedFilter = useUnifiedTableFilter({
    columns,
    tableId,
    listHook,
    filterConfig: config,
    filter: legacyFilter,
  });

  const filter = directUnifiedFilter || internalUnifiedFilter;

  // Search keyword for filtering columns list
  const [colSearchQuery, setColSearchQuery] = useState("");
  const [targetExpandedKey, setTargetExpandedKey] = useState<string | null>(
    null,
  );

  // Filter columns by column search query
  const visibleColumnDescriptors = useMemo(() => {
    if (!colSearchQuery.trim()) return filter.columnDescriptors;
    const q = colSearchQuery.toLowerCase().trim();
    return filter.columnDescriptors.filter(
      (desc) =>
        desc.titleText.toLowerCase().includes(q) ||
        desc.key.toLowerCase().includes(q),
    );
  }, [filter.columnDescriptors, colSearchQuery]);

  const handleChipClick = (colKey: string) => {
    setTargetExpandedKey(colKey);
    // Scroll element into view if present
    const el = document.getElementById(`filter-card-${colKey}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const header = (
    <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-6.5 h-6.5 flex items-center justify-center bg-primary/10 rounded-lg shrink-0">
          <Filter className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs font-bold text-foreground">
            {t("Bộ lọc")}
          </span>
          {filter.hasActiveFilters && (
            <span className="text-[11px] font-semibold text-primary">
              ({filter.activeFilterCount})
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5">
        {filter.hasActiveFilters && (
          <Tooltip content="Xóa tất cả bộ lọc">
            <Button
              variant="ghost"
              size="sm"
              title="Reset"
              onClick={filter.resetAll}
              className="h-6 px-1.5 text-[11px] text-muted-foreground/80 hover:text-red-600 gap-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Xóa hết</span>
            </Button>
          </Tooltip>
        )}
        <Tooltip content="Đóng bộ lọc">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={filter.closePanel}
            className="h-6 w-6 rounded-md text-muted-foreground/80 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );

  const legacySections = config &&
    legacyFilter &&
    filter.columnDescriptors.length === 0 && (
      <div className="space-y-3 pt-1">
        {config.period && (
          <FilterSection label={t("voucher.filter.period") || "Kỳ báo cáo"}>
            <Combobox
              options={PERIOD_OPTS}
              value={legacyFilter.state.period}
              onChange={(v) => legacyFilter.setPeriod(v ?? "")}
              placeholder={t("Chọn kỳ...")}
              className="w-full h-7 text-xs bg-muted/30 border-border/50"
            />
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <DatePicker
                value={legacyFilter.state.dateFrom}
                onChange={legacyFilter.setDateFrom}
                placeholder={t("Từ ngày")}
                className="h-7 text-xs"
              />
              <DatePicker
                value={legacyFilter.state.dateTo}
                onChange={legacyFilter.setDateTo}
                placeholder={t("Đến ngày")}
                className="h-7 text-xs"
              />
            </div>
          </FilterSection>
        )}

        {config.channel && (
          <FilterSection label={config.channel.label}>
            <Combobox
              options={config.channel.options}
              value={legacyFilter.state.channel}
              onChange={(v) => legacyFilter.setChannel(v ?? "")}
              placeholder={config.channel.placeholder || t("Tất cả")}
              className="w-full h-7 text-xs bg-muted/30 border-border/50"
            />
          </FilterSection>
        )}

        {config.status && (
          <FilterSection label="Trạng thái">
            <Combobox
              options={config.status.options}
              value={legacyFilter.state.status}
              onChange={(v) => legacyFilter.setStatus(v ?? "")}
              placeholder={config.status.placeholder || t("Tất cả")}
              className="w-full h-8 text-xs"
            />
          </FilterSection>
        )}

        {config.counterpartySource && (
          <FilterSection label="Đối tượng">
            <Combobox
              options={config.counterpartySource.options}
              value={legacyFilter.state.counterpartySource}
              onChange={(v) => legacyFilter.setCounterpartySource(v ?? "")}
              placeholder={config.counterpartySource.placeholder || t("Tất cả")}
              className="w-full h-7 text-xs bg-muted/30 border-border/50"
            />
          </FilterSection>
        )}

        {config.amountRange && (
          <FilterSection label="Số tiền">
            <div className="grid grid-cols-2 gap-1.5">
              <Input
                type="text"
                inputMode="numeric"
                value={legacyFilter.inputs.amountMin}
                onChange={(e) => legacyFilter.setAmountMinInput(e.target.value)}
                placeholder="Từ"
                className="h-7 text-xs bg-muted/30 border-border/50"
              />
              <Input
                type="text"
                inputMode="numeric"
                value={legacyFilter.inputs.amountMax}
                onChange={(e) => legacyFilter.setAmountMaxInput(e.target.value)}
                placeholder="Đến"
                className="h-7 text-xs bg-muted/30 border-border/50"
              />
            </div>
          </FilterSection>
        )}

        {config.custom?.map((f) => (
          <FilterSection key={f.key} label={f.label}>
            {f.type === "multi-select" ? (
              <MultiSelect
                options={f.options}
                value={
                  legacyFilter.state.custom[f.key]
                    ? legacyFilter.state.custom[f.key].split(",")
                    : []
                }
                onChange={(v) => legacyFilter.setCustom(f.key, v.join(","))}
                placeholder={f.placeholder}
              />
            ) : (
              <Combobox
                options={f.options}
                value={legacyFilter.state.custom[f.key] ?? ""}
                onChange={(v) => legacyFilter.setCustom(f.key, v ?? "")}
                placeholder={f.placeholder}
                className="w-full h-7 text-xs bg-muted/30 border-border/50"
                onSearch={f.onSearch}
                onScrollBottom={f.onLoadMore}
                loading={f.loading}
              />
            )}
          </FilterSection>
        ))}
      </div>
    );

  const content = (
    <div className="space-y-3">
      {/* 1. Active Filter Chips Ribbon */}
      <ActiveFilterChips
        chips={filter.activeChips}
        onRemoveChip={filter.removeChip}
        onChipClick={handleChipClick}
      />

      {/* 2. Column Search Input (Filter Columns) */}
      {filter.columnDescriptors.length > 0 && (
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Tìm cột cần lọc..."
            className="pl-8 pr-7 h-7.5 text-xs bg-muted/30 hover:bg-muted/50 border-border/50 focus:bg-background rounded-lg transition-colors"
            value={colSearchQuery}
            onChange={(e) => setColSearchQuery(e.target.value)}
          />
          {colSearchQuery && (
            <button
              type="button"
              className="absolute right-2 text-muted-foreground/70 hover:text-foreground"
              onClick={() => setColSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* 3. Interactive Column Cards */}
      {visibleColumnDescriptors.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Bộ lọc theo cột ({visibleColumnDescriptors.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {visibleColumnDescriptors.map((desc) => {
              const isSearchActive = Boolean(filter.columnSearch[desc.key]);
              const isFilterActive = Boolean(
                filter.columnFilters[desc.key]?.length,
              );
              const isSortActive = filter.sorts.some(
                (s) => s === desc.key || s === `-${desc.key}`,
              );
              const isDateActive =
                desc.type === "date" &&
                Boolean(filter.dateFrom || filter.dateTo);

              const isDefaultExpanded =
                isSearchActive ||
                isFilterActive ||
                isSortActive ||
                isDateActive ||
                targetExpandedKey === desc.key;

              let currentSortState = "none";
              if (filter.sorts.includes(desc.key)) currentSortState = "asc";
              else if (filter.sorts.includes(`-${desc.key}`))
                currentSortState = "desc";

              return (
                <ColumnFilterCard
                  key={desc.key}
                  descriptor={desc}
                  defaultExpanded={isDefaultExpanded}
                  searchValue={filter.columnSearch[desc.key] || ""}
                  onSearchChange={(val) =>
                    filter.setColumnSearch(desc.key, val)
                  }
                  selectedFilters={filter.columnFilters[desc.key] || []}
                  onFilterChange={(vals) =>
                    filter.setColumnFilter(desc.key, vals)
                  }
                  operator={filter.columnOperators[desc.key]}
                  onOperatorChange={(op) =>
                    filter.setColumnOperator(desc.key, op)
                  }
                  sortState={currentSortState as any}
                  onSortChange={(s) => filter.setSort(desc.key, s as any)}
                  dateFrom={filter.dateFrom}
                  dateTo={filter.dateTo}
                  onDateRangeChange={filter.setDateRange}
                  allFilters={filter.columnFilters}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Legacy / Custom Config Filters (if any) */}
      {legacySections}
    </div>
  );

  return (
    <>
      {/* Desktop: inline column matching full height of table + pagination */}
      <div
        className={cn(
          "hidden md:flex flex-col shrink-0 self-stretch sticky top-0 h-full max-h-full min-h-0",
          "transition-[width,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          filter.panelOpen
            ? "w-[320px] opacity-100 ml-3.5"
            : "w-0 opacity-0 ml-0 overflow-hidden pointer-events-none",
          className,
        )}
      >
        {filter.panelOpen && (
          <div
            className={cn(
              "w-[320px] rounded-xl p-3 bg-surface border border-border/60",
              "shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)]",
              "flex flex-col h-full max-h-full min-h-0",
              "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              filter.panelOpen
                ? "translate-x-0"
                : "translate-x-[calc(100%+20px)]",
            )}
          >
            <div className="shrink-0">{header}</div>
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pt-2.5 px-1 pb-1 scrollbar-thin">
              {content}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: full-screen slide from left */}
      {filter.panelOpen && (
        <div
          className={cn(
            "md:hidden fixed inset-0 z-50 flex flex-col bg-surface",
            "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            filter.panelOpen ? "translate-x-0" : "-translate-x-full",
          )}
          style={{ pointerEvents: filter.panelOpen ? "auto" : "none" }}
        >
          <div className="px-4 pt-4 shrink-0">{header}</div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

// ── Internal Section ─────────────────────────────────────────────────────────

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] text-[color:var(--muted-fg)] font-semibold uppercase tracking-[0.05em] mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
