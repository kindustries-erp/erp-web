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

// ── FilterPanel ──────────────────────────────────────────────────────────────

interface FilterPanelProps {
  config: FilterPanelConfig;
  filter: FilterPanelReturn;
  className?: string;
}

export function FilterPanel({ config, filter, className }: FilterPanelProps) {
  const t = useT();

  const content = (
    <div className="space-y-5">
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
          <div className="mt-2 space-y-2">
            <DatePicker
              value={filter.state.dateFrom}
              onChange={filter.setDateFrom}
              placeholder="Từ ngày"
            />
            <DatePicker
              value={filter.state.dateTo}
              onChange={filter.setDateTo}
              placeholder="Đến ngày"
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
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={filter.inputs.amountMin}
              onChange={(e) => filter.setAmountMinInput(e.target.value)}
              placeholder="Từ"
              className="w-full rounded-lg border border-border bg-[color:var(--muted)] px-3 py-2 text-xs text-foreground placeholder:text-[color:var(--faint)] focus:outline-none focus:border-primary transition-colors"
            />
            <input
              type="text"
              inputMode="numeric"
              value={filter.inputs.amountMax}
              onChange={(e) => filter.setAmountMaxInput(e.target.value)}
              placeholder="Đến"
              className="w-full rounded-lg border border-border bg-[color:var(--muted)] px-3 py-2 text-xs text-foreground placeholder:text-[color:var(--faint)] focus:outline-none focus:border-primary transition-colors"
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

  const header = (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 flex items-center justify-center bg-[color:var(--muted)] rounded-[7px]">
          <Filter className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Bộ lọc</span>
        {filter.hasActiveFilter && (
          <span className="bg-primary text-primary-fg text-[10px] font-semibold px-[7px] py-[2px] rounded-[20px]">
            {filter.activeFilterCount}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        {filter.hasActiveFilter && (
          <button
            type="button"
            onClick={filter.resetAll}
            className="p-1.5 rounded-md text-[color:var(--muted-fg)] hover:text-foreground hover:bg-[color:var(--muted)] transition-colors"
            title="Reset"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={filter.closePanel}
          className="p-1.5 rounded-md text-[color:var(--muted-fg)] hover:text-foreground hover:bg-[color:var(--muted)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: inline column — same style as dashboard cards */}
      <div
        className={cn(
          "hidden md:block shrink-0 self-start sticky top-0 overflow-hidden",
          "transition-[width,opacity,margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          filter.panelOpen
            ? "w-[280px] opacity-100 ml-5"
            : "w-0 opacity-0 ml-0",
          className,
        )}
      >
        <div
          className={cn(
            "w-[280px] rounded-xl p-4 bg-surface border border-border",
            "shadow-[0_2px_6px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.1)]",
            "overflow-y-auto max-h-[calc(100vh-120px)]",
            "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            filter.panelOpen
              ? "translate-x-0"
              : "translate-x-[calc(100%+20px)]",
          )}
        >
          {header}
          {content}
        </div>
      </div>

      {/* Mobile: full-screen slide from left */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 flex flex-col bg-surface",
          "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          filter.panelOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ pointerEvents: filter.panelOpen ? "auto" : "none" }}
      >
        <div className="px-4 pt-4 shrink-0">{header}</div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{content}</div>
      </div>
    </>
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
      <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em] mb-2 block">
        {label}
      </label>
      {children}
    </div>
  );
}
