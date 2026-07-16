import type { ReactNode } from "react";
import type { Updater } from "@tanstack/react-table";
import type {
  FilterPanelConfig,
  FilterPanelReturn,
} from "@/shared/hooks/useFilterPanel";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";

export interface SpreadsheetPageTemplateProps<T> {
  // --- Header ---
  title: string;
  desc?: string;
  icon?: ReactNode;

  // --- Table Data & State ---
  tableId: string;
  items: T[];
  columns: DataTableColumn<T>[];
  defaultColumnOrder?: string[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyLabel?: string;
  minWidth?: number;

  // --- Pagination ---
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;

  // --- Actions & Controls ---
  onRefresh?: () => void;
  onCreate?: () => void;
  extraActions?: ReactNode;
  createLabel?: string;
  createActions?: ActionDropdownItem[];
  bulkActionsNode?: ReactNode;
  customActionsNode?: ReactNode;

  // --- Filter Panel ---
  filterConfig?: FilterPanelConfig;
  filter?: FilterPanelReturn;

  // --- Selection & Expansion ---
  enableRowSelection?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (updater: Updater<Record<string, boolean>>) => void;

  expandedRowKeys?: string[];
  renderSubRow?: (row: T) => ReactNode;

  // --- Sort & Actions ---
  sortArray?: string[];
  onSort?: (key: string) => void;
  rowActions?: (row: T) => ActionDropdownItem[];
  summaryRow?: Record<string, ReactNode>;

  // --- Drawers / Modals ---
  children?: ReactNode;

  // --- Row Interaction ---
  onRowClick?: (row: T) => void;
  loadingRows?: number;
}
