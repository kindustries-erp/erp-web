import { Filter, X, RotateCcw } from "lucide-react";
import { cn } from "@/shared/utils";
import { DatePicker } from "@/shared/components/DatePicker";
import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { PERIOD_OPTS } from "@/modules/finance/utils/financeHelpers";
import { useT } from "@/core/i18n";
import type {
  FilterPanelConfig,
  FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";

// ── FilterButton (trigger) ───────────────────────────────────────────────────

interface FilterButtonProps {
  onClick: () => void;
  activeCount: number;
  className?: string;
}

export function FilterButton({
  onClick,
  activeCount,
  className,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground hover:bg-[color:var(--muted)] transition-colors",
        activeCount > 0 && "border-primary/50 text-primary",
        className,
      )}
    >
      <Filter className="h-3.5 w-3.5" />
      <span>Bộ lọc</span>
      {activeCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-fg">
          {activeCount}
        </span>
      )}
    </button>
  );
}

// ── FilterPanel (inline right column) ────────────────────────────────────────

interface FilterPanelProps {
  config: FilterPanelConfig;
  filter: FilterPanelReturn;
  className?: string;
}

/**
 * Inline filter sidebar — renders as a column in the page grid.
 * NOT an overlay/modal. Toggled via `filter.panelOpen`.
 * Parent should wrap content + FilterPanel in a flex row.
 */
export function FilterPanel({ config, filter, className }: FilterPanelProps) {
  const t = useT();

  if (!filter.panelOpen) return null;

  return (
    <div
      className={cn(
        "w-[240px] shrink-0 rounded-xl border border-border bg-surface p-4 space-y-4 self-start sticky top-0",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">Bộ lọc</span>
          {filter.hasActiveFilter && (
            <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-medium">
              {filter.activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {filter.hasActiveFilter && (
            <button
              type="button"
              onClick={filter.resetAll}
              className="p-1 rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-[color:var(--muted)] transition-colors"
              title="Reset"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={filter.closePanel}
            className="p-1 rounded text-[color:var(--muted-fg)] hover:text-foreground hover:bg-[color:var(--muted)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {config.search && (
        <FilterSection label={t("voucher.filter.search") || "Tìm kiếm"}>
          <SearchInput
            value={filter.inputs.search}
            onChange={filter.setSearchInput}
            placeholder="Tìm số CT, đối tượng..."
            className="w-full"
          />
        </FilterSection>
      )}

      {config.period && (
        <FilterSection label={t("voucher.filter.period") || "Kỳ"}>
          <Combobox
            options={PERIOD_OPTS}
            value={filter.state.period}
            onChange={(v) => filter.setPeriod(v ?? "")}
            placeholder="Chọn kỳ..."
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
            <DatePicker
              value={filter.state.dateFrom}
              onChange={filter.setDateFrom}
              placeholder="Từ"
            />
            <DatePicker
              value={filter.state.dateTo}
              onChange={filter.setDateTo}
              placeholder="Đến"
            />
          </div>
        </FilterSection>
      )}

      {config.channel && (
        <FilterSection label={config.channel.label}>
          <Combobox
            options={config.channel.options}
            value={filter.state.channel}
            onChange={(v) => filter.setChannel(v ?? "")}
            placeholder={config.channel.placeholder}
            className="w-full"
          />
        </FilterSection>
      )}

      {config.status && (
        <FilterSection label="Trạng thái">
          <Combobox
            options={config.status.options}
            value={filter.state.status}
            onChange={(v) => filter.setStatus(v ?? "")}
            placeholder={config.status.placeholder || "Tất cả"}
            className="w-full"
          />
        </FilterSection>
      )}

      {config.counterpartySource && (
        <FilterSection label="Đối tượng">
          <Combobox
            options={config.counterpartySource.options}
            value={filter.state.counterpartySource}
            onChange={(v) => filter.setCounterpartySource(v ?? "")}
            placeholder={config.counterpartySource.placeholder || "Tất cả"}
            className="w-full"
          />
        </FilterSection>
      )}

      {config.amountRange && (
        <FilterSection label="Số tiền">
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              inputMode="numeric"
              value={filter.inputs.amountMin}
              onChange={(e) => filter.setAmountMinInput(e.target.value)}
              placeholder="Từ"
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-[color:var(--faint)] focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <input
              type="text"
              inputMode="numeric"
              value={filter.inputs.amountMax}
              onChange={(e) => filter.setAmountMaxInput(e.target.value)}
              placeholder="Đến"
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-[11px] text-foreground placeholder:text-[color:var(--faint)] focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </FilterSection>
      )}

      {config.custom?.map((f) => (
        <FilterSection key={f.key} label={f.label}>
          <Combobox
            options={f.options}
            value={filter.state.custom[f.key] ?? ""}
            onChange={(v) => filter.setCustom(f.key, v ?? "")}
            placeholder={f.placeholder}
            className="w-full"
          />
        </FilterSection>
      ))}
    </div>
  );
}

// ── Internal ─────────────────────────────────────────────────────────────────

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-[color:var(--muted-fg)] uppercase tracking-wide mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
