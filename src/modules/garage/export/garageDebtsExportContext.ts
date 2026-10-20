import type { GarageDebtsTableQuery } from "./garageExportScopes";

export type GarageDebtsExportKind = "all" | "customers" | "suppliers";

/** Bảng công nợ nào đang mở drawer, kèm điều kiện lọc của bảng đó. */
export interface GarageDebtsExportContext {
  kind: GarageDebtsExportKind;
  query?: GarageDebtsTableQuery;
  filterCount?: number;
}

/** Mốc ghi nhận công nợ (đồng bộ với `GARAGE_DEBT_BASELINE_DATE` của API). */
export const GARAGE_DEBT_BASELINE_DATE = "2026-07-01";

interface DebtsListState {
  searchQ: string;
  sorts: string[];
  dateFrom: string;
  dateTo: string;
  columnFilters: Record<string, string[]>;
  columnSearch: Record<string, string>;
  activeFilterCount: number;
}

/** Dựng điều kiện xuất từ state của hook danh sách (khách hàng / NCC). */
export function buildGarageDebtsExportContext(
  kind: GarageDebtsExportKind,
  list: DebtsListState,
): GarageDebtsExportContext {
  const hasFilters = Object.keys(list.columnFilters).length > 0;
  const hasSearch = Object.keys(list.columnSearch).length > 0;
  return {
    kind,
    filterCount: list.activeFilterCount,
    query: {
      from: list.dateFrom || undefined,
      to: list.dateTo || undefined,
      q: list.searchQ || undefined,
      sorts: list.sorts.length > 0 ? list.sorts : undefined,
      column_filters: hasFilters
        ? JSON.stringify(list.columnFilters)
        : undefined,
      column_search: hasSearch ? JSON.stringify(list.columnSearch) : undefined,
    },
  };
}
