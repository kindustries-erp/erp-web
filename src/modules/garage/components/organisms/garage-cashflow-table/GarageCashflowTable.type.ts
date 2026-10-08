import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type {
  GarageCashflowItem,
  GarageCashflowStats,
} from "@/modules/garage/api/garageCashflowApi";

export type TableColumnStateReturn = ReturnType<typeof useTableColumnState>;

export interface GarageCashflowTableProps {
  onOpenCreate?: () => void;
  onEdit?: (item: GarageCashflowItem) => void;
  onDelete?: (item: GarageCashflowItem) => void;
  onOpenCase?: (caseId: string, caseCode: string) => void;
  className?: string;
}

export interface ColumnContext {
  t: (key: string, def?: string) => string;
  tableState: TableColumnStateReturn;
  dateRanges: Record<string, { from?: string; to?: string }>;
  onDateRangeChange: (
    col: string,
    range: { from?: string; to?: string },
  ) => void;
  onSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  onSearchChange: (key: string, val: string) => void;
  onFilterChange: (key: string, vals: string[]) => void;
  fetchCashflowColumnOptions: (params: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => Promise<{
    items: Array<{ label: string; value: string }>;
    total: number;
    next: number | null;
  }>;
  onOpenCase?: (caseId: string, caseCode: string) => void;
  onEdit?: (item: GarageCashflowItem) => void;
  onDelete?: (item: GarageCashflowItem) => void;
}

export interface CashflowSummaryRowParams {
  items: GarageCashflowItem[];
  stats?: GarageCashflowStats;
  page: number;
  pageSize: number;
  total: number;
  t: (key: string, def?: string) => string;
}
