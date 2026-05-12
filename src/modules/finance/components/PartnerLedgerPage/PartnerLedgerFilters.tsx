import { Combobox } from "@/shared/components/Combobox";
import { SearchInput } from "@/shared/components/SearchInput";
import { inputCls } from "@/shared/components/DrawerModal";
import { cn } from "@/shared/utils";
import type { PartnerLedgerStatus } from "@/modules/finance/api/financeApi";
import { STATUS_OPTS } from "./constants";
import type { SelectOption, TFunc } from "./types";

interface PartnerLedgerFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  partnerOpts: SelectOption[];
  partnerFilter: string;
  setPartnerFilter: (value: string) => void;
  accountOpts: SelectOption[];
  accountFilter: string;
  setAccountFilter: (value: string) => void;
  statusFilter: PartnerLedgerStatus | "";
  setStatusFilter: (value: PartnerLedgerStatus | "") => void;
  dueFrom: string;
  setDueFrom: (value: string) => void;
  dueTo: string;
  setDueTo: (value: string) => void;
  overdueOnly: boolean;
  setOverdueOnly: (value: boolean) => void;
  resetFilters: () => void;
  applyFilter: (fn: () => void) => void;
  t: TFunc;
}

export function PartnerLedgerFilters({
  searchInput,
  setSearchInput,
  partnerOpts,
  partnerFilter,
  setPartnerFilter,
  accountOpts,
  accountFilter,
  setAccountFilter,
  statusFilter,
  setStatusFilter,
  dueFrom,
  setDueFrom,
  dueTo,
  setDueTo,
  overdueOnly,
  setOverdueOnly,
  resetFilters,
  applyFilter,
  t,
}: PartnerLedgerFiltersProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 mb-4 card-shadow flex flex-wrap gap-2 items-end">
      <SearchInput value={searchInput} onChange={setSearchInput} placeholder={t("ledger.filter.search")} className="w-48" />
      <FilterField label={t("ledger.filter.partner")}>
        <Combobox
          options={partnerOpts}
          value={partnerFilter}
          onChange={(v) => applyFilter(() => setPartnerFilter(v))}
          placeholder={t("ledger.filter.partnerPlaceholder")}
          className="w-44"
        />
      </FilterField>
      <FilterField label={t("ledger.filter.account")}>
        <Combobox
          options={accountOpts}
          value={accountFilter}
          onChange={(v) => applyFilter(() => setAccountFilter(v))}
          placeholder={t("ledger.filter.accountPlaceholder")}
          className="w-44"
        />
      </FilterField>
      <FilterField label={t("ledger.filter.status")}>
        <Combobox
          options={STATUS_OPTS}
          value={statusFilter}
          onChange={(v) => applyFilter(() => setStatusFilter(v as PartnerLedgerStatus | ""))}
          placeholder={t("ledger.filter.statusPlaceholder")}
          className="w-36"
        />
      </FilterField>
      <FilterField label={t("ledger.filter.dueFrom")}>
        <input type="date" className={cn(inputCls, "w-36 text-sm")} value={dueFrom} onChange={(e) => applyFilter(() => setDueFrom(e.target.value))} />
      </FilterField>
      <FilterField label={t("ledger.filter.dueTo")}>
        <input type="date" className={cn(inputCls, "w-36 text-sm")} value={dueTo} onChange={(e) => applyFilter(() => setDueTo(e.target.value))} />
      </FilterField>
      <label className="flex items-center gap-1 text-sm cursor-pointer mt-4">
        <input type="checkbox" checked={overdueOnly} onChange={(e) => applyFilter(() => setOverdueOnly(e.target.checked))} className="rounded" />
        {t("ledger.filter.overdueOnly")}
      </label>
      <button className="ml-auto text-xs text-[color:var(--muted-fg)] hover:text-foreground underline mt-4" onClick={resetFilters}>
        {t("ledger.filter.reset")}
      </button>
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[2px]">
      <label className="text-[10px] text-[color:var(--muted-fg)] font-medium uppercase tracking-[0.05em]">{label}</label>
      {children}
    </div>
  );
}
