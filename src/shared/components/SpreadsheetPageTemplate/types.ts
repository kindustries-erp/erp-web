import type { ReactNode } from "react";
import type { Updater, VisibilityState } from "@tanstack/react-table";
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
  hideHeader?: boolean;

  // --- Table Data & State ---
  tableId: string;
  items: T[];
  columns: DataTableColumn<T>[];
  defaultColumnOrder?: string[];
  defaultColumnVisibility?: VisibilityState;
  getRowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  emptyLabel?: string;
  minWidth?: number;
  actionColumnSize?: number;

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
  createIcon?: ReactNode;
  createActions?: ActionDropdownItem[];
  bulkActionsNode?: ReactNode;
  customActionsNode?: ReactNode;

  // --- Filter Panel ---
  filterConfig?: FilterPanelConfig;
  filter?: FilterPanelReturn;
  activeFilterCount?: number;
  onClearAllFilters?: () => void;

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
  enableRowHoverActions?: boolean;
  hideLegacyActionColumn?: boolean;
  summaryRow?: Record<string, ReactNode>;

  // --- Drawers / Modals ---
  children?: ReactNode;
  topNode?: ReactNode;

  // --- Row Interaction ---
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T, index: number) => string | undefined;
  enableRowContextMenu?: boolean;
  onRowContextMenu?: (item: T, index: number, event: React.MouseEvent) => void;
  loadingRows?: number;
}
